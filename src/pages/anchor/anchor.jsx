import React, { Component } from 'react'
import { Redirect} from "react-router-dom";
import ResizeObserver from 'resize-observer-polyfill';
import './index.less'
import { Form, Icon, message } from 'antd'
import storageUtils from '../../utils/storageUtils'
import LinkButton from '../../components/link-button'
import { reqAnchors } from '../../api'
import map from '../../assets/images/map.png'
import anchor from '../../assets/images/anchor.png'
import notSavedAnchor from '../../assets/images/notSaved.png'
import DataControl from './data-control'

const REAL_WIDTH = 55;  //地图实际大小
const REAL_HEIGH = 44;
const MAP_W = 700; //网页地图大小
const MAP_H = MAP_W/REAL_WIDTH*REAL_HEIGH;
const RATIO = MAP_W/REAL_WIDTH; //真实地图与网页地图比值
const ANCHOR_W = 30; //绘图anchor宽度
const ANCHOR_H = 30; //绘图anchor高度
const TRIGGER_RADIS = 15; //触发事件的半径


class Anchor extends Component {
  constructor(props) {
    super(props);
    // this.canvas = React.createRef();

    this.state = {
      selectedId: '',
      anchors: {},
      canvasData: {}, // 储存画图所需数据
      /*  示例
      canvasData = {
        "map":{
          "x":600, //地图中心坐标x
          "y":310, //地图中心坐标y
          "w":750, //地图宽
          "h":600  //地图高
        },
        "anchor":{
          "10001-00437":{
            "x":861.409090909091,   //anchor中心坐标x
            "y":269.77272727272725, //anchor中心坐标y
            "w":30,                 //anchor宽
            "h":30                  //anchor高
          },
          "10001-00438":{
            "x":304.0909090909091,
            "y":451.8181818181818,
            "w":30,
            "h":30
          }
        }
      }
      */
      scaling: 1, // 缩放比例
      showAdd: false,
      canvasWidth: 0,
      canvasHeight: 0,
    }
  }

  getAnchors = async () => {
    const hide = message.loading('数据加载中', 0)
    let result = await reqAnchors();
    if (result.code === 200) {
      let anchors = {};
      result.anchors.forEach((value) => {
        anchors[value.id] = value;
      })
      this.setState({ anchors })
    } else {
      message.error("获取数据失败" + result.message);
    }
    hide();
    message.success('数据加载完成');
  }

  initCanvas = () => {
    this.canvas = document.getElementById("myCanvas")
    // this.canvas = this.canvas.current;
    this.ctx = this.canvas.getContext("2d");

    const { anchors } = this.state;
    let canvasData = {};
    canvasData.map = {
      x: this.canvas.width/2,
      y: this.canvas.height/2,
      w: MAP_W,
      h: MAP_H,
    };
    canvasData.anchor = {};

    Object.keys(anchors).forEach((id) => {
      canvasData.anchor[id] = {
        x: canvasData.map.x - canvasData.map.w/2 + anchors[id].coords[0]*RATIO,
        y: canvasData.map.y + canvasData.map.h/2 - anchors[id].coords[1]*RATIO,
        w: ANCHOR_W,
        h: ANCHOR_H,
      };
    });

    //记录原始anchor坐标，用于绘制移动后原位置图和虚线图
    this.originAnchorCanvas = JSON.parse(JSON.stringify(canvasData.anchor));

    // 画出地图和所有anchor
    this.img = new Image();
    this.img_anchor = new Image();
    this.img_notsaved_anchor = new Image();
    this.img.src = map;
    this.img.onload = () => {
      this.ctx.drawImage(
        this.img,
        canvasData.map.x - canvasData.map.w/2,
        canvasData.map.y - canvasData.map.h/2,
        canvasData.map.w,
        canvasData.map.h,
      );
      // anchor在map画完之后再画
      this.img_anchor.src = anchor;
      this.img_anchor.onload = () => {
        Object.keys(canvasData.anchor).forEach((id) => {
          this.ctx.drawImage(
            this.img_anchor,
            canvasData.anchor[id].x - canvasData.anchor[id].w/2,
            canvasData.anchor[id].y - canvasData.anchor[id].h/2,
            canvasData.anchor[id].h,
            canvasData.anchor[id].w,
          );
        });
      }
      // 移动未保存和添加未保存显示为灰色图标
      this.img_notsaved_anchor.src = notSavedAnchor;
      this.img_notsaved_anchor.onload = () => {
        this.ctx.drawImage(this.img_notsaved_anchor, 0, 0, 0, 0);
      }
    };
    this.setState({ canvasData });
  }

  // canvas监听事件
  listenMouse = () => {
    let x, y; // 当前鼠标位置
    // this.scaling = 1; // 缩放比例
    // let clickedId = '';
    let lastClickTime = 0;
    let lastClickLocation = { x: 0, y: 0 };
    let canvasBox; // 获取canvas的包围盒对象

    // 移动靠近anchor时 放大图标
    const highlightAnchor = (e) => {
      const { canvasData, selectedId } = this.state;
      // 获取canvas的包围盒对象
      canvasBox = this.canvas.getBoundingClientRect();
      x = e.clientX - canvasBox.left;
      y = e.clientY - canvasBox.top;
      // console.log("highlight",x ,y);
      console.log(canvasBox);
      Object.keys(canvasData.anchor).forEach((id) => {
        this.ctx.beginPath();
        this.ctx.arc(canvasData.anchor[id].x, canvasData.anchor[id].y, TRIGGER_RADIS, 0, Math.PI*2);
        // 判断鼠标是否在范围内
        if (id !== selectedId) {
          if (this.ctx.isPointInPath(x, y)) {
            canvasData.anchor[id].w = 2 * ANCHOR_W;
            canvasData.anchor[id].h = 2 * ANCHOR_H;
            this.draw(canvasData);

          } else {
            canvasData.anchor[id].w = ANCHOR_W;
            canvasData.anchor[id].h = ANCHOR_H;
            this.draw(canvasData);
          }
        }
      })
    };
    // 鼠标移动事件
    this.canvas.onmousemove = highlightAnchor

    // 鼠标点击事件
    this.canvas.onmousedown =  (e) => {
      const { canvasData, scaling, anchors, selectedId } = this.state;
      let isInAnchor = false;

      // 获取canvas的包围盒对象
      canvasBox = this.canvas.getBoundingClientRect();
      // 记录鼠标点击时坐标
      let x_origin = e.clientX - canvasBox.left;
      let y_origin = e.clientY - canvasBox.top;
      // console.log("down",x, y);

      Object.keys(canvasData.anchor).forEach((id) => {

        this.ctx.beginPath();
        this.ctx.arc(canvasData.anchor[id].x, canvasData.anchor[id].y, selectedId === id ? 2*TRIGGER_RADIS : TRIGGER_RADIS, 0, Math.PI*2);
        // 判断鼠标是否在anchor范围内
        if (this.ctx.isPointInPath(x, y)) {
          // 点击anchor
          isInAnchor = true;
          // clickedId = id;

          // 点击图标后放大，其他图标还原大小
          if (selectedId) {
            canvasData.anchor[selectedId].w = ANCHOR_W;
            canvasData.anchor[selectedId].h = ANCHOR_H;
          }
          canvasData.anchor[id].w = 2 * ANCHOR_W;
          canvasData.anchor[id].h = 2 * ANCHOR_H;

          this.draw(canvasData);
          this.props.form.resetFields(['x', 'y']);
          this.setState({ canvasData, selectedId: id, showAdd: canvasData.anchor[id].notSavedType === 'add' ? true : false });

          // 记录移动前数据
          // 对象深度拷贝，浅拷贝{...obj}
          let anchors_before = JSON.parse(JSON.stringify(anchors));
          let canvasData_before = JSON.parse(JSON.stringify(canvasData));

          // 移动anchor
          this.canvas.onmousemove = (e) => {
            // 获取canvas的包围盒对象
            canvasBox = this.canvas.getBoundingClientRect();
            x = e.clientX - canvasBox.left;
            y = e.clientY - canvasBox.top;

            // 计算坐标偏移
            anchors[id].coords[0] = anchors_before[id].coords[0] + (x -x_origin)/RATIO/scaling;
            anchors[id].coords[1] = anchors_before[id].coords[1] - (y -y_origin)/RATIO/scaling;
            canvasData.anchor[id].x = canvasData_before.anchor[id].x + x - x_origin;
            canvasData.anchor[id].y = canvasData_before.anchor[id].y + y - y_origin;
            canvasData.anchor[id].notSaved = true;
            canvasData.anchor[id].notSavedType = canvasData.anchor[id].notSavedType === 'add' ?  'add' : 'move' //如果为保存状态为add 则不修改

            this.draw(canvasData);
            this.setState({ anchors, canvasData })
          }
        }
      })

      if (!isInAnchor) {
        // 点击地图
        // this.props.form.resetFields();

        // 双击地图时所有anchor还原大小
        let clickTime = new Date().getTime();

        // 判断两次点击时间差
        if (clickTime - lastClickTime < 200
          && lastClickLocation.x === x_origin
          && lastClickLocation.y === y_origin) {

          Object.keys(canvasData.anchor).forEach((id) => {
            canvasData.anchor[id].w = ANCHOR_W;
            canvasData.anchor[id].h = ANCHOR_H;
          });
          this.draw(canvasData);
          this.setState({ selectedId: '', canvasData });
        }
        // 记录上次点击时间和坐标
        lastClickTime = clickTime;
        lastClickLocation.x = x_origin;
        lastClickLocation.y = y_origin;

        // 记录移动前地图坐标，anchor坐标
        let canvasData_before = JSON.parse(JSON.stringify(canvasData));
        let originAnchorCanvas_before = JSON.parse(JSON.stringify(this.originAnchorCanvas));

        // 移动地图
        this.canvas.onmousemove = (e) => {
          // 获取canvas的包围盒对象
          canvasBox = this.canvas.getBoundingClientRect();
          x = e.clientX - canvasBox.left;
          y = e.clientY - canvasBox.top;

          // 这里不能使用this.move 来修改坐标，因为鼠标移动是一个累积量
          canvasData.map.x = canvasData_before.map.x + x -x_origin;
          canvasData.map.y = canvasData_before.map.y + y -y_origin;

          Object.keys(canvasData.anchor).forEach((id) => {
            canvasData.anchor[id].x = canvasData_before.anchor[id].x + x - x_origin;
            canvasData.anchor[id].y = canvasData_before.anchor[id].y + y - y_origin;
          });

          Object.keys(this.originAnchorCanvas).forEach((id) => {
            this.originAnchorCanvas[id].x = originAnchorCanvas_before[id].x + x - x_origin;
            this.originAnchorCanvas[id].y = originAnchorCanvas_before[id].y + y - y_origin;
          })

          this.draw(canvasData);
          this.setState({ canvasData });
        }
      }
      // 监听鼠标抬起事件
      this.canvas.onmouseup = (e) => {
        this.canvas.onmousemove = highlightAnchor;
        this.canvas.onmouseup = null;
      };
    }

    //缩放
    this.canvas.onmousewheel = (e) => {
      const { canvasData, scaling } = this.state;
      let scaling_after = scaling;
      if (e.wheelDelta > 0) {
        scaling_after += 0.1;
      } else {
        scaling_after -= 0.1;
      }
      // 限制缩放最小为0.5
      if (scaling_after <0.5) {
        scaling_after = 0.5;
      }
      let canvasData_afterzoom = this.zoom(canvasData, scaling_after);
      this.draw (canvasData_afterzoom);
      this.setState({ canvasData_afterzoom, scaling: scaling_after });
    };
  }

  // 移动修改坐标
  move = (canvasData, offset_x, offset_y) => {
    canvasData.map.x = canvasData.map.x + offset_x;
    canvasData.map.y = canvasData.map.y + offset_y;

    Object.keys(canvasData.anchor).forEach((id) => {
      canvasData.anchor[id].x = canvasData.anchor[id].x + offset_x;
      canvasData.anchor[id].y = canvasData.anchor[id].y + offset_y;
    });
    Object.keys(this.originAnchorCanvas).forEach((id) => {
      this.originAnchorCanvas[id].x = this.originAnchorCanvas[id].x + offset_x;
      this.originAnchorCanvas[id].y = this.originAnchorCanvas[id].y + offset_y;
    });
    return canvasData;
  }
  // 缩放修改坐标
  zoom = (canvasData, scaling) => {
    let canvasData_before = JSON.parse(JSON.stringify(canvasData));
    canvasData.map.w = MAP_W*scaling;
    canvasData.map.h = MAP_H*scaling;

    Object.keys(canvasData.anchor).forEach((id) => {
      canvasData.anchor[id].x = canvasData.map.x - (canvasData.map.x - canvasData.anchor[id].x)*canvasData.map.w/canvasData_before.map.w;
      canvasData.anchor[id].y = canvasData.map.y - (canvasData.map.y - canvasData.anchor[id].y)*canvasData.map.h/canvasData_before.map.h;
    });

    Object.keys(this.originAnchorCanvas).forEach((id) => {
      this.originAnchorCanvas[id].x = canvasData.map.x - (canvasData.map.x - this.originAnchorCanvas[id].x)*canvasData.map.w/canvasData_before.map.w;
      this.originAnchorCanvas[id].y = canvasData.map.y - (canvasData.map.y - this.originAnchorCanvas[id].y)*canvasData.map.h/canvasData_before.map.h;
    })
    return canvasData;
  }

  // 画地图和所有anchor
  draw = (canvasData) => {
    const { map, anchor } = canvasData;
    // 清空canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.img,
      map.x - map.w/2,
      map.y - map.h/2,
      map.w,
      map.h,
    );
    Object.keys(anchor).forEach((id) => {
      // 判断是否未保存，未保存用灰色图标
      let img;
      if (anchor[id].notSaved) {
        img = this.img_notsaved_anchor;
        // 如果未保存且为移动状态， 绘图原坐标和虚线
        if (anchor[id].notSavedType === 'move') {
          this.drawLine(
            this.originAnchorCanvas[id].x,
            this.originAnchorCanvas[id].y,
            anchor[id].x,
            anchor[id].y,
          );
          this.ctx.drawImage(
            this.img_anchor,
            this.originAnchorCanvas[id].x - this.originAnchorCanvas[id].w/2,
            this.originAnchorCanvas[id].y - this.originAnchorCanvas[id].h/2,
            this.originAnchorCanvas[id].h,
            this.originAnchorCanvas[id].w,
          );
        }
      } else {
        img = this.img_anchor;
      }
      this.ctx.drawImage(
        img,
        anchor[id].x - anchor[id].w/2,
        anchor[id].y - anchor[id].h/2,
        anchor[id].h,
        anchor[id].w,
      );
      if (this.state.selectedId === id) {
        this.drawCoord(
          anchor[id].x,
          anchor[id].y,
          this.state.anchors[id].coords[0],
          this.state.anchors[id].coords[1],
        )
      }
    });
  }

  // 绘制移动后和移动前anchor间连线
  drawLine = (from_x, from_y, to_x, to_y) => {
    // this.ctx.beginPath();
    // // 设置线宽
    // this.ctx.lineWidth = 1;
    // // 设置间距（参数为无限数组，虚线的样式会随数组循环）
    // this.ctx.setLineDash([8, 8]);
    // // 移动画笔至坐标 x20 y20 的位置
    // this.ctx.moveTo(from_x, from_y);
    // // 绘制到坐标 x20 y100 的位置
    // this.ctx.lineTo(to_x, to_y);
    // // 填充颜色
    // this.ctx.strokeStyle="red";
    // // 开始填充
    // this.ctx.stroke();
    // this.ctx.closePath();

    this.ctx.beginPath();
    // 设置线宽
    this.ctx.lineWidth = 2;
    // 设置间距（参数为无限数组，虚线的样式会随数组循环）
    this.ctx.setLineDash([4, 4]);
    // 移动画笔至坐标 x20 y20 的位置
    this.ctx.moveTo(from_x, from_y);
    // 绘制到坐标 x20 y100 的位置
    this.ctx.lineTo(to_x, to_y);
    var gradient = this.ctx.createLinearGradient(from_x, from_y, to_x, to_y);
    gradient.addColorStop(0, "rgba(216,30,6,1)");
    gradient.addColorStop(1, "rgba(191,191,191,1)");
    // 填充颜色
    this.ctx.strokeStyle=gradient;
    // 开始填充
    this.ctx.stroke();
    this.ctx.closePath();
  }

  // 在绘制anchor下方绘制坐标
  drawCoord = (x, y, real_x, real_y) => {
    this.ctx.textAlign='center';
		this.ctx.textBaseline='middle';
		this.ctx.font="14px SimSun, Songti SC";
		this.ctx.fillText(`(${real_x.toFixed(2)}, ${real_y.toFixed(2)})`, x, y + 20);
  }

  // 获得父组件的长宽位置
  refHandle = (cw) => { // containerWrap
    if (cw) {
      const ro = new ResizeObserver((entries, observer) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const entry of entries) {
          const { left, top, width, height } = entry.contentRect;
          // console.log(`Element's size: ${width} x ${height} `);
          this.setState({ canvasWidth: width });
        }
      });
      ro.observe(cw);
    }
  }

  // 数据变化时重新绘图,并且setstate相关值
  reDraw = (data) => {
    this.draw(data.canvasData);
    this.setState({...data});
  }

  // 地图控制： 地图放大
  zoomIn = () => {
    const { canvasData, scaling } = this.state;
    let scaling_after = scaling;
    scaling_after += 0.1;
    let canvasData_afterzoom = this.zoom(canvasData, scaling_after);
    this.reDraw({ canvasData: canvasData_afterzoom, scaling: scaling_after })
  }

  // 地图控制： 地图缩小
  zoomOut = () => {
    const { canvasData, scaling } = this.state;
    let scaling_after = scaling;
    scaling_after -= 0.1;
    // 缩小最多50%
    if (scaling_after <0.5) {
      scaling_after = 0.5;
    }
    let canvasData_afterzoom = this.zoom(canvasData, scaling_after);
    this.reDraw({ canvasData: canvasData_afterzoom, scaling: scaling_after })
  }

  // 地图控制： 地图还原大小
  redo = () => {
    const { canvasData, scaling } = this.state;
    let scaling_after = scaling;
    // 还原比例
    scaling_after = 1;
    // 还原地图坐标为中心
    let offset_x = this.canvas.width/2 - canvasData.map.x;
    let offset_y = this.canvas.height/2 - canvasData.map.y;
    let canvasData_aftermove = this.move(canvasData, offset_x, offset_y);
    let canvasData_afterzoom = this.zoom(canvasData_aftermove, scaling_after);
    this.reDraw({ canvasData: canvasData_afterzoom, scaling: scaling_after })
  }

  componentDidMount = () => {
    this.isMount = true;
    Promise.resolve(this.getAnchors()).then(() => {
      if (this.isMount) {
        this.initCanvas();
        this.listenMouse();
      }
    })
  }

  componentDidUpdate = () => {
    if (this.canvas) { // 防止canvas未渲染时进入
      // 浏览器缩放后重新画图
      this.draw(this.state.canvasData)
    }
  }

  // 离开页面取消异步操作
  componentWillUnmount = () => {
    this.isMount = false;
    this.setState = (state, callback) => {
      return
    }
  }

  render = () => {
    const user = storageUtils.getUser()
    if(user.level !== "admin") {
      message.warn("无权访问")
      return <Redirect to='/login'/>
    }

    const { scaling, canvasWidth } = this.state;

    return (
      <div>
        <div className='map' ref={this.refHandle}>
          {canvasWidth && <canvas id="myCanvas" width={canvasWidth} height="620"></canvas>}
        </div>
        <div className="map-control">
          <LinkButton onClick={this.zoomIn}>
            <Icon type="zoom-in" style={{ fontSize: '20px' }} />
          </LinkButton>
          <LinkButton onClick={this.zoomOut}>
            <Icon type="zoom-out" style={{ fontSize: '20px' }}/>
          </LinkButton>
          <LinkButton onClick={this.redo}>
            <Icon type="redo" style={{ fontSize: '20px' }}/>
          </LinkButton>
          <div>{parseInt(scaling*100)}%</div>
        </div>
        <DataControl
          state={this.state}
          reDraw={this.reDraw}
          moveAnchorToCentre={this.moveAnchorToCentre}
          clickAdd={this.clickAdd}
          addCancel={this.addCancel}
          originAnchorCanvas={this.originAnchorCanvas}
          canvas={this.canvas}
          move={this.move}
        />
      </div>
    )
  }
}

export default Form.create()(Anchor)
