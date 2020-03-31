import React, { Component } from 'react'
import { Form, Icon, Input, Button, message, Switch,  Modal, Dropdown, Menu, Table, InputNumber, Row, Col } from 'antd'
import Highlighter from 'react-highlight-words';
import { reqAddAnchor, reqUpdateAnchor, reqDeleteAnchor } from '../../api'
import LinkButton from '../../components/link-button';
// const Item = Form.Item
const { confirm } = Modal;
// const CheckboxGroup = Checkbox.Group;

const REAL_WIDTH = 55;  //地图实际大小
// const REAL_HEIGH = 44;
const MAP_W = 700; //网页地图大小
// const MAP_H = MAP_W/REAL_WIDTH*REAL_HEIGH;
const RATIO = MAP_W/REAL_WIDTH; //真实地图与网页地图比值
const ANCHOR_W = 30; //绘图anchor宽度
const ANCHOR_H = 30; //绘图anchor高度
// const TRIGGER_RADIS = 15; //触发事件的半径

class DataControl extends Component {
  constructor (props) {
    super(props);
    this.state = {
      addLoading: false, //添加按钮loading状态
      updateLoading: false, //修改按钮loading状态
      deleteLoading: false, //修改按钮loading状态
      searchKey: '', //搜索关键词
      checkedList: [],
      indeterminate: true,
      checkAll: false,
      visiable: false,
      tags: [
        {
            "_id": "5e6314e268f37c48e24f895d",
            "tId": "10001-04096",
            "user": {
                "_id": "5e6314e268f37c48e24f8925",
                "username": "xuke",
                "id": "5e6314e268f37c48e24f8925"
            },
            "createTime": "2020-3-7 11:28:34",
            "updateTime": "2020-3-14 22:2:57",
            "description": "test",
            "id": "5e6314e268f37c48e24f895d"
        },
        {
            "_id": "5e6314e268f37c48e24f895b",
            "tId": "10001-04098",
            "user": {
                "_id": "5e6314e268f37c48e24f8925",
                "username": "xuke",
                "id": "5e6314e268f37c48e24f8925"
            },
            "createTime": "2020-3-7 11:28:34",
            "updateTime": "2020-3-17 9:56:5",
            "description": "1111111111",
            "id": "5e6314e268f37c48e24f895b"
        },
        {
            "_id": "5e6314e268f37c48e24f895f",
            "tId": "10001-04097",
            "user": {
                "_id": "5e6314e268f37c48e24f8925",
                "username": "xuke",
                "id": "5e6314e268f37c48e24f8925"
            },
            "createTime": "2020-3-7 11:28:34",
            "updateTime": "2020-3-7 11:28:34",
            "id": "5e6314e268f37c48e24f895f"
        },
        {
            "_id": "5e6a356de513e12d56611726",
            "tId": "1111111",
            "user": {
                "_id": "5e6314e268f37c48e24f8925",
                "username": "xuke",
                "id": "5e6314e268f37c48e24f8925"
            },
            "description": "test",
            "createTime": "2020-3-12 21:13:17",
            "updateTime": "2020-3-12 21:13:17",
            "id": "5e6a356de513e12d56611726"
        },
        {
            "_id": "5e6a35b6e513e12d56611727",
            "tId": "1123",
            "user": {
                "_id": "5e6314e268f37c48e24f8925",
                "username": "xuke",
                "id": "5e6314e268f37c48e24f8925"
            },
            "description": "test",
            "createTime": "2020-3-12 21:14:30",
            "updateTime": "2020-3-12 21:14:30",
            "id": "5e6a35b6e513e12d56611727"
        },
        {
            "_id": "5e702d826cc5e536ae92b3a3",
            "tId": "12345",
            "user": {
                "_id": "5e6314e268f37c48e24f8925",
                "username": "xuke",
                "id": "5e6314e268f37c48e24f8925"
            },
            "description": "123123",
            "createTime": "2020-3-17 9:53:6",
            "updateTime": "2020-3-17 9:53:29",
            "id": "5e702d826cc5e536ae92b3a3"
        }
      ],
      selectedRowKeys: [],
      showTable: false,
    };
  }

  // 搜索时选中的anchor移动到中心
  moveAnchorToCentre = (item) => {
    const { selectedId, canvasData } = this.props.state;
    const canvas = this.props.canvas;

    let offset_x = canvas.width/2 - canvasData.anchor[item.key].x;
    let offset_y = canvas.height/2 - canvasData.anchor[item.key].y;

    let canvasData_aftermove = this.props.move(canvasData, offset_x, offset_y);
    if (selectedId) {
      canvasData_aftermove.anchor[selectedId].w = ANCHOR_W;
      canvasData_aftermove.anchor[selectedId].h = ANCHOR_H;
    }
    canvasData_aftermove.anchor[item.key].w = 2 * ANCHOR_W;
    canvasData_aftermove.anchor[item.key].h = 2 * ANCHOR_H;
    this.props.reDraw({ canvasData: canvasData_aftermove, selectedId: item.key });
  }

  // x y 输入框变化时实时更新map
  InputOnChange = (label) => (event) => {
    const { selectedId, canvasData, anchors, scaling } = this.props.state;
    if (selectedId && event.target.value && !isNaN(event.target.value)) {
      if (label === 'x') {
        anchors[selectedId].coords[0] = parseFloat(event.target.value);
        canvasData.anchor[selectedId].x =  canvasData.map.x - canvasData.map.w/2 + anchors[selectedId].coords[0]*RATIO*scaling;
      } else {
        anchors[selectedId].coords[1] = parseFloat(event.target.value);
        canvasData.anchor[selectedId].y =  canvasData.map.y + canvasData.map.h/2 - anchors[selectedId].coords[1]*RATIO*scaling;
      }
      this.props.reDraw({canvasData, anchors});
    }
  }

  // form验证数字
  validatorNumber = (min, max) => (rule, value, callback) => {
    if (!/^-?[0-9]+(\.[0-9]+)?$/.test(value)) {
      callback('请输入合法数值');
    } else if (parseFloat(value) > max || parseFloat(value) < min) {
      callback(`数值范围${min} ~ ${max}`);
    } else {
      callback();
    }
  }

  // 点击添加anchor后创建新anchor
  clickAdd = () => {
    const { canvasData, anchors, scaling } = this.props.state;
    const canvas = this.props.canvas;
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
    let offset_x = canvas.width/2 - canvasData.anchor[newAnchorId].x;
    let offset_y = canvas.height/2 - canvasData.anchor[newAnchorId].y;
    let canvasData_aftermove = this.props.move(canvasData, offset_x, offset_y);
    this.props.reDraw({ selectedId: newAnchorId, canvasData: canvasData_aftermove, anchors, showAdd: true });
  }

  // 取消添加anchor，同时删除临时anchor
  cancelAdd = () => {
    const { anchors, canvasData, selectedId } = this.props.state;
    delete anchors[selectedId];
    delete canvasData.anchor[selectedId];
    this.props.reDraw({ canvasData, anchors, selectedId: '', showAdd: false});
  }

  addAnchor = async () => {
    const { canvasData, anchors, selectedId, scaling } = this.props.state;
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
          this.props.originAnchorCanvas[id] = {
            x: canvasData.map.x - canvasData.map.w/2 + anchors[id].coords[0]*RATIO*scaling,
            y: canvasData.map.y + canvasData.map.h/2 - anchors[id].coords[1]*RATIO*scaling,
            w: ANCHOR_W,
            h: ANCHOR_H,
          }
          this.props.reDraw({ canvasData, anchors, selectedId: id})
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
    const { canvasData, anchors } = this.props.state;
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
          this.props.originAnchorCanvas[id].x = canvasData.anchor[id].x;
          this.props.originAnchorCanvas[id].y = canvasData.anchor[id].y;
          this.props.reDraw({ anchors, canvasData });
          // this.draw(canvasData);
          // this.setState({ anchors, canvasData });
          message.success("修改成功");
        }
        else {
          message.error("修改失败" + result.message)
        }
        this.setState({updateLoading: false});
      }
    })
  }

  // 撤销移动
  cancelMove = () => {
    const { canvasData, anchors, selectedId, scaling } = this.props.state;
    canvasData.anchor[selectedId].x = this.props.originAnchorCanvas[selectedId].x;
    canvasData.anchor[selectedId].y = this.props.originAnchorCanvas[selectedId].y;
    canvasData.anchor[selectedId].notSaved = false;
    canvasData.anchor[selectedId].notSavedType = '';
    anchors[selectedId].coords[0] = (canvasData.anchor[selectedId].x - canvasData.map.x + canvasData.map.w/2)/RATIO/scaling;
    anchors[selectedId].coords[1] = (canvasData.anchor[selectedId].y - canvasData.map.y + canvasData.map.h/2)/RATIO/scaling;
    this.props.reDraw({ canvasData, anchors });
  }

  // 删除确认框
  confirmDelete = () => {
    let _this = this;
    confirm({
      title: '是否删除该anchor？',
      onOk() {
        _this.deleteAnchor(_this.props.state.selectedId);
      },
      onCancel() {},
    });
  }

  deleteAnchor = async (id) => {
    const { canvasData, anchors } = this.props.state;
    this.setState({deleteLoading: true})
    this.props.form.resetFields();
    const result = await reqDeleteAnchor(id)
    if (result.code===200) {
      delete canvasData.anchor[id];
      delete anchors[id];
      delete this.props.originAnchorCanvas[id];
      this.props.reDraw({ canvasData, anchors, selectedId: ''})
      message.success("删除成功");
    }
    else {
      message.error("删除失败" + result.message)
    }
    this.setState({deleteLoading: false})
  }

  checkBoxChange = checkedList => {

  };

  handleVisibleChange = flag => {
    this.setState({ visible: flag });
  };

  onSelectChange = selectedRowKeys => {
    console.log(selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  componentDidMount = () =>{

  }

  render () {
    const { anchors } = this.props.state;
    const { searchKey, tags ,selectedRowKeys, showTable } = this.state;
    // const { getFieldDecorator } = this.props.form;

    // const layout = {
    //   labelCol: { span: 3 },
    //   wrapperCol: { span: 21 },
    // };

    const columns = [
      {
        title: 'tId',
        dataIndex: 'tId',
        key: 'tId',
        // render: text => <a>{text}</a>,
      },
      // {
      //   title: 'Action',
      //   key: 'action',
      //   render: (text, record) => (
      //     <span>
      //       <a>Action 一 {record.name}</a>
      //       <Divider type="vertical" />
      //       <a>Delete</a>
      //       <Divider type="vertical" />
      //       <a className="ant-dropdown-link">
      //         More actions <Icon type="down" />
      //       </a>
      //     </span>
      //   ),
      // },
    ];
    // 搜索结果
    // const searchResult = Object.keys(anchors).map((id) => {
    //   if (anchors[id].aId) {
    //     return anchors[id].aId.includes(searchKey) ? (
    //       <Menu.Item key={id}>
    //         <Highlighter
    //           highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
    //           searchWords={[searchKey]}
    //           autoEscape
    //           textToHighlight={anchors[id].aId}
    //         />
    //       </Menu.Item>
    //     ) : null
    //   } else {
    //     return null;
    //   }
    // });

    //
    const rowSelection = {
      selectedRowKeys,
      columnWidth: 30,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      selections: [
        {
          key: 'all-data',
          text: 'Select All Data',
          onSelect: () => {
            this.setState({
              selectedRowKeys: [...Array(tags.length).keys()], // 0...45
            });
          },
        },
      ],
    };

    // 搜索下拉菜单
    // const overlay = (
    //   <Menu
    //     style={{maxHeight: 200, overflow: 'auto'}}
    //     // onClick={this.moveAnchorToCentre}
    //   >
    //     {/* {searchResult} */}

    //   </Menu>
    // );

    // 修改状态时显示的button
    // const UpdateBtn = () => (
    //   <div>
    //     <div className="update-btn">
    //       <Button loading={updateLoading} onClick={() => this.updateAnchor(selectedId)}>
    //         提交修改
    //       </Button>
    //     </div>
    //     <div className="update-btn">
    //       <Button onClick={this.cancelMove}>
    //         撤销移动
    //       </Button>
    //     </div>
    //     <div className="delete-btn">
    //       <Button
    //         loading={deleteLoading} onClick={this.confirmDelete}>
    //         删除
    //       </Button>
    //     </div>
    //   </div>
    // );

    // 添加状态时显示的button
    // const AddBtn = () => (
    //   <div>
    //     <div className="update-btn">
    //       <Button loading={addLoading} onClick={() => this.addAnchor()}>
    //         确定添加
    //       </Button>
    //     </div>
    //     <div className="delete-btn">
    //       <Button loading={deleteLoading} onClick={this.cancelAdd}>
    //         取消
    //       </Button>
    //     </div>
    //   </div>
    // );

    return (
    <div className='data-control'>
      <div className="search-add">
        {/* <Dropdown
          overlay={overlay}
          trigger={['click']}
          onVisibleChange={this.handleVisibleChange}
          visible={this.state.visible}>
        </Dropdown> */}
        <Input
          placeholder="根据aId查询"
          suffix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
          onFocus={()=>{this.setState({ showTable: true }) }}
          // onBlur={()=>{this.setState({ showTable: false }) }}
          onChange={(event) => {this.setState({searchKey: event.target.value})}}
          allowClear
        />
        <Button onClick={() => {this.clickAdd()}} >
          <Icon type='plus'/>
        </Button>
        <LinkButton onClick={() => {}} >
          <Dropdown
            overlay={
              <Menu
                style={{maxHeight: 200, overflow: 'y'}}
                // onClick={this.moveAnchorToCentre}
              >
                <Menu.Item key="0">
                  <Row gutter={8}>
                    <Col span={16}>
                      显示anchor
                    </Col>
                    <Col span={8}>
                    <Switch
                      size="small"
                      onChange={this.props.swichShowAnchor}
                      defaultChecked/>
                    </Col>
                  </Row>
                </Menu.Item>
                <Menu.Item key="1">
                  <Row gutter={8}>
                    <Col span={16}>
                      历史坐标个数
                    </Col>
                    <Col span={8}>
                      <InputNumber size="small"
                        min={0}
                        max={8}
                        defaultValue={3}
                        onChange={this.props.tagHistoryCount}
                        style={{width: 50}}
                      />
                    </Col>
                  </Row>
                 {/* <div>
                  历史坐标个数
                  <InputNumber size="small"
                    min={0}
                    max={8}
                    defaultValue={3}
                    onChange={this.props.tagHistoryCount}
                    style={{width: 50}}
                    />
                 </div> */}
                </Menu.Item>
              </Menu>
            }
            // trigger={['click']}
            onVisibleChange={this.handleVisibleChange}
            visible={this.state.visible}
          >
            <Icon type='more'/>
          </Dropdown>
        </LinkButton>
      </div>
      {showTable? (<div className="anchor-form">
        <Table
          bordered={false}
          // loading={false}
          pagination={false}
          size={'middle'}
          // expandedRowRender
          // title={undefined}
          // showHeader={false}
          // footer
          rowSelection={rowSelection}
          // scroll={{y:400}}
          // tableLayout={undefined}
          columns={columns}
          dataSource={this.state.tags}
        />
      </div>) : null}
    </div>)
  }
}

export default Form.create()(DataControl);

