import React, { Component } from 'react'
// import { Redirect} from "react-router-dom";
// import pic_map from '../../assets/images/map.png'
import './home.less'
import {
  Form,
  Icon,
  Input,
  Button,
  // message,
  // Radio,
  Row,
  Col,
  Collapse,
  InputNumber,
} from 'antd'
// import storageUtils from '../../utils/storageUtils'
// import memoryUtils from '../../utils/memoryUtils'
// import map_svg from './map_pin.svg';
// import memoryUtils from '../../utils/memoryUtils';
import LinkButton from '../../components/link-button'

import map from '../../assets/images/map.png'
import anchor from '../../assets/images/anchor.png'

const REAL_WIDTH = 55;  //地图实际大小
const REAL_HEIGH = 44;
const MAP_W = 750; //网页地图大小
const MAP_H = MAP_W/REAL_WIDTH*REAL_HEIGH;
const ratio = MAP_W/REAL_WIDTH;
const radis = 15; //触发事件的半径

const Item = Form.Item // 不能写在import之前
const { Panel } = Collapse;
const layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

class Home extends Component {
  constructor(props) {
    super(props);
    // this.canvas = React.createRef();

    this.state = {
      circle_r: 15,
      colorList: ['red', 'green', 'yellow', 'blue'],
      locationList: [
        [250, 300], [100, 100], [123, 132], [400, 204]
      ],
      selectedIndex: -1,
      forTest: 234,
      dataForShow: [
        ['904E9140F9120000000', '250', '300', '-50', '0.777'],
        ['904E9140F9121111111', '100', '100', '-60', '1.777'],
        ['904E9140F9122222222', '123', '132', '-70', '2.777'],
        ['904E9140F912333333', '400', '204', '-40', '3.777']
      ],
      anchors: [
        { "_id" : "5e0eff34de7c266778617fc6", "coords" : [ 23, 24, -50.55, 1.726 ], "aId" : "904E9140F915", "__v" : 0 },
        { "_id" : "5e0eff34de7c266778617fc7", "coords" : [ 36, 24, -50.55, 1.726 ], "aId" : "904E9140F916", "__v" : 0 },
        { "_id" : "5e0eff34de7c266778617fc8", "coords" : [ 23, 38, -50.55, 1.726 ], "aId" : "904E9140F917", "__v" : 0 },
        { "_id" : "5e0eff34de7c266778617fc9", "coords" : [ 36, 38, -50.55, 1.726 ], "aId" : "904E9140F918", "__v" : 0 },
        { "_id" : "5e0eff34de7c266778617fca", "coords" : [ 5, 10, -50.55, 1.726 ], "aId" : "904E9140F919", "__v" : 0 },
      ],
      //画图参数
      map_x: 0, // 地图中心坐标
      map_y: 0,
      map_w: 0, // 地图大小
      map_h: 0,
      anchor_x: [], // anchor中心坐标
      anchor_y: [],
      anchor_w: [], // anchor大小
      anchor_h: [],
    }
  }

  // draw () {
  //   const canvas = this.canvas.current;
  //   let ctx = canvas.getContext("2d");
  //   // 初始化canvas
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);

  //   const MAP_W = 750; // 初始大小
  //   const MAP_H = 600;

  //   let map_w = MAP_W; // 当前大小
  //   let map_h = MAP_H

  //   let map_x = canvas.width/2- map_w/2; // 当前位置 左上角坐标
  //   let map_y = canvas.height/2 - map_h/2;

  //   let ratio = 0; // 缩放比例

  //   // let anchor_x = 400; // anchor坐标
  //   // let anchor_y = 200;

  //   let anchor_w = 30; //anchor图标大小
  //   let anchor_h = 30;

  //   let x; // 鼠标坐标
  //   let y;

  //   let { anchors } = this.state;
  //   let anchor_x = map_x + anchors[0].coords[0]*10;
  //   let anchor_y = map_y + map_h - anchors[0].coords[1]*10;

  //   let img = new Image();
  //   let img_anchor = new Image();
  //   img.src = map;
  //   img.onload = () => {
  //     ctx.drawImage(img, map_x, map_y, map_w, map_h);

  //     img_anchor.src = anchor;
  //     img_anchor.onload= () => {
  //     ctx.drawImage(img_anchor, anchor_x - anchor_w/2, anchor_y - anchor_h/2, anchor_w, anchor_h);
  //     }
  //   }

  //   // 移动靠近anchor时 放大图标
  //   const highlightAnchor = (e) => {
  //     x = e.clientX - canvas.offsetLeft;
  //     y = e.clientY - canvas.offsetTop;
  //     // console.log(x, y);

  //     ctx.beginPath();
  //     ctx.arc(anchor_x, anchor_y, 30, 0, Math.PI*2);
  //     // ctx.fillStyle = "red";
  //     // ctx.fill();
  //     if (ctx.isPointInPath(x, y)) {
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //       ctx.drawImage(img, map_x, map_y, map_w, map_h);
  //       ctx.drawImage(img_anchor, anchor_x - anchor_w, anchor_y - anchor_h, anchor_w*2, anchor_h*2);
  //     } else {
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //       ctx.drawImage(img, map_x, map_y, map_w, map_h);
  //       ctx.drawImage(img_anchor, anchor_x - anchor_w/2, anchor_y - anchor_h/2, anchor_w, anchor_h);
  //     }
  //   }
  //   canvas.onmousemove = highlightAnchor

  //   canvas.onmousedown =  (e) => {
  //     let operate = "anchor";
  //     let x_origin = e.clientX - canvas.offsetLeft;
  //     let y_origin = e.clientY - canvas.offsetTop;
  //     // console.log("down",x, y);

  //     ctx.beginPath();
  //     ctx.arc(anchor_x, anchor_y, 30, 0, Math.PI*2);
  //     if (ctx.isPointInPath(x, y)) {
  //       console.log("move anchor");
  //       this.setState({selectedIndex: 0});

  //       let coord_x = anchors[0].coords[0];
  //       let coord_y = anchors[0].coords[1];

  //       canvas.onmousemove = (e) => {
  //         x = e.clientX - canvas.offsetLeft;
  //         y = e.clientY - canvas.offsetTop;

  //         // console.log(x, y);

  //         ctx.clearRect(0, 0, canvas.width, canvas.height);
  //         ctx.drawImage(img, map_x, map_y, map_w, map_h);
  //         ctx.drawImage(img_anchor, anchor_x - anchor_w + x -x_origin, anchor_y - anchor_h + y -y_origin, anchor_w*2, anchor_h*2);

  //         anchors[0].coords[0] = coord_x + (x -x_origin)/10;
  //         anchors[0].coords[1] = coord_y + (y -y_origin)/10;
  //         this.setState({anchors})
  //       }
  //     } else {
  //       operate = "map";
  //       console.log("move map");
  //       canvas.onmousemove = (e) => {
  //         x = e.clientX - canvas.offsetLeft;
  //         y = e.clientY - canvas.offsetTop;
  //         console.log(x,y);
  //         //限制移动不能超出画布
  //         // (x<173)? ax=75 : ax=425;
  //         // (y<148)? ay=50 : ay=350;

  //         // (x < 425 && x >75)? x =e.clientX : x =ax;

  //         // (y > 50 && y <350) ? y=e.clientY : y=ay;

  //         ctx.clearRect(0, 0, canvas.width, canvas.height);
  //         ctx.drawImage(img, map_x + x -x_origin, map_y + y -y_origin, map_w, map_h);
  //         ctx.drawImage(img_anchor, anchor_x - anchor_w/2 + x -x_origin, anchor_y - anchor_h/2 + y -y_origin, anchor_w, anchor_h);
  //       }

  //     }

  //     canvas.onmouseup = (e) => {
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //       ctx.drawImage(img_anchor, anchor_x - anchor_w/2 + x -x_origin, anchor_y - anchor_h/2 + y -y_origin, anchor_w, anchor_h);
  //       anchor_x = anchor_x + x -x_origin;
  //       anchor_y = anchor_y + y -y_origin;
  //       if (operate === "map") {
  //         map_x = map_x + x -x_origin;
  //         map_y = map_y + y -y_origin;
  //       }
  //       ctx.drawImage(img, map_x, map_y, map_w, map_h);
  //       canvas.onmousemove = highlightAnchor;
  //       canvas.onmouseup = null;
  //     };
  //   }

  //   //缩放
  //   canvas.onmousewheel = function(e){
  //       let map_origin_w = map_w; // 缩放前大小
  //       let map_origin_h = map_h;
  //       let map_origin_x = map_x;
  //       let map_origin_y = map_y;

  //       // let x = e.clientX;
  //       // let y = e.clientY;
  //       ratio += e.wheelDelta/1200;
  //       // console.log(ratio);
  //       ctx.clearRect(0, 0 , canvas.width, canvas.height);
  //       // console.log(map_x, map_y);

  //       map_w = MAP_W*(1+ratio)
  //       map_h = MAP_H*(1+ratio)
  //       map_x = map_origin_x + map_origin_w/2 - map_w/2;
  //       map_y = map_origin_y + map_origin_h/2 - map_h/2;
  //       ctx.drawImage(img, map_x, map_y, map_w, map_h);

  //       anchor_x = (anchor_x - map_origin_x)/map_origin_w*map_w + map_x;
  //       anchor_y = (anchor_y - map_origin_y)/map_origin_h*map_h + map_y;
  //       console.log(anchor_x, anchor_y);
  //       ctx.drawImage(img_anchor, anchor_x - anchor_w/2, anchor_y - anchor_h/2, anchor_w, anchor_h);
  //   };
  // }

  initCanvas () {
    this.canvas = document.getElementById("myCanvas")
    // this.canvas = this.canvas.current;
    this.ctx = this.canvas.getContext("2d");

    // 设置画图初始数据
    let map_x = this.canvas.width/2;
    let map_y = this.canvas.height/2;
    let map_w = MAP_W;
    let map_h = MAP_H;
    let anchor_w = [];
    let anchor_h = [];
    let anchor_x = [];
    let anchor_y = [];
    this.state.anchors.forEach((item) => {
      anchor_x.push(map_x - map_w/2 + item.coords[0]*ratio);
      anchor_y.push(map_y - map_h/2+ map_h - item.coords[1]*ratio);
      anchor_w.push(30);
      anchor_h.push(30);
    });
    // console.log(anchor_x, anchor_y, anchor_w, anchor_h);

    this.setState({ map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h }, () => {
      // 画出地图和所有anchor
      this.img = new Image();
      this.img_anchor = new Image();
      this.img.src = map;
      this.img.onload = () => {
        this.ctx.drawImage(
          this.img,
          this.state.map_x - this.state.map_w/2,
          this.state.map_y - this.state.map_h/2,
          this.state.map_w,
          this.state.map_h,
        );
        // anchor在map画完之后再画
        this.img_anchor.src = anchor;
        this.img_anchor.onload= () => {
          this.state.anchor_x.forEach((item, index) => {
            // console.log(
            //   this.state.anchor_x[index] - this.state.anchor_w[index]/2,
            //   this.state.anchor_y[index] - this.state.anchor_h[index]/2,
            //   this.state.anchor_h[index],
            //   this.state.anchor_w[index]);
            this.ctx.drawImage(
              this.img_anchor,
              this.state.anchor_x[index] - this.state.anchor_w[index]/2,
              this.state.anchor_y[index] - this.state.anchor_h[index]/2,
              this.state.anchor_h[index],
              this.state.anchor_w[index],
            );
          });
        }
      };
    });
  }

  listenMouse () {
    let x, y; // 当前鼠标位置
    this.scaling = 1; // 缩放比例

    // 移动靠近anchor时 放大图标
    const highlightAnchor = (e) => {
      const { map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h } = this.state;
      x = e.clientX - this.canvas.offsetLeft;
      y = e.clientY - this.canvas.offsetTop;
      // console.log(x, y);

      anchor_x.forEach((item, index) => {
        this.ctx.beginPath();
        this.ctx.arc(anchor_x[index], anchor_y[index], radis, 0, Math.PI*2);
        // 判断鼠标是否在范围内
        if (this.ctx.isPointInPath(x, y)) {
          // this.setState({selectedIndex: index});
          anchor_w[index] = 60;
          anchor_h[index] = 60;
          // console.log("anchor_w ",anchor_w);
          this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);

          // this.setState({anchor_w, anchor_h});
        } else {
          anchor_w[index] = 30;
          anchor_h[index] = 30;
          this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
        }
      })
    };
    // 鼠标移动事件
    this.canvas.onmousemove = highlightAnchor

    // 鼠标点击事件
    this.canvas.onmousedown =  (e) => {
      const { map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h } = this.state;
      const { anchors } = this.state;
      let isInAnchor = false;

      // 记录鼠标点击时坐标
      let x_origin = e.clientX - this.canvas.offsetLeft;
      let y_origin = e.clientY - this.canvas.offsetTop;
      // console.log("down",x, y);

      anchor_x.forEach((item, index) => {

        this.ctx.beginPath();
        this.ctx.arc(anchor_x[index], anchor_y[index], radis, 0, Math.PI*2);
        // 判断鼠标是否在anchor范围内
        if (this.ctx.isPointInPath(x, y)) {
          console.log("move anchor");
          isInAnchor = true;
          // 清空form，重新赋值
          this.props.form.resetFields();
          this.setState({selectedIndex: index});

          // 记录anchor移动前真实坐标
          let coord_x = anchors[index].coords[0];
          let coord_y = anchors[index].coords[1];
          // 移动anchor
          this.canvas.onmousemove = (e) => {
            x = e.clientX - this.canvas.offsetLeft;
            y = e.clientY - this.canvas.offsetTop;
            // console.log(x, y);
            let anchor_x_after = [...anchor_x];
            let anchor_y_after = [...anchor_y];
            anchor_x_after[index] = anchor_x[index] + x - x_origin;
            anchor_y_after[index] = anchor_y[index] + y - y_origin;
            anchor_w[index] = 60;
            anchor_h[index] = 60;
            this.draw(map_x, map_y, map_w, map_h, anchor_x_after, anchor_y_after, anchor_w, anchor_h);
            // this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            // this.ctx.drawImage(img, map_x, map_y, map_w, map_h);
            // this.ctx.drawImage(img_anchor, anchor_x - anchor_w + x - x_origin, anchor_y - anchor_h + y -y_origin, anchor_w*2, anchor_h*2);

            anchors[index].coords[0] = coord_x + (x -x_origin)/ratio/this.scaling;
            anchors[index].coords[1] = coord_y - (y -y_origin)/ratio/this.scaling;
            this.setState({
              anchors,
              anchor_x: anchor_x_after,
              anchor_y: anchor_y_after,
            })
            // this.props.form.setFieldsValue({x: anchors[index].coords[0].toFixed(2), y: anchors[index].coords[1].toFixed(2)})
          }
        }
      })

      if (!isInAnchor) {
        // operate = "map";
        console.log("move map");
        this.props.form.resetFields();
        this.setState({selectedIndex: -1});
        this.canvas.onmousemove = (e) => {
          x = e.clientX - this.canvas.offsetLeft;
          y = e.clientY - this.canvas.offsetTop;
          // console.log(x,y);
          //限制移动不能超出画布
          // (x<173)? ax=75 : ax=425;
          // (y<148)? ay=50 : ay=350;
          // (x < 425 && x >75)? x =e.clientX : x =ax;
          // (y > 50 && y <350) ? y=e.clientY : y=ay;

          let map_x_after = map_x + x -x_origin;
          let map_y_after = map_y + y -y_origin;
          // console.log("before",anchor_x);
          let anchor_x_after = anchor_x.map((item) => item + x -x_origin);
          // console.log("after",anchor_x_after);
          let anchor_y_after = anchor_y.map((item) => item + y -y_origin);
          this.draw(map_x_after, map_y_after, map_w, map_h, anchor_x_after, anchor_y_after, anchor_w, anchor_h);
          this.setState({
            map_x: map_x_after,
            map_y: map_y_after,
            anchor_x: anchor_x_after,
            anchor_y: anchor_y_after,
          })
        }
      }

      this.canvas.onmouseup = (e) => {
        this.canvas.onmousemove = highlightAnchor;
        this.canvas.onmouseup = null;
      };
    }

    //缩放
    this.canvas.onmousewheel = (e) => {
      const { map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h } = this.state;
      // let x = e.clientX;
      // let y = e.clientY;
      if (e.wheelDelta > 0) {
        this.scaling += 0.1;
      } else {
        this.scaling -= 0.1;
      }
      // scaling += e.wheelDelta/1200;
      console.log(this.scaling);
      this.zoom (map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
      // let map_w_after = MAP_W*this.scaling;
      // let map_h_after = MAP_H*this.scaling;
      // let anchor_x_after = anchor_x.map((item) => map_x - (map_x - item)*map_w_after/map_w);
      // let anchor_y_after = anchor_y.map((item) => map_y - (map_y - item)*map_h_after/map_h);
      // this.draw (map_x, map_y, map_w_after, map_h_after, anchor_x_after, anchor_y_after, anchor_w, anchor_h)
      // this.setState({
      //   map_w: map_w_after,
      //   map_h: map_h_after,
      //   anchor_x: anchor_x_after,
      //   anchor_y: anchor_y_after,
      // });
    };
  }

  // 缩放
  zoom (map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h) {
    let map_w_after = MAP_W*this.scaling;
    let map_h_after = MAP_H*this.scaling;
    let anchor_x_after = anchor_x.map((item) => map_x - (map_x - item)*map_w_after/map_w);
    let anchor_y_after = anchor_y.map((item) => map_y - (map_y - item)*map_h_after/map_h);
    this.draw (map_x, map_y, map_w_after, map_h_after, anchor_x_after, anchor_y_after, anchor_w, anchor_h)
    this.setState({
      map_x,
      map_y,
      map_w: map_w_after,
      map_h: map_h_after,
      anchor_x: anchor_x_after,
      anchor_y: anchor_y_after,
      anchor_w,
      anchor_h,
    });
  }

  // 画地图和所有anchor
  draw (map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h) {
    // 清空canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.img,
      map_x - map_w/2,
      map_y - map_h/2,
      map_w,
      map_h,
    );
    anchor_x.forEach((item, index) => {
      // console.log(
      //   this.state.anchor_x[index] - this.state.anchor_w[index]/2,
      //   this.state.anchor_y[index] - this.state.anchor_h[index]/2,
      //   this.state.anchor_h[index],
      //   this.state.anchor_w[index]);
      this.ctx.drawImage(
        this.img_anchor,
        anchor_x[index] - anchor_w[index]/2,
        anchor_y[index] - anchor_h[index]/2,
        anchor_h[index],
        anchor_w[index],
      );
    });
  }

  componentDidMount(){
    this.initCanvas();
    this.listenMouse();
  }


  componentWillReceiveProps(nextProps) {
    // if (!nextProps.modal.modalUpdateDetail) {
      // this.props.form.resetFields();
    // }
  }

  render() {
    // console.log("render");
    const { anchors, selectedIndex } = this.state;
    const {map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h} = this.state;
    // console.log(selectedIndex);
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <div className='map'>
          <canvas id="myCanvas" width="1200" height="620"></canvas>
        </div>
        <div className="map-control">
          <LinkButton
            onClick={() => {
              this.scaling += 0.1;
              this.zoom(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
            }}
          >
            <Icon type="zoom-in" style={{ fontSize: '20px' }} />
          </LinkButton>
          <LinkButton
            onClick={() => {
              this.scaling -= 0.1;
              this.zoom(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
            }}
          >
            <Icon type="zoom-out" style={{ fontSize: '20px' }}/>
          </LinkButton>
          <LinkButton
            onClick={() => {
              // 还原比例
              this.scaling = 1;
              // 还原坐标为中心
              let map_x_after = this.canvas.width/2;
              let map_y_after = this.canvas.height/2;
              let anchor_x_after = anchor_x.map((item) => item+ map_x_after - map_x);
              let anchor_y_after = anchor_y.map((item) => item+ map_y_after - map_y);
              this.zoom(map_x_after, map_y_after, map_w, map_h, anchor_x_after, anchor_y_after, anchor_w, anchor_h);
            }}
          >
            <Icon type="redo" style={{ fontSize: '20px' }}/>
          </LinkButton>
        </div>
        <div className='detail'>
          <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          // expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          className="site-collapse-custom-collapse"
          >
            <Panel header="anchor数据" key="1" className="site-collapse-custom-panel">
              <div className="detail-form">
                <Form {...layout} >
                  <Item>
                    <Input.Search
                      placeholder="根据aId查询"
                      onSearch={value => console.log(value)}
                      style={{ width: 220}}
                    />
                  </Item>
                  <Item label="aId">
                    <Input
                      value={selectedIndex=== -1 ? '' : anchors[selectedIndex].aId}
                    />
                  </Item>
                  <Item label="x">
                    {getFieldDecorator("x", {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].coords[0].toFixed(2),
                      // validateFirst: true,
                      // rules: [
                      //   { required: true, whitespace: true, message: "用户名必须输入" },
                      //   { min: 1, message: "用户名至少4位" },
                      //   { max: 12, message: "用户名最多12位" },
                      //   { pattern: /^[0-9]+$/, message: "用户名必须是英文、数字或下划线组成" }
                      // ]
                    })(
                      <Input
                        // value={selectedIndex === -1 ? '' : anchors[selectedIndex].coords[0]}
                        onChange={(event) => {
                          if (selectedIndex !== -1) {
                            anchors[selectedIndex].coords[0] = parseFloat(event.target.value);
                            anchor_x[selectedIndex] = map_x - map_w/2 + anchors[selectedIndex].coords[0]*ratio*this.scaling;
                            this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                            this.setState({anchors});
                          }
                        }}
                        suffix="米（m）"
                      />
                    )}
                  </Item>
                  <Item label="y" rules={[{ type: 'number', min: 0, max: 400 }]}>
                    {getFieldDecorator("y", {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].coords[1].toFixed(2),
                      // validateFirst: true,
                      // rules: [
                      //   { required: true, whitespace: true, message: "用户名必须输入" },
                      //   { min: 1, message: "用户名至少4位" },
                      //   { max: 12, message: "用户名最多12位" },
                      //   { pattern: /^[0-9]+$/, message: "用户名必须是英文、数字或下划线组成" }
                      // ]
                    })(
                      // <InputNumber
                      //   min={0}
                      //   max={44}
                      //   step={0.01}
                      //   onChange={(value) => {
                      //     anchors[selectedIndex].coords[1] = parseFloat(value)
                      //     anchor_y[selectedIndex] = map_y + map_h - anchors[selectedIndex].coords[1]*ratio;
                      //     this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                      //     this.setState({anchors});
                      //   }}
                      // />
                      <Input
                        onChange={(event) => {
                          if (selectedIndex !== -1) {
                            anchors[selectedIndex].coords[1] = parseFloat(event.target.value);
                            anchor_y[selectedIndex] = map_y + map_h/2 - anchors[selectedIndex].coords[1]*ratio*this.scaling;
                            this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                            this.setState({anchors});
                          }
                        }}
                        suffix="米（m）"
                      />
                    )}
                  </Item>
                  <Item label="A">
                    {getFieldDecorator("A", {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].coords[2],
                    })(
                      <Input
                        // onChange={(event) => {
                        //   anchors[selectedIndex].coords[0] = parseFloat(event.target.value);
                        //   anchor_x[selectedIndex] = map_x + anchors[selectedIndex].coords[0]*ratio;
                        //   this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                        //   this.setState({anchors});
                        // }}
                      />
                    )}
                  </Item>
                  <Item label="N">
                    {getFieldDecorator("N", {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].coords[3],
                    })(
                      <Input
                        // onChange={(event) => {
                        //   anchors[selectedIndex].coords[0] = parseFloat(event.target.value);
                        //   anchor_x[selectedIndex] = map_x + anchors[selectedIndex].coords[0]*ratio;
                        //   this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                        //   this.setState({anchors});
                        // }}
                      />
                    )}
                  </Item>
                  <Item>
                    <Button type="primary" htmlType="submit" style={{ width: 220}}>
                      提交修改信息
                    </Button>
                  </Item>
                </Form>
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    )
  }
}

export default Form.create()(Home)
