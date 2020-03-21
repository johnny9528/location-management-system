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
const RATIO = MAP_W/REAL_WIDTH; //真实地图与网页地图比值
const ANCHOR_W = 30; //绘图anchor宽度
const ANCHOR_H = 30; //绘图anchor高度
const TRIGGER_RADIS = 15; //触发事件的半径

const Item = Form.Item // 不能写在import之前
const { Panel } = Collapse;

class Home extends Component {
  constructor(props) {
    super(props);
    // this.canvas = React.createRef();

    this.state = {
      anchors: {},
      selectedId: '',
      scaling: 1, // 缩放比例
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
      showSearchResult: false,
    }
  }

  getAnchors = async () => {
    const hide = message.loading('数据加载中', 0)
    console.dir(hide)
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

  updateAnchor = (id) => {
    this.props.form.validateFields(async (err, values) => {
      if(!err) {
        this.setState({updateLoading: true});
        const {aId, x, y, A, N} = values
        const result = await reqUpdateAnchor(id, aId, x, y, A, N)
        if (result.code === 200) {
          this.setState({selectedId: id}, () => {
            this.refreshCanvas('update');
          });
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
    this.setState({deleteLoading: true})
    const result = await reqDeleteAnchor(id)
    if (result.code===200) {
      this.setState({selectedId: ''}, () => {
        this.refreshCanvas('delete');
      });
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
    this.img = new Image();
    this.img_anchor = new Image();
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
      this.img_anchor.onload= () => {
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
    };
    this.setState({ canvasData });
  }

  listenMouse () {
    let x, y; // 当前鼠标位置
    // this.scaling = 1; // 缩放比例
    let clickedId = '';
    let lastClickTime = 0;
    let lastClickLocation = { x: 0, y: 0 };

    // 移动靠近anchor时 放大图标
    const highlightAnchor = (e) => {
      const { canvasData } = this.state;
      x = e.clientX - this.canvas.offsetLeft;
      y = e.clientY - this.canvas.offsetTop;

      Object.keys(canvasData.anchor).forEach((id) => {
        this.ctx.beginPath();
        this.ctx.arc(canvasData.anchor[id].x, canvasData.anchor[id].y, TRIGGER_RADIS, 0, Math.PI*2);
        // 判断鼠标是否在范围内
        if (id !== clickedId) {
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
        this.ctx.arc(canvasData.anchor[id].x, canvasData.anchor[id].y, TRIGGER_RADIS, 0, Math.PI*2);
        // 判断鼠标是否在anchor范围内
        if (this.ctx.isPointInPath(x, y)) {
          // 点击anchor
          isInAnchor = true;
          clickedId = id;

          // 点击图标后放大，其他图标还原大小
          if (selectedId) {
            canvasData.anchor[selectedId].w = ANCHOR_W;
            canvasData.anchor[selectedId].h = ANCHOR_H;
          }
          canvasData.anchor[id].w = 2 * ANCHOR_W;
          canvasData.anchor[id].h = 2 * ANCHOR_H;

          this.draw(canvasData);
          this.props.form.resetFields();
          this.setState({ canvasData, selectedId: id });

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

            this.draw(canvasData);
            this.setState({ anchors, canvasData })
          }
        }
      })

      if (!isInAnchor) {
        // 点击地图
        this.props.form.resetFields();

        // 双击地图时所有anchor还原大小
        let clickTime = new Date().getTime();
        console.log(clickTime - lastClickTime);

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

        // 移动地图
        this.canvas.onmousemove = (e) => {
          x = e.clientX - this.canvas.offsetLeft;
          y = e.clientY - this.canvas.offsetTop;

          canvasData.map.x = canvasData_before.map.x + x -x_origin;
          canvasData.map.y = canvasData_before.map.y + y -y_origin;
          Object.keys(canvasData.anchor).forEach((id) => {
            canvasData.anchor[id].x = canvasData_before.anchor[id].x + x - x_origin;
            canvasData.anchor[id].y = canvasData_before.anchor[id].y + y - y_origin;
          });

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
      this.zoom(canvasData, scaling_after);
    };
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
    this.draw (canvasData);
    this.setState({ canvasData, scaling });
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
      this.ctx.drawImage(
        this.img_anchor,
        anchor[id].x - anchor[id].w/2,
        anchor[id].y - anchor[id].h/2,
        anchor[id].h,
        anchor[id].w,
      );
    });
  }

  refreshCanvas (type) {
    Promise.resolve(this.getAnchors()).then(() => {
      const { anchors, canvasData, scaling, selectedId } = this.state;

      // 添加修改删除等请求后重新给canvasData赋值
      let canvasData_after = {};
      canvasData_after.map = {
        x: canvasData.map.x,
        y: canvasData.map.y,
        w: canvasData.map.w,
        h: canvasData.map.h,
      };
      canvasData_after.anchor = {};
      Object.keys(anchors).forEach((id) => {
        canvasData_after.anchor[id] = {
          x: canvasData_after.map.x - canvasData_after.map.w/2 + anchors[id].coords[0]*RATIO*scaling,
          y: canvasData_after.map.y + canvasData_after.map.h/2 - anchors[id].coords[1]*RATIO*scaling,
          w: ANCHOR_W,
          h: ANCHOR_H,
        };
      });
      if (selectedId) {
        canvasData_after.anchor[selectedId].w = 2 * ANCHOR_W;
        canvasData_after.anchor[selectedId].h = 2 * ANCHOR_H;
      }
      this.draw(canvasData_after);
      this.setState({ canvasData: canvasData_after });
    })
  }

  componentDidMount(){
    Promise.resolve(this.getAnchors()).then(() => {
      this.initCanvas();
      this.listenMouse();
    })
  }


  render() {

    const user = storageUtils.getUser()
    if(user.level !== "admin") {
      message.warn("无权访问")
      return <Redirect to='/login'/>
    }

    const { anchors, canvasData, scaling, selectedId, updateLoading, deleteLoading, showAdd } = this.state;
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
              this.zoom(canvasData, scaling_after);
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
              this.zoom(canvasData, scaling_after);
            }}
          >
            <Icon type="zoom-out" style={{ fontSize: '20px' }}/>
          </LinkButton>
          <LinkButton
            onClick={() => {
              // 还原比例
              scaling_after = 1;
              // 还原坐标为中心
              let offset_x = this.canvas.width/2 - canvasData.map.x;
              let offset_y = this.canvas.height/2 - canvasData.map.y;
              canvasData.map.x = this.canvas.width/2;
              canvasData.map.y = this.canvas.height/2;
              Object.keys(canvasData.anchor).forEach((id) => {
                canvasData.anchor[id].x = canvasData.anchor[id].x + offset_x;
                canvasData.anchor[id].y = canvasData.anchor[id].y + offset_y;
              });
              this.zoom(canvasData, scaling_after);
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
                  <Button type='primary'
                    onClick={() => {
                      this.props.form.resetFields();
                      this.setState({ showAdd: true});
                    }}
                  >
                    <Icon type='plus'/>
                  </Button>
                </div>
              )}
              key="1"
              className="site-collapse-custom-panel"
            >
              {(!selectedId && !showAdd) ? null : (
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
                        disabled={!selectedId ? true : false}
                      />
                    )}
                  </Item>
                  <Item label="x" {...layout}>
                    {getFieldDecorator("x", {
                      initialValue: !selectedId ? '' : anchors[selectedId].coords[0].toFixed(2),
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
                        // value={selectedId? '' : anchors[selectedIndex].coords[0]}
                        // onBlur={() => console.log("blur")}
                        disabled={!selectedId ? true : false}
                        onChange={(event) => {
                          if (selectedId && event.target.value && !isNaN(event.target.value)) {
                            console.log(isNaN(event.target.value));
                            anchors[selectedId].coords[0] = parseFloat(event.target.value);
                            canvasData.anchor[selectedId].x =  canvasData.map.x -  canvasData.map.w/2 +  anchors[selectedId].coords[0]*RATIO*scaling;
                            this.draw(canvasData);
                            // anchor_x[selectedId] = map_x - map_w/2 + anchors[selectedId].coords[0]*RATIO*scaling;
                            // this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                            this.setState({canvasData, anchors});
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
                      initialValue: !selectedId ? '' : anchors[selectedId].coords[1].toFixed(2),
                      rules: [
                        { required: true, message: "请输入合法数值" },
                        { pattern: /^[0-9]+(\.)?[0-9]+$/, message: "请输入合法数值" },
                      ]
                    })(
                      <Input
                        disabled={!selectedId ? true : false}
                        onChange={(event) => {
                          if (selectedId) {
                            anchors[selectedId].coords[1] = parseFloat(event.target.value);
                            canvasData.anchor[selectedId].y =  canvasData.map.y -  canvasData.map.h/2 +  anchors[selectedId].coords[1]*RATIO*scaling;
                            this.draw(canvasData);
                            // anchor_y[selectedIndex] = map_y + map_h/2 - anchors[selectedIndex].coords[1]*RATIO*scaling;
                            // this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                            this.setState({canvasData, anchors});
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
                      initialValue: !selectedId ? '' : anchors[selectedId].coords[2],
                    })(
                      <Input
                      disabled={!selectedId ? true : false}
                        // onChange={(event) => {
                        //   anchors[selectedIndex].coords[0] = parseFloat(event.target.value);
                        //   anchor_x[selectedIndex] = map_x + anchors[selectedIndex].coords[0]*RATIO;
                        //   this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                        //   this.setState({anchors});
                        // }}
                      />
                    )}
                  </Item>
                  <Item label="N" {...layout}>
                    {getFieldDecorator("N", {
                      initialValue: !selectedId ? '' : anchors[selectedId].coords[3],
                    })(
                      <Input
                        disabled={!selectedId ? true : false}
                        // onChange={(event) => {
                        //   anchors[selectedIndex].coords[0] = parseFloat(event.target.value);
                        //   anchor_x[selectedIndex] = map_x + anchors[selectedIndex].coords[0]*RATIO;
                        //   this.draw(map_x, map_y, map_w, map_h, anchor_x, anchor_y, anchor_w, anchor_h);
                        //   this.setState({anchors});
                        // }}
                      />
                    )}
                  </Item>

                  <Item>
                    <div className="update-btn">
                      <Button loading={updateLoading} onClick={() => this.updateAnchor(anchors[selectedId]._id)}>
                        提交修改
                      </Button>
                    </div>
                    <div className="delete-btn">
                      <Button loading={deleteLoading} onClick={() => this.deleteAnchor(anchors[selectedId]._id)}>
                        删除
                      </Button>
                    </div>
                  </Item>
                  {!showAdd? null : (
                  <Item>
                    <div className="update-btn">
                      <Button loading={updateLoading} onClick={() => this.updateAnchor(anchors[selectedId]._id)}>
                        提交修改
                      </Button>
                    </div>
                    <div className="delete-btn">
                      <Button loading={deleteLoading} onClick={() => this.deleteAnchor(anchors[selectedId]._id)}>
                        删除
                      </Button>
                    </div>
                  </Item>
                  )}
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
