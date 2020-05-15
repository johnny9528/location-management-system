import React, { Component } from 'react'
// import { Redirect} from "react-router-dom";
import ResizeObserver from 'resize-observer-polyfill';
import { Form, Icon, message } from 'antd'
import { connect } from 'react-redux'

import './index.less'
// import storageUtils from '../../utils/storageUtils'
import LinkButton from '../../components/link-button'
import { reqTags, reqUserTags, reqAnchors, reqUserAnchors } from '../../api'
import mapPic from '../../assets/images/map.png'
import anchorPic from '../../assets/images/anchor.png'
import tagPic from '../../assets/images/tag.png'
import tagBeforePic from '../../assets/images/tag_before.png'
import notSavedAnchorPic from '../../assets/images/notSaved.png'
import DataControl from './data-control'
import AddForm from './add-form'
import UpdateForm from './update-form'
import { initWebsocket } from '../../redux/actions'
import {
  MAP_W,
  MAP_H,
  RATIO,
  ANCHOR_W,
  ANCHOR_H,
  TAG_W,
  TAG_H,
  TRIGGER_RADIS,
} from '../../config/mapConfig'


class Anchor extends Component {
  constructor(props) {
    super(props);
    // this.canvas = React.createRef();

    this.state = {
      // selectedId: '',
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
        }，
        "tag":{
          "tId": "10001-04096",
          "coord": [
            {"x": 1, "y": 1},
            {"x": 2, "y": 2},
          ]
        },
      }
      */
      tags: [],
      scaling: 1, // 缩放比例
      showAdd: false, // 添加时显示add界面
      showAnchor: true, // 是否显示anchor
      canvasWidth: 1200,
      canvasHeight: 620,
      tagHistoryCount: 0, // 历史tag定位个数
      selectedRowKeys: [], // tag table选中的tag的tId数组
      showModal: '', // 控制显示添加修改界面
      tableLoading: false, // 控制表格加载状态
    }
  }

  getAnchors = async () => {
    // 如果store中有anchors则直接使用
    if (Object.keys(this.props.anchors).length > 0) {
      this.setState({ anchors: this.props.anchors })
      return;
    }
    console.log("load anchors for api");
    let result
    if (this.user.level === 'admin') {
      result = await reqAnchors();
    } else if (this.user.level === 'user') {
      result = await reqUserAnchors();
    }
    if (result.code === 200) {
      let anchors = {};
      result.anchors.forEach((value) => {
        anchors[value.id] = value;
      })
      this.setState({ anchors })
    } else {
      message.error("获取anchor数据失败" + result.message);
    }
  }

  getTags = async () => {
    // 如果store中有tags则直接使用
    if (this.props.tags.length > 0) {
      const tags = this.props.tags;
      this.setState({
        tags: tags,
        selectedRowKeys: [...tags.map((item) => item._id)],
      })
      return;
    }

    this.setState({tableLoading: true})
    let result;
    if (this.user.level === 'admin') {
      result = await reqTags();
    } else if (this.user.level === 'user') {
      result = await reqUserTags();
    }
    if (result.code === 200) {
      this.setState({
        tags: result.tag,
        selectedRowKeys: [...result.tag.map((item) => item._id)],
      })
    } else {
      message.error("获取tag数据失败" + result.message);
    }
    this.setState({tableLoading: false})
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
    // canvasData.originAnchorCanvas = JSON.parse(JSON.stringify(canvasData.anchor));
    this.originAnchorCanvas = JSON.parse(JSON.stringify(canvasData.anchor));

    // 画出地图和所有anchor
    this.img_map = new Image();
    this.img_anchor = new Image();
    this.img_notsaved_anchor = new Image();
    this.img_tag = new Image();
    this.img_tag_before = new Image();
    this.img_map.src = mapPic;
    this.img_map.onload = () => {
      this.ctx.drawImage(
        this.img_map,
        canvasData.map.x - canvasData.map.w/2,
        canvasData.map.y - canvasData.map.h/2,
        canvasData.map.w,
        canvasData.map.h,
      );
      // 加载anchor图片 anchor在map画完之后再画
      this.img_anchor.src = anchorPic;
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
      this.img_notsaved_anchor.src = notSavedAnchorPic;
      this.img_notsaved_anchor.onload = () => {
        this.ctx.drawImage(this.img_notsaved_anchor, 0, 0, 0, 0);
      }
      // 加载tag图片
      this.img_tag.src = tagPic;
      this.img_tag.onload = () => {
        this.ctx.drawImage(this.img_tag, 0, 0, 0, 0);
      }
      // 加载tag_before图片
      this.img_tag_before.src = tagBeforePic;
      this.img_tag_before.onload = () => {
        this.ctx.drawImage(this.img_tag_before, 0, 0, 0, 0);
      }
    };
    this.setState({ canvasData });
  }

  // canvas监听事件
  listenMouse = () => {
    let x, y; // 当前鼠标位置
    // this.scaling = 1; // 缩放比例
    // let clickedId = '';
    // let lastClickTime = 0;
    // let lastClickLocation = { x: 0, y: 0 };
    let canvasBox; // 获取canvas的包围盒对象

    // 移动靠近anchor时 放大图标
    const highlightAnchor = (e) => {
      const { canvasData, anchors, selectedId } = this.state;
      // 获取canvas的包围盒对象
      canvasBox = this.canvas.getBoundingClientRect();
      x = e.clientX - canvasBox.left;
      y = e.clientY - canvasBox.top;

      Object.keys(canvasData.anchor).forEach((id) => {
        this.ctx.beginPath();
        this.ctx.arc(canvasData.anchor[id].x, canvasData.anchor[id].y, TRIGGER_RADIS, 0, Math.PI*2);
        if (id !== selectedId) {
          // 判断鼠标是否在范围内
          if (this.ctx.isPointInPath(x, y)) {
            // 只有在变化的时候才会重新画图
            if (canvasData.anchor[id].w === ANCHOR_W) {
              canvasData.anchor[id].w = 2 * ANCHOR_W;
              canvasData.anchor[id].h = 2 * ANCHOR_H;
              this.draw(canvasData);
            }
            this.drawID(
              canvasData.anchor[id].x,
              canvasData.anchor[id].y,
              anchors[id].aId
            )
          } else {
            if (canvasData.anchor[id].w === 2 * ANCHOR_W) {
              canvasData.anchor[id].w = ANCHOR_W;
              canvasData.anchor[id].h = ANCHOR_H;
              this.draw(canvasData);
            }
          }
        }
      })
    };
    // 鼠标移动事件
    this.canvas.onmousemove = highlightAnchor

    // 鼠标点击事件
    this.canvas.onmousedown =  (e) => {
      const { canvasData } = this.state;
      // let isInAnchor = false;

      // 获取canvas的包围盒对象
      canvasBox = this.canvas.getBoundingClientRect();
      // 记录鼠标点击时坐标
      let x_origin = e.clientX - canvasBox.left;
      let y_origin = e.clientY - canvasBox.top;
      // console.log("down",x, y);

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
    // console.log('draw');
    const { map, anchor, tag } = canvasData;
    const { scaling, tagHistoryCount } = this.state;
    // 清空canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 画地图
    this.ctx.drawImage(
      this.img_map,
      map.x - map.w/2,
      map.y - map.h/2,
      map.w,
      map.h,
    );

    // 画tag
    if (tag) {
      Object.keys(tag).forEach((id) => {
        // console.log(this.state.selectedRowKeys.indexOf(id))
        if (this.state.selectedRowKeys.indexOf(id) > -1) {
          let length = tag[id].coord.length;
          tag[id].coord.forEach((value, index) => {
            if (index > length - tagHistoryCount - 2) {
              let img = this.img_tag_before;
              let tag_w = TAG_W;
              let tag_h = TAG_H;
              // 最新数据用不同图标，同时画出坐标
              if (index === length - 1) {
                img = this.img_tag;
                this.drawCoord(
                  canvasData.map.x - canvasData.map.w/2 + value.x*RATIO*scaling,
                  canvasData.map.y + canvasData.map.h/2 - value.y*RATIO*scaling,
                  value.x,
                  value.y,
                );
                this.drawID(
                  canvasData.map.x - canvasData.map.w/2 + value.x*RATIO*scaling,
                  canvasData.map.y + canvasData.map.h/2 - value.y*RATIO*scaling,
                  tag[id].tId
                )
              }
              this.ctx.drawImage(
                img,
                canvasData.map.x - canvasData.map.w/2 + value.x*RATIO*scaling - tag_w/2,
                canvasData.map.y + canvasData.map.h/2 - value.y*RATIO*scaling - tag_h/2,
                tag_w,
                tag_h,
              );
              if (index + 1 < length) {
                this.drawLine(
                  canvasData.map.x - canvasData.map.w/2 + tag[id].coord[index].x*RATIO*scaling,
                  canvasData.map.y + canvasData.map.h/2 - tag[id].coord[index].y*RATIO*scaling,
                  canvasData.map.x - canvasData.map.w/2 + tag[id].coord[index + 1].x*RATIO*scaling,
                  canvasData.map.y + canvasData.map.h/2 - tag[id].coord[index + 1].y*RATIO*scaling,
                  "rgba(18,150,219,0.5)",
                  "rgba(18,150,219,0.5)",
                );
              }
            }
          })
        }
      })
    }

    // 画anchor
    if (this.state.showAnchor) {
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
              "rgba(216,30,6,1)",
              "rgba(191,191,191,1)",
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
          // 选中的anchor下方显示坐标
          this.drawCoord(
            anchor[id].x,
            anchor[id].y,
            this.state.anchors[id].coords[0],
            this.state.anchors[id].coords[1],
          )
        }
      });
    }
  }

  // 绘制连线
  drawLine = (
    from_x,
    from_y,
    to_x,
    to_y,
    from_color = "rgb(0,0,0)", // 默认黑色
    to_color = "rgba(0,0,0,1)"
    ) => {
    this.ctx.beginPath();
    // 设置线宽
    this.ctx.lineWidth = 2;
    // 设置间距（参数为无限数组，虚线的样式会随数组循环）
    this.ctx.setLineDash([4, 4]);
    this.ctx.moveTo(from_x, from_y);
    this.ctx.lineTo(to_x, to_y);
    let gradient = this.ctx.createLinearGradient(from_x, from_y, to_x, to_y);
    gradient.addColorStop(0, from_color);
    gradient.addColorStop(1, to_color);
    // 填充颜色
    this.ctx.strokeStyle = gradient;
    // 开始填充
    this.ctx.stroke();
    this.ctx.closePath();
  }

  // 在绘制图标下方绘制真实坐标
  drawCoord = (x, y, real_x, real_y) => {
    this.ctx.textAlign='center';
		this.ctx.textBaseline='middle';
		this.ctx.font="14px SimSun, Songti SC";
		this.ctx.fillText(`(${real_x.toFixed(2)}, ${real_y.toFixed(2)})`, x, y + 20);
  }

  drawID = (x, y, id) => {
    this.ctx.textAlign='center';
		this.ctx.textBaseline='middle';
		this.ctx.font="14px SimSun, Songti SC";
		this.ctx.fillText(`${id}`, x, y - 20);
  }

  // 获得父组件的长宽位置
  refHandle = (cw) => { // containerWrap
    if (cw) {
      const ro = new ResizeObserver((entries, observer) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const entry of entries) {
          const { width } = entry.contentRect;
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

  // 切换显示anchor
  swichShowAnchor = (checked) => {
    this.setState({ showAnchor: checked });
  }

  // 控制tag历史定位个数
  changeTagHistoryCount = (value) => {
    this.setState({ tagHistoryCount: value });
  }

  // 选中的tag
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  // 控制添加和修改框的显示
  setShowModal = (option, tag) => {
    if (option === 'update') {
      this.tag = tag;
    }
    this.setState({ showModal: option});
  }

  componentDidMount = () => {
    this.isMount = true;

    //有数据时不显示加载信息
    const existedData = Object.keys(this.props.anchors) && this.props.tags.length;
    if (!existedData) {
      this.hide = message.loading('数据加载中', 0);
    }
    Promise.all([
      this.getAnchors(),
      this.getTags()
    ]).then(() => {
      if (this.isMount) {
        if (!existedData) {
          this.hide();
          this.hide = null;
          message.success('数据加载完成');
        }
        this.initCanvas();
        this.listenMouse();
        // this.webSocket();

        if(!this.props.wsClient) {
          this.props.initWebsocket(this.props.user);
        }
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
    if (this.hide) {
      this.hide();
      message.success('加载取消');
    }
    this.setState = (state, callback) => {
      return
    }
  }

  // props改变时触发
  componentWillReceiveProps = () => {
    let canvasData = JSON.parse(JSON.stringify(this.state.canvasData));
    canvasData.tag = this.props.tagLoactionData;
    this.setState({canvasData}, () => {
      this.ctx && this.draw(this.state.canvasData);
    });
  }

  render = () => {
    this.user = this.props.user

    const { scaling, canvasWidth, canvasHeight, showModal } = this.state;

    return (
      <div className='tag'>
        <div className='map' ref={this.refHandle}>
          {canvasWidth && <canvas id="myCanvas" width={canvasWidth} height={canvasHeight}></canvas>}
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
          canvas={this.canvas}
          move={this.move}
          swichShowAnchor={this.swichShowAnchor}
          changeTagHistoryCount={this.changeTagHistoryCount}
          onSelectChange={this.onSelectChange}
          setShowModal={this.setShowModal}
          getTags={this.getTags}
          user={this.user}
        />
        <AddForm
          showModal={showModal}
          setShowModal={this.setShowModal}
          getTags={this.getTags}
          user={this.user}
        />
        <UpdateForm
          showModal={showModal}
          setShowModal={this.setShowModal}
          tag={this.tag}
          getTags={this.getTags}
          user={this.user}
        />
      </div>
    )
  }
}

export default connect(
  state => ({
    user: state.user,
    anchors: state.anchors,
    tags: state.tags,
    wsClient: state.wsClient,
    tagLoactionData: state.tagLoactionData,
  }),
  {initWebsocket}
)(Form.create()(Anchor))
