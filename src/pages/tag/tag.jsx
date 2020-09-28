import React, {Component} from 'react'
import { Redirect} from "react-router-dom";
import { connect } from 'react-redux'
import {
  Card,
  Select,
  Input,
  Button,
  Icon,
  Table,
  message,
  Modal,
  Badge,
  Divider,
  Tooltip
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqTags, reqDeleteTag, reqSearchTags} from '../../api'
import { PAGE_SIZE } from '../../config'
import { getTags } from "../../redux/actions";
// import storageUtils from '../../utils/storageUtils'
import AddForm from './add-form'
import UpdateForm from './update-form'

const Option = Select.Option
const { confirm } = Modal;

class Tag extends Component {

  state = {
    tags: [],
    searchTags: [],
    loading: false, // 是否正在加载中
    searchKey: '', // 搜索的关键字
    searchType: 'searchTId', // 根据哪个字段搜索
    showStatus: 0,
    showModal: '',
    searchText: '',
    searchedColumn: '',
    showSearchResult: false,
  }

  /*
  初始化table的列的数组
   */
  initColumns = () => {
    this.columns = [
      {
        width:'10%',
        title: '编号',
        dataIndex: 'tId',
        sorter: (a, b) => a.tId > b.tId
      },
      {
        width:'10%',
        title: '用户名',
        dataIndex: 'user',
        render: (user) => user.username
      },
      {
        width:'10%',
        title: '描述',
        dataIndex: 'description',
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
        width:'10%',
        title: '创建时间',
        dataIndex: 'createTime',
        sorter: (a, b) => a.createTime > b.createTime,
      },
      {
        width:'10%',
        title: '最近修改时间',
        dataIndex: 'updateTime',
        sorter: (a, b) => a.updateTime > b.updateTime
      },
      {
        width:'10%',
        title: '状态',
        dataIndex: 'status',
        render: (status) => {
          // const show = status ? "正常" : "异常"
          return(
          <span>
            <Badge status="success" />
            正常
          </span>
          )
        }
      },
      {
        width:'10%',
        title: '操作',
        render: (tag) => {
          return (
            <span>
              <LinkButton onClick={() => this.showUpdate(tag)}>修改</LinkButton>
              <Divider type="vertical" />
              <LinkButton onClick={() => this.confirmDelete(tag._id)}>删除</LinkButton>
            </span>
          )
        }
      },
    ];
  }

  /*
  获取tags列表
   */
  getTags = async () => {
    this.setState({loading: true}) // 显示loading

    const {searchKey, searchType} = this.state
    let result
    if (searchKey) {
      result = await reqSearchTags(searchType, searchKey)
    } else { // 一般分页请求
      // 如果store中有tags则直接使用
      if (this.props.tags.length > 0) {
        this.setState({ tags: this.props.tags })
        this.setState({ loading: false }) // 隐藏loading
        return;
      }
      result = await reqTags();
    }
    this.setState({loading: false}) // 隐藏loading
    if (result.code === 200) {
      // 取出分页数据, 更新状态, 显示分页列表
      if (searchKey) {
        this.setState({searchTags: result.tag, showSearchResult: true})
      } else {
        this.setState({tags: result.tag})
      }
    } else {
      message.error("获取数据失败");
    }
  }

  /*
  显示添加的确认框
  */
  showAdd = () => {
    this.setState({showModal: 'add'})
  }

  /*
  显示修改的确认框
   */
  showUpdate = (tag) => {
    // 保存tag对象
    this.tag = tag
    // 更新状态
    this.setState({showModal: 'update'})
  }

  /*
  重置showModal
  */
  setShowModal = (option) => {
    this.setState({ showModal: option});
  }

  confirmDelete = (id) => {
    let _this = this;
    confirm({
      title: '是否删除该tag？',
      onOk() {
        _this.deleteTag(id)
      },
      onCancel() {},
    });
  }

  /*
  删除tag
  */
  deleteTag = async (id) => {
    let hide = message.loading('删除中', 0);
    const result = await reqDeleteTag(id)
    if (result.code===200) {
      hide();
      message.success("删除成功");
      this.props.getTags(this.props.user.level)
      // this.getTags()
    }
    else {
      message.error("删除失败" + result.message)
    }
  }

  refresh () {
    this.setState({ searchKey: '', searchType: 'searchTId', showSearchResult: false})
  }

  componentWillMount () {
    this.initColumns()
  }

  render() {

    const user = this.props.user
    if(user.level !== "admin") {
      message.warn("无权访问")
      return <Redirect to='/login'/>
    }

    const {searchType, searchKey, showModal, showSearchResult} = this.state
    const tags = showSearchResult ? this.state.searchTags : (this.props.tags || this.state.tags)

    const title = (
      <div>
        <Select
          value= {searchType}
          style={{width: 150}}
          onChange={value => this.setState({searchType: value})}
        >
          <Option value='searchTId'>按编号搜索</Option>
          <Option value='searchDesc'>按描述搜索</Option>
        </Select>
        <Input
          placeholder='关键字'
          style={{width: 150, margin: '0 15px'}}
          value={searchKey}
          onChange={event => this.setState({searchKey:event.target.value})}
        />
        <Button type='primary' icon="search" onClick={() => this.getTags()}>搜索</Button>
        <Button type='primary' icon="redo" style={{marginLeft: 10}} onClick={() => this.refresh()}>刷新</Button>
      </div>
    )

    const extra = (
      <Button type='primary' onClick={() => this.showAdd()}>
        <Icon type='plus'/>
        添加
      </Button>
    )

    return (
      <Card title={title} extra={extra}>
        <Table
          rowKey='_id'
          // loading={tags.length ? false : true}
          dataSource={tags}
          columns={this.columns}
          pagination={{
            defaultPageSize: PAGE_SIZE,
            showQuickJumper: true,
          }}
        />
        <AddForm
          showModal={showModal}
          setShowModal={this.setShowModal}
        />
        <UpdateForm
          tag={this.tag}
          showModal={showModal}
          setShowModal={this.setShowModal}
        />
      </Card>
    )
  }
}

export default connect(
  state => ({user: state.user, tags: state.tags}),
  {getTags}
)(Tag)
