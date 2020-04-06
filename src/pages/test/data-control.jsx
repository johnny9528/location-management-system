import React, { Component } from 'react'
import { Form, Icon, Input, Button, message, Switch,  Modal, Dropdown, Menu, Table, InputNumber, Row, Col, Tooltip } from 'antd'
import Highlighter from 'react-highlight-words';
import { reqDeleteTag, reqUserDeleteTag } from '../../api'
import LinkButton from '../../components/link-button';

const { confirm } = Modal;

class DataControl extends Component {
  constructor (props) {
    super(props);
    this.state = {
      searchKey: '', //搜索关键词
      searchVisible: false, // 控制search下拉菜单的显示
      moreVisible: false, // 控制more下拉菜单的显示
    };
  }

  // 删除确认框
  confirmDelete = (id) => {
    let _this = this;
    confirm({
      title: '是否删除该anchor？',
      onOk() {
        _this.deleteTag(id)
      },
      onCancel() {},
    });
  }

  // 控制搜索下拉菜单显示
  handleSearchVisibleChange = flag => {
    this.setState({ searchVisible: flag });
  };

  // 控制更多操作下拉菜单显示
  handleMoreVisibleChange = flag => {
    this.setState({ moreVisible: flag });
  }

  deleteTag = async (id) => {
    const level = this.props.user.level;
    let result;
    if (level === 'admin') {
      result = await reqDeleteTag(id)
    } else {
      result = await reqUserDeleteTag(id)
    }
    if (result.code===200) {
      message.success("删除成功");
      this.props.getTags()
    }
    else {
      message.error(result.message)
    }
  }


  render () {
    const { selectedRowKeys, tags } = this.props.state;
    const { searchKey, searchVisible, moreVisible } = this.state;

    const columns = [
      {
        width: '40%',
        title: 'tId',
        dataIndex: 'tId',
        key: 'tId',
        render: (text, tag) => {
          let time = `创建时间: ${tag.createTime} 修改时间: ${tag.updateTime}`;
          return <Tooltip
            placement="topLeft"
            title={time}
            >
              <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchKey]}
                autoEscape
                textToHighlight={text}
              />
          </Tooltip>
        },
      },
      {
        width: '30%',
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        onCell: () => {
          return {
            style: {
              maxWidth: 150,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow:'ellipsis',
              cursor:'pointer'
            }
          }
        },
        render: (text) => <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
      },
      {
        // width: '20%',
        title: '操作',
        render: (tag) => {
          return (
            <span>
              <LinkButton onClick={() => {
                this.setState({ searchVisible: false});
                this.props.setShowModal('update', tag)
                }}>
                <Icon type="edit" />
              </LinkButton>
              {/* <Divider type="vertical" /> */}
              <LinkButton onClick={() => {
                this.setState({ searchVisible: false});
                this.confirmDelete(tag._id)
                }}>
                <Icon type="delete" />
              </LinkButton>
            </span>
          )
        }
      },
    ];

    // 表格前选择框
    const rowSelection = {
      selectedRowKeys,
      columnWidth: 30,
      onChange: this.props.onSelectChange,
      hideDefaultSelections: true,
    };

    // 过滤搜索结果
    const searchResult = tags.filter(item => {
      return item.tId.includes(searchKey) === true;
    });

    // 搜索结果下拉菜单
    const searchMenu = (
      <Menu
      // style={{maxHeight: 500, overflow: 'auto'}}
      >
        <Menu.Item>
          <Table
            rowKey='_id'
            bordered={false}
            loading={searchResult ? false : true }
            pagination={false}
            size={'middle'}
            rowSelection={rowSelection}
            scroll={{y:400}}
            columns={columns}
            dataSource={searchResult}
            style={{width: 330}}
          />
        </Menu.Item>
      </Menu>
    );

    // 更多操作下拉菜单
    const moreMenu = (
      <Menu style={{maxHeight: 200, overflow: 'y'}} >
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
        </Menu.Item>
      </Menu>
    );

    return (
    <div className='data-control'>
      <div className="search-add">
        <Dropdown
          overlay={searchMenu}
          // trigger={['click']}
          placement="bottomCenter"
          onVisibleChange={this.handleSearchVisibleChange}
          visible={searchVisible}
        >
          <Input
            placeholder="根据aId查询"
            suffix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
            onChange={(event) => {this.setState({searchKey: event.target.value})}}
            allowClear
          />
        </Dropdown>
        <Button onClick={() => {this.props.setShowModal('add')}} >
          <Icon type='plus'/>
        </Button>
        <Dropdown
          overlay={moreMenu}
          // trigger={['click']}
          onVisibleChange={this.handleMoreVisibleChange}
          visible={moreVisible}
        >
          <LinkButton onClick={() => {}} >
            <Icon type='more'/>
          </LinkButton>
        </Dropdown>
      </div>
    </div>)
  }
}

export default Form.create()(DataControl);

