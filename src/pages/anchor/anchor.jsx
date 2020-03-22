import React, { Component } from 'react'
import { Redirect} from "react-router-dom";
import Highlighter from 'react-highlight-words';
import './index.less'
import { Form, Icon, Input, Button, message, Tooltip, Modal, Dropdown, Menu, Spin} from 'antd'
import storageUtils from '../../utils/storageUtils'
import LinkButton from '../../components/link-button'
import { reqAnchors, reqAddAnchor, reqUpdateAnchor, reqDeleteAnchor } from '../../api'
import map from '../../assets/images/map.png'
import anchor from '../../assets/images/anchor.png'
import notSavedAnchor from '../../assets/images/notSaved.png'

const { confirm } = Modal;

const REAL_WIDTH = 55;  //地图实际大小
const REAL_HEIGH = 44;
const MAP_W = 700; //网页地图大小
const MAP_H = MAP_W/REAL_WIDTH*REAL_HEIGH;
const RATIO = MAP_W/REAL_WIDTH; //真实地图与网页地图比值
const ANCHOR_W = 30; //绘图anchor宽度
const ANCHOR_H = 30; //绘图anchor高度
const TRIGGER_RADIS = 15; //触发事件的半径

const Item = Form.Item // 不能写在import之前

class Home extends Component {
  constructor(props) {
    super(props);
    // this.canvas = React.createRef();

    this.state = {
      anchors: {},
      selectedId: '',
      scaling: 1, // 缩放比例
      addLoading: false,
      updateLoading: false, //修改按钮loading状态
      deleteLoading: false, //修改按钮loading状态
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
      showAdd: false,
      searchKey: '',
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

  addAnchor = async () => {
    const { canvasData, anchors, selectedId, scaling } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if(!err) {
        this.setState({addLoading: true});
        const {aId, x, y, A, N} = values
        this.props.form.resetFields();
        const result = await reqAddAnchor(aId, x, y, A.toString(), N.toString()); // A N 为数字0时会被判断为空
        if (result.code === 200) {
          let id = result.anchor.id;

          // 删除临时添加数据
          delete anchors[selectedId];
          delete canvasData.anchor[selectedId];
          // 添加新数据
          anchors[id] = result.anchor;
          canvasData.anchor[id] = {
            x: canvasData.map.x - canvasData.map.w/2 + anchors[id].coords[0]*RATIO*scaling,
            y: canvasData.map.y + canvasData.map.h/2 - anchors[id].coords[1]*RATIO*scaling,
            w: 2 * ANCHOR_W,
            h: 2 * ANCHOR_H,
          }
          this.originAnchorCanvas[id] = {
            x: canvasData.map.x - canvasData.map.w/2 + anchors[id].coords[0]*RATIO*scaling,
            y: canvasData.map.y + canvasData.map.h/2 - anchors[id].coords[1]*RATIO*scaling,
            w: ANCHOR_W,
            h: ANCHOR_H,
          }
          this.draw(canvasData);
          this.setState({ canvasData, anchors, selectedId: id})
          message.success("添加成功");
        }
        else {
          message.error("添加失败" + result.message)
        }
        this.setState({addLoading: false});
      }
    })
  }

  updateAnchor = (id) => {
    const { canvasData, anchors } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if(!err) {
        this.setState({updateLoading: true});
        const {aId, x, y, A, N} = values
        this.props.form.resetFields();
        const result = await reqUpdateAnchor(id, aId, x, y, A, N)
        if (result.code === 200) {
          anchors[id] = {
            _id: id,
            aId: aId,
            coords: [ parseFloat(x), parseFloat(y), parseFloat(A), parseFloat(N) ]
          };
          canvasData.anchor[id].notSaved = false;
          canvasData.anchor[id].notSavedType = '';
          this.originAnchorCanvas[id].x = canvasData.anchor[id].x;
          this.originAnchorCanvas[id].y = canvasData.anchor[id].y;
          this.draw(canvasData);
          this.setState({ anchors, canvasData });
          message.success("修改成功");
        }
        else {
          message.error("修改失败" + result.message)
        }
        this.setState({updateLoading: false});
      }
    })
  }

  deleteAnchor = async (id) => {
    const { canvasData, anchors } = this.state;
    this.setState({deleteLoading: true})
    this.props.form.resetFields();
    const result = await reqDeleteAnchor(id)
    if (result.code===200) {
      delete canvasData.anchor[id];
      delete anchors[id];
      delete this.originAnchorCanvas[id];
      this.draw(canvasData);
      this.setState({ canvasData, anchors, selectedId: ''});
      message.success("删除成功");
    }
    else {
      message.error("删除失败" + result.message)
    }
    this.setState({deleteLoading: false})
  }

  initCanvas () {
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

  listenMouse () {
    let x, y; // 当前鼠标位置
    // this.scaling = 1; // 缩放比例
    // let clickedId = '';
    let lastClickTime = 0;
    let lastClickLocation = { x: 0, y: 0 };

    // 移动靠近anchor时 放大图标
    const highlightAnchor = (e) => {
      const { canvasData, selectedId } = this.state;
      x = e.clientX - this.canvas.offsetLeft;
      y = e.clientY - this.canvas.offsetTop;

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

      // 记录鼠标点击时坐标
      let x_origin = e.clientX - this.canvas.offsetLeft;
      let y_origin = e.clientY - this.canvas.offsetTop;
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
            x = e.clientX - this.canvas.offsetLeft;
            y = e.clientY - this.canvas.offsetTop;

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
          x = e.clientX - this.canvas.offsetLeft;
          y = e.clientY - this.canvas.offsetTop;

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

  move (canvasData, offset_x, offset_y) {
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
  // 缩放
  zoom (canvasData, scaling) {
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
  draw (canvasData) {
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
    });
  }

  drawLine (from_x, from_y, to_x, to_y) {
    this.ctx.beginPath();
    // 设置线宽
    this.ctx.lineWidth = 1;
    // 设置间距（参数为无限数组，虚线的样式会随数组循环）
    this.ctx.setLineDash([8, 8]);
    // 移动画笔至坐标 x20 y20 的位置
    this.ctx.moveTo(from_x, from_y);
    // 绘制到坐标 x20 y100 的位置
    this.ctx.lineTo(to_x, to_y);
    // 填充颜色
    this.ctx.strokeStyle="red";
    // 开始填充
    this.ctx.stroke();
    this.ctx.closePath();

    // this.ctx.beginPath();
    // // 设置线宽
    // this.ctx.lineWidth = 1;
    // // 设置间距（参数为无限数组，虚线的样式会随数组循环）
    // // this.ctx.setLineDash([8, 8]);
    // // 移动画笔至坐标 x20 y20 的位置
    // this.ctx.moveTo(0, 0);
    // // 绘制到坐标 x20 y100 的位置
    // this.ctx.lineTo(100, 100);
    // var gradient = this.ctx.createLinearGradient(0, 0, 100, 100);
    // gradient.addColorStop(0, "rgba(0,255,100,0.9)");
    // gradient.addColorStop(1, "rgba(255,255,255,0.1)");
    // // 填充颜色
    // this.ctx.strokeStyle=gradient;
    // // 开始填充
    // this.ctx.stroke();
    // this.ctx.closePath();
  }

  clickAdd () {
    const { canvasData, anchors, scaling } = this.state;
    // 取消所有anchor图标大小
    Object.keys(canvasData.anchor).forEach((id) => {
      canvasData.anchor[id].w = ANCHOR_W;
      canvasData.anchor[id].h = ANCHOR_H;
    });
    // 创建临时新anchor
    let newAnchorId = Math.random().toString(36).slice(-8);
    while (anchors[newAnchorId]) {
      newAnchorId = Math.random().toString(36).slice(-8);
    }

    anchors[newAnchorId] = {
      aId: '',
      coords: [0, 0, -80, 0],
    };
    canvasData.anchor[newAnchorId] = {
      x: canvasData.map.x - canvasData.map.w/2 + anchors[newAnchorId].coords[0]*RATIO*scaling,
      y: canvasData.map.y + canvasData.map.h/2 + anchors[newAnchorId].coords[1]*RATIO*scaling,
      w: 2 * ANCHOR_W,
      h: 2 * ANCHOR_H,
      notSaved: true,
      notSavedType: 'add',
    };

    // 将新anchor移到中心
    let offset_x = this.canvas.width/2 - canvasData.anchor[newAnchorId].x;
    let offset_y = this.canvas.height/2 - canvasData.anchor[newAnchorId].y;
    let canvasData_aftermove = this.move(canvasData, offset_x, offset_y);
    this.draw(canvasData_aftermove);
    this.setState({ selectedId: newAnchorId, showAdd: true, canvasData: canvasData_aftermove, anchors });
  }

  componentDidMount(){
    this.isMount = true;
    Promise.resolve(this.getAnchors()).then(() => {
      if (this.isMount) {
        this.initCanvas();
        this.listenMouse();
      }
    })
  }

  // 离开页面取消异步操作
  componentWillUnmount() {
    this.isMount = false;
    this.setState = (state, callback) => {
      return
    }
  }

  render() {
    const user = storageUtils.getUser()
    if(user.level !== "admin") {
      message.warn("无权访问")
      return <Redirect to='/login'/>
    }

    const { anchors, canvasData, scaling, selectedId, addLoading, updateLoading, deleteLoading, showAdd, searchKey } = this.state;
    let scaling_after = scaling;

    const { getFieldDecorator } = this.props.form;

    const layout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };

    // 搜索结果
    const searchResult = (
      <Menu
        style={{height: 200, overflow: 'auto'}}
        onClick={(item) => {
          // 将搜索选中的anchor移动到中心
          let offset_x = this.canvas.width/2 - canvasData.anchor[item.key].x;
          let offset_y = this.canvas.height/2 - canvasData.anchor[item.key].y;

          let canvasData_aftermove = this.move(canvasData, offset_x, offset_y);
          if (selectedId) {
            canvasData_aftermove.anchor[selectedId].w = ANCHOR_W;
            canvasData_aftermove.anchor[selectedId].h = ANCHOR_H;
          }
          canvasData_aftermove.anchor[item.key].w = 2 * ANCHOR_W;
          canvasData_aftermove.anchor[item.key].h = 2 * ANCHOR_H;
          this.draw(canvasData_aftermove);
          this.setState({ canvasData: canvasData_aftermove, selectedId: item.key })
        }}
      >
        {Object.keys(anchors).map((id) =>  {
          if (anchors[id].aId) {
            // 刷选搜索结果
            return anchors[id].aId.includes(searchKey) ? (
              <Menu.Item key={id}>
                <Highlighter
                  highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                  searchWords={[searchKey]}
                  autoEscape
                  textToHighlight={anchors[id].aId}
                />
              </Menu.Item>
            ) : null
          } else {
            return null;
          }
        })}
      </Menu>
    );

    return (
      <div>
        <div className='map'>
          <canvas id="myCanvas" width="1200" height="620"></canvas>
        </div>
        <div className="map-control">
          <LinkButton
            onClick={() => {
              scaling_after += 0.1;
              let canvasData_afterzoom = this.zoom(canvasData, scaling_after);
              this.draw (canvasData_afterzoom);
              this.setState({ canvasData: canvasData_afterzoom, scaling: scaling_after });
            }}
          >
            <Icon type="zoom-in" style={{ fontSize: '20px' }} />
          </LinkButton>
          <LinkButton
            onClick={() => {
              scaling_after -= 0.1;
              if (scaling_after <0.5) {
                scaling_after = 0.5;
              }
              let canvasData_afterzoom = this.zoom(canvasData, scaling_after);
              this.draw (canvasData_afterzoom);
              this.setState({ canvasData: canvasData_afterzoom, scaling: scaling_after });
            }}
          >
            <Icon type="zoom-out" style={{ fontSize: '20px' }}/>
          </LinkButton>
          <LinkButton
            onClick={() => {
              // 还原比例
              scaling_after = 1;
              // 还原地图坐标为中心
              let offset_x = this.canvas.width/2 - canvasData.map.x;
              let offset_y = this.canvas.height/2 - canvasData.map.y;
              let canvasData_aftermove = this.move(canvasData, offset_x, offset_y);
              let canvasData_afterzoom = this.zoom(canvasData_aftermove, scaling_after);
              this.draw (canvasData_afterzoom);
              this.setState({ canvasData: canvasData_afterzoom, scaling: scaling_after });
            }}
          >
            <Icon type="redo" style={{ fontSize: '20px' }}/>
          </LinkButton>
          <div>{parseInt(scaling*100)}%</div>
        </div>
        <div className='data-control'>
          <div className="search-add">
            <Dropdown overlay={searchResult}  trigger={['click']}>
              <Input
                placeholder="根据aId查询"
                suffix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
                onChange={(event) => {this.setState({searchKey: event.target.value})}}
              />
            </Dropdown>
            <Button onClick={() => {this.clickAdd()}} >
              <Icon type='plus'/>
            </Button>
            {/* <LinkButton>
              <Icon type="more" />
            </LinkButton> */}
          </div>
          {!selectedId ? null : (
          <div className="anchor-form">
            <Form hideRequiredMark>
              <Item label="aId" {...layout}>
                {getFieldDecorator('aId', {
                  initialValue: !selectedId ? '' : anchors[selectedId].aId,
                  validateFirst: true,
                  rules: [
                    { required: true, message: 'aId不能为空' },
                  ]
                })(
                  <Input
                    // disabled={!selectedId ? true : false}
                  />
                )}
              </Item>
              <Item label="x" {...layout}>
                {getFieldDecorator("x", {
                  initialValue: !selectedId ? '' : anchors[selectedId].coords[0].toFixed(2),
                  validateFirst: true,
                  rules: [
                    { validator: (rule, value, callback) => {
                      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(value)) {
                        callback('请输入合法数值');
                      } else if (parseFloat(value) > 55 || parseFloat(value) < 0) {
                        callback('数值范围0 ~ 55');
                      } else {
                        callback();
                      }
                    }},
                    // { required: true, message: "请输入合法数值" },
                    // { pattern: /^[0-9]+(\.)?[0-9]+$/, message: "请输入合法数值" },
                    // { transform: (value) => parseFloat(value) },
                    // // { type: 'number' }
                  ]
                })(
                  <Input
                    onChange={(event) => {
                      if (selectedId && event.target.value && !isNaN(event.target.value)) {
                        anchors[selectedId].coords[0] = parseFloat(event.target.value);
                        canvasData.anchor[selectedId].x =  canvasData.map.x -  canvasData.map.w/2 +  anchors[selectedId].coords[0]*RATIO*scaling;
                        this.draw(canvasData);
                        this.setState({canvasData, anchors});
                      }
                    }}
                    suffix={
                      <Tooltip title="输入范围：0 ~ 55，单位：米">
                        <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    }
                  />
                )}
              </Item>
              <Item label="y" {...layout} >
                {getFieldDecorator("y", {
                  initialValue: !selectedId ? '' : anchors[selectedId].coords[1].toFixed(2),
                  rules: [
                    { validator: (rule, value, callback) => {
                      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(value)) {
                        callback('请输入合法数值');
                      } else if (parseFloat(value) > 44 || parseFloat(value) < 0) {
                        callback('数值范围0 ~ 44');
                      } else {
                        callback();
                      }
                    }},
                  ]
                })(
                  <Input
                    onChange={(event) => {
                      if (selectedId) {
                        anchors[selectedId].coords[1] = parseFloat(event.target.value);
                        canvasData.anchor[selectedId].y =  canvasData.map.y + canvasData.map.h/2 - anchors[selectedId].coords[1]*RATIO*scaling;
                        this.draw(canvasData);
                        this.setState({canvasData, anchors});
                      }
                    }}
                    suffix={
                      <Tooltip title="输入范围：0 ~ 44，单位：米">
                        <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    }
                  />
                )}
              </Item>
              <Item label="A" {...layout}>
                {getFieldDecorator("A", {
                  initialValue: !selectedId ? '' : anchors[selectedId].coords[2],
                  rules: [
                    { validator: (rule, value, callback) => {
                      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(value)) {
                        callback('请输入合法数值');
                      } else if (parseFloat(value) > -30 || parseFloat(value) < -80) {
                        callback('数值范围-80 ~ -30');
                      } else {
                        callback();
                      }
                    }},
                  ]
                })(
                  <Input
                    suffix={
                      <Tooltip title="参考信号强度, 范围：-80 ~ -30">
                        <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    }
                  />
                )}
              </Item>
              <Item label="N" {...layout}>
                {getFieldDecorator("N", {
                  initialValue: !selectedId ? '' : anchors[selectedId].coords[3],
                  rules: [
                    { validator: (rule, value, callback) => {
                      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(value)) {
                        callback('请输入合法数值');
                      } else if (parseFloat(value) > 4 || parseFloat(value) < 0) {
                        callback('数值范围0 ~ 4');
                      } else {
                        callback();
                      }
                    }},
                  ]
                })(
                  <Input
                    suffix={
                      <Tooltip title="环境因子, 范围：0 ~ 4">
                        <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    }
                  />
                )}
              </Item>
              {showAdd ? null : (
              <div>
                <div className="update-btn">
                  <Button loading={updateLoading} onClick={() => this.updateAnchor(selectedId)}>
                    提交修改
                  </Button>
                </div>
                <div className="update-btn">
                  <Button onClick={() => {
                    canvasData.anchor[selectedId].x = this.originAnchorCanvas[selectedId].x;
                    canvasData.anchor[selectedId].y = this.originAnchorCanvas[selectedId].y;
                    canvasData.anchor[selectedId].notSaved = false;
                    canvasData.anchor[selectedId].notSavedType = '';
                    anchors[selectedId].coords[0] = (canvasData.anchor[selectedId].x - canvasData.map.x + canvasData.map.w/2)/RATIO/scaling;
                    anchors[selectedId].coords[1] = (canvasData.anchor[selectedId].y - canvasData.map.y + canvasData.map.h/2)/RATIO/scaling;
                    this.draw(canvasData);
                    this.setState({ canvasData, anchors });
                  }}>
                    撤销移动
                  </Button>
                </div>
                <div className="delete-btn">
                  <Button
                    loading={deleteLoading}
                    onClick={() => {
                      let _this = this;
                      confirm({
                        title: '是否删除该anchor？',
                        onOk() {
                          _this.deleteAnchor(selectedId);
                        },
                        onCancel() {},
                      });
                    }}>
                    删除
                  </Button>
                </div>
              </div>
              )}
              {!showAdd ? null : (
              <div>
                <div className="update-btn">
                  <Button loading={addLoading} onClick={() => this.addAnchor()}>
                    确定添加
                  </Button>
                </div>
                <div className="delete-btn">
                  <Button loading={deleteLoading}
                    onClick={() => {
                      delete anchors[selectedId];
                      delete canvasData.anchor[selectedId];
                      this.setState({ selectedId: '', showAdd: false});
                    }}>
                    取消
                  </Button>
                </div>
              </div>
              )}
            </Form>
          </div>
          )}
        </div>
      </div>
    )
  }
}

export default Form.create()(Home)
