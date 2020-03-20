import React, { Component } from 'react'
import { Redirect} from "react-router-dom";
import './index.less'
import { Form, Icon, Input, Button, Collapse, message, Tooltip} from 'antd'
import storageUtils from '../../utils/storageUtils'
import LinkButton from '../../components/link-button'
import { reqAnchors, reqAddAnchor, reqUpdateAnchor, reqDeleteAnchor } from '../../api'
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

class Home extends Component {
  constructor(props) {
    super(props);
    // this.canvas = React.createRef();

    this.state = {
      anchors: [],
      selectedIndex: -1,
      //画图参数
      map_x: 0, // 地图中心坐标
      map_y: 0,
      map_w: 0, // 地图大小
      map_h: 0,
      anchor_x: [], // anchor中心坐标
      anchor_y: [],
      anchor_w: [], // anchor大小
      anchor_h: [],
      scaling: 1, // 缩放比例
      updateLoading: false, //修改按钮loading状态
      deleteLoading: false, //修改按钮loading状态
    }
  }

  getAnchors = async () => {
    const hide = message.loading('数据加载中...', 0)
    console.dir(hide)
    let result = await reqAnchors();
    if (result.code === 200) {
      this.setState({ anchors: result.anchors })
    } else {
      message.error("获取数据失败");
    }
    hide();
    message.success('数据加载完成');
  }

  updateAnchor = (id) => {
    this.props.form.validateFields(async (err, values) => {
      if(!err) {
        this.setState({updateLoading: true})
        const {aId, x, y, A, N} = values
        const result = await reqUpdateAnchor(id, aId, x, y, A, N)
        if (result.code === 200) {
          this.refreshCanvas('update');
          message.success("修改成功");
        }
        else {
          message.error("修改失败" + result.message)
        }
        this.setState({updateLoading: false})
      }
    })
  }

  deleteAnchor = async (id) => {
    this.setState({deleteLoading: true})
    const result = await reqDeleteAnchor(id)
    if (result.code===200) {
      this.refreshCanvas('delete');
      this.props.form.resetFields();
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
    // this.scaling = 1; // 缩放比例
    let clickedIndex = -1;
    let lastClickTime = 0;
    let lastClickX = 0;
    let lastClickY = 0;

    // 移动靠近anchor时 放大图标
    const highlightAnchor = (e) => {
      const { map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h } = this.state;
      x = e.clientX - this.canvas.offsetLeft;
      y = e.clientY - this.canvas.offsetTop;
      // console.log(x, y);
      // console.log(window.innerWidth);

      anchor_x.forEach((item, index) => {
        this.ctx.beginPath();
        this.ctx.arc(anchor_x[index], anchor_y[index], radis, 0, Math.PI*2);
        // 判断鼠标是否在范围内
        if (index !== clickedIndex) {
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
        }
      })
    };
    // 鼠标移动事件
    this.canvas.onmousemove = highlightAnchor

    // 鼠标点击事件
    this.canvas.onmousedown =  (e) => {
      const { map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h, scaling } = this.state;
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
          // 点击anchor
          isInAnchor = true;
          clickedIndex = index;
          // 清空form，重新赋值
          this.props.form.resetFields();
          this.setState({selectedIndex: index});

          // 点击图标后放大，其他图标还原大小
          let anchor_w_after = anchor_w.map((item, i) => i === index ? 60 : 30);
          let anchor_h_after = anchor_h.map((item, i) => i === index ? 60 : 30);
          this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w_after, anchor_h_after);
          this.setState({
            anchor_w: anchor_w_after,
            anchor_h: anchor_h_after,
          });

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
            // anchor_w[index] = 60;
            // anchor_h[index] = 60;
            this.draw(map_x, map_y, map_w, map_h, anchor_x_after, anchor_y_after, anchor_w_after, anchor_h_after);
            // this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            // this.ctx.drawImage(img, map_x, map_y, map_w, map_h);
            // this.ctx.drawImage(img_anchor, anchor_x - anchor_w + x - x_origin, anchor_y - anchor_h + y -y_origin, anchor_w*2, anchor_h*2);

            anchors[index].coords[0] = coord_x + (x -x_origin)/ratio/scaling;
            anchors[index].coords[1] = coord_y - (y -y_origin)/ratio/scaling;
            this.setState({
              anchors,
              anchor_x: anchor_x_after,
              anchor_y: anchor_y_after,
              anchor_w,
              anchor_h,
            })
            // this.props.form.setFieldsValue({x: anchors[index].coords[0].toFixed(2), y: anchors[index].coords[1].toFixed(2)})
          }
        }
      })

      if (!isInAnchor) {
        // 点击地图
        this.props.form.resetFields();
        // this.setState({selectedIndex: -1});

        // 双击地图时所有anchor还原大小
        let clickTime = new Date().getTime();
        // console.log(clickTime - lastClickTime);
        let anchor_w_after = anchor_w;
        let anchor_h_after = anchor_h;
        // 判断两次点击时间差
        // console.log(lastClickCoordinate, [x_origin, y_origin]);
        if (clickTime - lastClickTime < 200 && lastClickX === x_origin && lastClickY === y_origin) {
          console.log("double click");
          // clickedIndex = -1;
          anchor_w_after = anchor_w.map((item, i) => 30);
          anchor_h_after = anchor_h.map((item, i) => 30);
          this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w_after, anchor_h_after);
          this.setState({
            selectedIndex: -1,
            anchor_w: anchor_w_after,
            anchor_h: anchor_h_after,
          });
        }
        // 记录上次点击时间和坐标
        lastClickTime = clickTime;
        lastClickX = x_origin;
        lastClickY = y_origin;

        this.canvas.onmousemove = (e) => {
          console.log("move map");
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
          let anchor_x_after = anchor_x.map((item) => item + x -x_origin);
          let anchor_y_after = anchor_y.map((item) => item + y -y_origin);

          this.draw(map_x_after, map_y_after, map_w, map_h, anchor_x_after, anchor_y_after, anchor_w_after, anchor_h_after);
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
      const { map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h, scaling } = this.state;
      let scaling_after = scaling;
      // let x = e.clientX;
      // let y = e.clientY;
      if (e.wheelDelta > 0) {
        scaling_after += 0.1;
      } else {
        scaling_after -= 0.1;
      }
      // 限制缩放最小为0.5
      if (scaling_after <0.5) {
        scaling_after = 0.5;
      }
      this.zoom (map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h, scaling_after);
      this.setState({scaling: scaling_after})
    };
  }

  // 缩放
  zoom (map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h, scaling) {
    let map_w_after = MAP_W*scaling;
    let map_h_after = MAP_H*scaling;
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
      this.ctx.drawImage(
        this.img_anchor,
        anchor_x[index] - anchor_w[index]/2,
        anchor_y[index] - anchor_h[index]/2,
        anchor_h[index],
        anchor_w[index],
      );
    });
  }

  refreshCanvas (type) {
    Promise.resolve(this.getAnchors()).then(() => {
      const { anchors, map_x, map_y, map_w, map_h, anchor_w, anchor_h, scaling } = this.state;
      console.log(anchors.length);
      let anchor_x = [];
      let anchor_y = [];
      anchors.forEach((item) => {
        anchor_x.push(map_x - map_w/2 + item.coords[0]*ratio*scaling);
        anchor_y.push(map_y - map_h/2+ map_h - item.coords[1]*ratio*scaling);
      });
      let anchor_w_after = [];
      let anchor_h_after = [];
      if (type === 'update') {
        anchor_w_after = anchor_w;
        anchor_h_after = anchor_h;
      } else if (type === 'delete') {
        anchor_w_after = new Array(anchors.length).fill(30);
        anchor_h_after = new Array(anchors.length).fill(30);
      }
      // console.log(anchor_x, anchor_y);
      this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w_after, anchor_h_after);
      this.setState({map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w: anchor_w_after, anchor_h: anchor_h_after})
    })
  }

  componentDidMount(){
    Promise.resolve(this.getAnchors()).then(() => {
      this.initCanvas();
      this.listenMouse();
    })
    // this.getAnchors()
    // this.initCanvas();
    // this.listenMouse();
  }


  render() {

    const user = storageUtils.getUser()
    if(user.level !== "admin") {
      message.warn("无权访问")
      return <Redirect to='/login'/>
    }

    const { anchors, selectedIndex, updateLoading, deleteLoading } = this.state;
    const {map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h, scaling} = this.state;
    let scaling_after = scaling;

    const { getFieldDecorator } = this.props.form;

    const layout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };

    return (
      <div>
        <div className='map'>
          <canvas id="myCanvas" width="1200" height="620"></canvas>
        </div>
        <div className="map-control">
          <LinkButton
            onClick={() => {
              scaling_after += 0.1;
              this.zoom(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h, scaling_after);
              this.setState({scaling: scaling_after});
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
              this.zoom(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h, scaling_after);
              this.setState({scaling: scaling_after});
            }}
          >
            <Icon type="zoom-out" style={{ fontSize: '20px' }}/>
          </LinkButton>
          <LinkButton
            onClick={() => {
              // 还原比例
              scaling_after = 1;
              // 还原坐标为中心
              let map_x_after = this.canvas.width/2;
              let map_y_after = this.canvas.height/2;
              let anchor_x_after = anchor_x.map((item) => item+ map_x_after - map_x);
              let anchor_y_after = anchor_y.map((item) => item+ map_y_after - map_y);
              this.zoom(map_x_after, map_y_after, map_w, map_h, anchor_x_after, anchor_y_after, anchor_w, anchor_h, scaling_after);
              this.setState({scaling: scaling_after});
            }}
          >
            <Icon type="redo" style={{ fontSize: '20px' }}/>
          </LinkButton>
          <div>{parseInt(scaling*100)}%</div>
        </div>
        <div className='data'>
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
            expandIconPosition={'right'}
            className="site-collapse-custom-collapse"
          >
            <Panel
              // header={"anchor总数: "+ anchors.length}
              header={(
                <div className="search-add">
                  <Input.Search
                    placeholder="根据aId查询"
                    onSearch={value => console.log(value)}
                    sytle={{width: '100'}}
                  />
                  <Button type='primary' onClick={() => this.showAdd()}>
                    <Icon type='plus'/>
                  </Button>
                </div>
              )}
              key="1"
              className="site-collapse-custom-panel"
            >
              {selectedIndex === -1 ? null : (
              <div className="anchor-form">
                <Form hideRequiredMark>
                  <Item label="aId" {...layout}>
                    {getFieldDecorator('aId', {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].aId,
                      validateFirst: true,
                      rules: [
                        { required: true, message: 'aId不能为空' },
                      ]
                    })(
                      <Input
                        disabled={selectedIndex=== -1 ? true : false}
                        // value={selectedIndex=== -1 ? '' : anchors[selectedIndex].aId}
                      />
                    )}
                  </Item>
                  <Item label="x" {...layout}>
                    {getFieldDecorator("x", {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].coords[0].toFixed(2),
                      validateFirst: true,
                      rules: [
                        { validator: (rule, value, callback) => {
                          if (!/^[0-9]+(\.[0-9]+)?$/.test(value)) {
                            callback('请输入合法数值');
                          // } else if (parseFloat(value) > 55 || parseFloat(value) < 0) {
                          //   callback('数值范围0~55');
                          } else {
                            callback();
                          }

                          // if(!value) {
                          //   callback('密码必须输入')
                          // } else if (value.length<4) {
                          //   callback('密码长度不能小于4位')
                          // } else if (value.length>12) {
                          //   callback('密码长度不能大于12位')
                          // } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                          //   callback('密码必须是英文、数字或下划线组成')
                          // } else {
                          //   callback() // 验证通过
                          // }
                          // callback('xxxx') // 验证失败, 并指定提示的文本
                        }},
                        // { required: true, message: "请输入合法数值" },
                        // { pattern: /^[0-9]+(\.)?[0-9]+$/, message: "请输入合法数值" },
                        // { transform: (value) => parseFloat(value) },
                        // // { type: 'number' }
                      ]
                    })(
                      <Input
                        // value={selectedIndex === -1 ? '' : anchors[selectedIndex].coords[0]}
                        onBlur={() => console.log("blur")}
                        disabled={selectedIndex=== -1 ? true : false}
                        onChange={(event) => {
                          if (selectedIndex !== -1 && event.target.value && !isNaN(event.target.value)) {
                            console.log(isNaN(event.target.value));
                            anchors[selectedIndex].coords[0] = parseFloat(event.target.value);
                            anchor_x[selectedIndex] = map_x - map_w/2 + anchors[selectedIndex].coords[0]*ratio*scaling;
                            this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                            this.setState({anchors});
                          }
                        }}
                        suffix={
                          <Tooltip title="输入范围：0~55，单位：米">
                            <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                          </Tooltip>
                        }
                      />
                    )}
                  </Item>
                  <Item label="y" {...layout} >
                    {getFieldDecorator("y", {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].coords[1].toFixed(2),
                      rules: [
                        { required: true, message: "请输入合法数值" },
                        { pattern: /^[0-9]+(\.)?[0-9]+$/, message: "请输入合法数值" },
                      ]
                    })(
                      <Input
                        disabled={selectedIndex=== -1 ? true : false}
                        onChange={(event) => {
                          if (selectedIndex !== -1) {
                            anchors[selectedIndex].coords[1] = parseFloat(event.target.value);
                            anchor_y[selectedIndex] = map_y + map_h/2 - anchors[selectedIndex].coords[1]*ratio*scaling;
                            this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                            this.setState({anchors});
                          }
                        }}
                        suffix={
                          <Tooltip title="输入范围：0~44，单位：米">
                            <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                          </Tooltip>
                        }
                      />
                    )}
                  </Item>
                  <Item label="A" {...layout}>
                    {getFieldDecorator("A", {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].coords[2],
                    })(
                      <Input
                      disabled={selectedIndex=== -1 ? true : false}
                        // onChange={(event) => {
                        //   anchors[selectedIndex].coords[0] = parseFloat(event.target.value);
                        //   anchor_x[selectedIndex] = map_x + anchors[selectedIndex].coords[0]*ratio;
                        //   this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                        //   this.setState({anchors});
                        // }}
                      />
                    )}
                  </Item>
                  <Item label="N" {...layout}>
                    {getFieldDecorator("N", {
                      initialValue: selectedIndex === -1 ? '' : anchors[selectedIndex].coords[3],
                    })(
                      <Input
                        disabled={selectedIndex=== -1 ? true : false}
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
                    <div className="update-btn">
                      <Button loading={updateLoading} onClick={() => this.updateAnchor(anchors[selectedIndex]._id)}>
                        提交修改
                      </Button>
                    </div>
                    <div className="delete-btn">
                      <Button loading={deleteLoading} onClick={() => this.deleteAnchor(anchors[selectedIndex]._id)}>
                        删除
                      </Button>
                    </div>
                  </Item>
                </Form>
              </div>
              )}
            </Panel>
          </Collapse>
        </div>
      </div>
    )
  }
}

export default Form.create()(Home)
