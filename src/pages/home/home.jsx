import React, { Component } from 'react'
import { Form, Icon, message } from 'antd'
import { connect } from 'react-redux'

import './index.less'
import LinkButton from '../../components/link-button'
import { reqTags, reqUserTags, reqAnchors, reqUserAnchors } from '../../api'
import mapPic from '../../assets/images/map.png'
import anchorPic from '../../assets/images/anchor.png'
import tagPic from '../../assets/images/tag.png'
import tagBeforePic from '../../assets/images/tag_before.png'
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
import { zoom, move, drawID, drawCoord, drawLine } from '../../utils/canvasUtils'

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
      showAnchorId: false, // 是够显示anchor aId
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
        selectedRowKeys: [...tags.map((item) => item.tId)],
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
        selectedRowKeys: [...result.tag.map((item) => item.tId)],
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
      const { canvasData, selectedId } = this.state;
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
      let canvasData_afterzoom = zoom(canvasData, scaling_after, false);
      this.draw (canvasData_afterzoom);
      this.setState({ canvasData: canvasData_afterzoom, scaling: scaling_after });
    };

  }

  // 画地图和所有anchor
  draw = (canvasData) => {
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
      Object.keys(tag).forEach((tId) => {
        // 选中了的才画出来
        // console.log("this.state.selectedRowKeys", this.state.selectedRowKeys, tId)
        if (this.state.selectedRowKeys.indexOf(tId) > -1) {
          let length = tag[tId].length;
          tag[tId].forEach((value, index) => {
            if (index > length - tagHistoryCount - 2) {
              let img = this.img_tag_before;
              let tag_w = TAG_W;
              let tag_h = TAG_H;
              // 最新一条数据用不同图标，同时画出坐标
              if (index === length - 1) {
                console.log(true, "value", value, index);
                img = this.img_tag;
                drawCoord(
                  this.ctx,
                  canvasData.map.x - canvasData.map.w/2 + value.x*RATIO*scaling,
                  canvasData.map.y + canvasData.map.h/2 - value.y*RATIO*scaling,
                  value.x,
                  value.y,
                );
                drawID(
                  this.ctx,
                  canvasData.map.x - canvasData.map.w/2 + value.x*RATIO*scaling,
                  canvasData.map.y + canvasData.map.h/2 - value.y*RATIO*scaling,
                  tId
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
                drawLine(
                  this.ctx,
                  canvasData.map.x - canvasData.map.w/2 + tag[tId][index].x*RATIO*scaling,
                  canvasData.map.y + canvasData.map.h/2 - tag[tId][index].y*RATIO*scaling,
                  canvasData.map.x - canvasData.map.w/2 + tag[tId][index + 1].x*RATIO*scaling,
                  canvasData.map.y + canvasData.map.h/2 - tag[tId][index + 1].y*RATIO*scaling,
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
        this.ctx.drawImage(
          this.img_anchor,
          anchor[id].x - anchor[id].w/2,
          anchor[id].y - anchor[id].h/2,
          anchor[id].h,
          anchor[id].w,
        );

        if (this.state.showAnchorId) {
          drawID(
            this.ctx,
            canvasData.anchor[id].x,
            canvasData.anchor[id].y,
            this.state.anchors[id].aId
          )
        }
      });
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
    let canvasData_afterzoom = zoom(canvasData, scaling_after, false);
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
    let canvasData_afterzoom = zoom(canvasData, scaling_after, false);
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
    let canvasData_aftermove = move(canvasData, offset_x, offset_y, false);
    let canvasData_afterzoom = zoom(canvasData_aftermove, scaling_after, false);
    this.reDraw({ canvasData: canvasData_afterzoom, scaling: scaling_after })
  }

  // 切换显示anchor
  swichShowAnchor = (checked) => {
    this.setState({ showAnchor: checked });
  }

  // 切换显示anchor aId
  swichShowAnchorId = (checked) => {
    this.setState({ showAnchorId: checked });
  }

  // 控制tag历史定位个数
  changeTagHistoryCount = (value) => {
    this.setState({ tagHistoryCount: value });
  }

  // 选中的tag
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  // 控制添加和修改框的显示
  setShowModal = (option, tag) => {
    // 用于子组件控制model
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

        // 只初始化一次websocket
        if(!this.props.wsClient) {
          this.props.initWebsocket(this.props.user);
        }
      }
    })
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
    console.log("componentWillReceiveProps", this.props.tagLoactionData)
    let canvasData = JSON.parse(JSON.stringify(this.state.canvasData));
    // 将websocket收到的数据给canvasData
    canvasData.tag = this.props.tagLoactionData;
    this.setState({canvasData}, () => {
      this.ctx && this.draw(this.state.canvasData);
    });


  }

  render = () => {
    this.user = this.props.user

    const { scaling, showModal } = this.state;

    const width = document.body.clientWidth - 40 - (this.props.user.level === "admin" ? 200 : 0);
    const height = document.body.clientHeight - 120;

    return (
      <div className='tag'>
        <div className='map' ref={this.refHandle}>
          <canvas id="myCanvas" width={width} height={height}></canvas>
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
          // move={this.move}
          swichShowAnchor={this.swichShowAnchor}
          swichShowAnchorId={this.swichShowAnchorId}
          changeTagHistoryCount={this.changeTagHistoryCount}
          onSelectChange={this.onSelectChange}
          setShowModal={this.setShowModal}
          user={this.user}
        />
        <AddForm
          showModal={showModal}
          setShowModal={this.setShowModal}
        />
        <UpdateForm
          showModal={showModal}
          setShowModal={this.setShowModal}
          tag={this.tag}
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
