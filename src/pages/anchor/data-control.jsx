import React, { Component } from 'react'
import { Form, Icon, Input, Button, message, Tooltip, Modal, Dropdown, Menu } from 'antd'
import Highlighter from 'react-highlight-words';
import { reqAddAnchor, reqUpdateAnchor, reqDeleteAnchor } from '../../api'
const Item = Form.Item
const { confirm } = Modal;
const REAL_WIDTH = 55;  //地图实际大小
const REAL_HEIGH = 44;
const MAP_W = 700; //网页地图大小
const MAP_H = MAP_W/REAL_WIDTH*REAL_HEIGH;
const RATIO = MAP_W/REAL_WIDTH; //真实地图与网页地图比值
const ANCHOR_W = 30; //绘图anchor宽度
const ANCHOR_H = 30; //绘图anchor高度
const TRIGGER_RADIS = 15; //触发事件的半径

class DataControl extends Component {
  constructor (props) {
    super(props);
    this.state = {
      addLoading: false, //添加按钮loading状态
      updateLoading: false, //修改按钮loading状态
      deleteLoading: false, //修改按钮loading状态
      searchKey: '', //搜索关键词
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

  render () {
    const { anchors, selectedId, showAdd } = this.props.state;
    const { addLoading, updateLoading, deleteLoading, searchKey, } = this.state;
    const { getFieldDecorator } = this.props.form;

    const layout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    };

    // 搜索结果
    const searchResult = Object.keys(anchors).map((id) => {
      if (anchors[id].aId) {
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
    });

    // 搜索下拉菜单
    const overlay = (
      <Menu
        style={{maxHeight: 200, overflow: 'auto'}}
        onClick={this.moveAnchorToCentre}
      >
        {searchResult}
      </Menu>
    );

    // 修改状态时显示的button
    const UpdateBtn = () => (
      <div>
        <div className="update-btn">
          <Button loading={updateLoading} onClick={() => this.updateAnchor(selectedId)}>
            提交修改
          </Button>
        </div>
        <div className="update-btn">
          <Button onClick={this.cancelMove}>
            撤销移动
          </Button>
        </div>
        <div className="delete-btn">
          <Button
            loading={deleteLoading} onClick={this.confirmDelete}>
            删除
          </Button>
        </div>
      </div>
    );

    // 添加状态时显示的button
    const AddBtn = () => (
      <div>
        <div className="update-btn">
          <Button loading={addLoading} onClick={() => this.addAnchor()}>
            确定添加
          </Button>
        </div>
        <div className="delete-btn">
          <Button loading={deleteLoading} onClick={this.cancelAdd}>
            取消
          </Button>
        </div>
      </div>
    );

    return (
    <div className='data-control'>
      <div className="search-add">
        <Dropdown overlay={overlay}  trigger={['click']}>
          <Input
            placeholder="根据aId查询"
            suffix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
            onChange={(event) => {this.setState({searchKey: event.target.value})}}
            allowClear
          />
        </Dropdown>
        <Button onClick={() => {this.clickAdd()}} >
          <Icon type='plus'/>
        </Button>
      </div>
      {!selectedId ? null : (
      <div className="anchor-form">
        <Form hideRequiredMark>
          <Item label="aId" {...layout}>
            {getFieldDecorator('aId', {
              initialValue: !selectedId ? '' : anchors[selectedId].aId,
              validateFirst: true,
              rules: [{ required: true, message: 'aId不能为空' }]
            })(
              <Input/>
            )}
          </Item>
          <Item label="x" {...layout}>
            {getFieldDecorator("x", {
              initialValue: !selectedId ? '' : anchors[selectedId].coords[0].toFixed(2),
              validateFirst: true,
              rules: [{ validator: this.validatorNumber(0, 55)}]
            })(
              <Input
                onChange={this.InputOnChange('x')}
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
              rules: [{ validator: this.validatorNumber(0, 44)}]
            })(
              <Input
                onChange={this.InputOnChange('y')}
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
              rules: [{ validator: this.validatorNumber(-80, -30)}]
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
              rules: [{ validator: this.validatorNumber(0, 4)}]
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
          {showAdd ? <AddBtn/> : <UpdateBtn/>}
        </Form>
      </div>
      )}
    </div>)
  }
}

export default Form.create()(DataControl);

