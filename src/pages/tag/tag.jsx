import React, {Component} from 'react'
import { Redirect} from "react-router-dom";
import {
  Card,
  Select,
  Input,
  Button,
  Icon,
  Table,
  message,
  Modal,
  Popconfirm,
  Badge,
  Divider,
  Tooltip
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqTags, reqAddTag, reqUpdateTag, reqDeleteTag, reqSearchTags} from '../../api'
import {PAGE_SIZE} from '../../utils/constants'
import storageUtils from '../../utils/storageUtils'

import AddForm from './add-form'
import UpdateForm from './update-form'

const Option = Select.Option

/*
Product的默认子路由组件
 */
export default class Tag extends Component {

  state = {
    tags: [],
//     total: 0, // 商品的总数量
//     products: [], // 商品的数组
    loading: false, // 是否正在加载中
    searchKey: '', // 搜索的关键字
    searchType: 'searchTId', // 根据哪个字段搜索
    showStatus: 0,
    searchText: '',
    searchedColumn: '',
    confirmAddLoading: false,
    confirmUpdateLoading: false,
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
              {/*将product对象使用state传递给目标路由组件*/}
              <LinkButton onClick={() => this.showUpdate(tag)}>修改</LinkButton>
              <Divider type="vertical" />
              <Popconfirm
                title="确定删除此标签?"
                onConfirm={() => this.deleteTag(tag._id)}
                okText="是"
                cancelText="否"
              >
                <LinkButton>删除</LinkButton>
              </Popconfirm>
            </span>
          )
        }
      },
    ];
  }

  /*
  获取指定页码的列表数据显示
   */
  getTags = async (pageNum) => {
    // this.pageNum = pageNum // 保存pageNum, 让其它方法可以看到
    this.setState({loading: true}) // 显示loading

    const {searchKey, searchType} = this.state
    // 如果搜索关键字有值, 说明我们要做搜索分页
    let result
    if (searchKey) {
      result = await reqSearchTags(searchType, searchKey)
    } else { // 一般分页请求
      result = await reqTags();
    }
		// const result = await reqTags();
    this.setState({loading: false}) // 隐藏loading
    if (result.code === 200) {
      // 取出分页数据, 更新状态, 显示分页列表
      this.setState({
        tags: result.tag
      })
    } else {
      message.error("获取数据失败");
    }
  }

  /*
  显示添加的确认框
  */
  showAdd = () => {
    this.setState({
      showStatus: 1
    })
  }

  /*
  显示修改的确认框
   */
  showUpdate = (tag) => {
    // 保存tag对象
    this.tag = tag
    // 更新状态
    this.setState({
      showStatus: 2
    })
  }

  /*
  响应点击取消: 隐藏确定框
   */
  handleCancel = () => {
    // 清除输入数据
    this.form.resetFields()
    // 隐藏确认框
    this.setState({
      showStatus: 0
    })
  }
  /*
  添加tag
  */
  addTag = () => {
    this.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({confirmAddLoading: true})

        // 收集数据, 并提交添加分类的请求
        const {tId, username, description} = values
				const result = await reqAddTag(tId, username, description)
        if(result.code===200) {
          // 清除输入数据
          this.form.resetFields()
          // 隐藏确认框
          this.setState({showStatus: 0})
          message.success("添加成功");
          this.getTags()
				}
				else {
					message.error(result.message)
        }
        this.setState({confirmAddLoading: false})
      }
    })
  }

  /*
  更新tag
   */
  updateTag = () => {
    // 进行表单验证, 只有通过了才处理
    this.form.validateFields(async (err, values) => {
      if(!err) {
        this.setState({confirmUpdateLoading: true})

        // 准备数据
        const id = this.tag._id
        const {tId, description} = values

        // 发请求更新分类
        const result = await reqUpdateTag(id, tId, description)

        if (result.code === 200) {
          // 隐藏确定框
          this.setState({
            showStatus: 0
          })
          // 清除输入数据
          this.form.resetFields()
          // 重新显示列表
          message.success("修改成功");
          this.getTags()
        }
        else if (result.code === 11000) {
          message.error('tId已存在')
        }
        this.setState({confirmUpdateLoading: false})
      }
    })
  }

  /*
  删除tag
  */
  deleteTag = async (id) => {
    const result = await reqDeleteTag(id)
    if (result.code===200) {
      message.success("删除成功");
      this.getTags()
    }
    else {
      message.error(result.message)
    }
  }

  refresh () {
    this.setState({ searchKey: '', searchType: 'searchTId'}, () => {
      this.getTags()
    });

  }

  componentWillMount () {
    this.initColumns()
  }

  componentDidMount () {
    this.getTags()
  }

  render() {

    const user = storageUtils.getUser()
    if(user.level !== "admin") {
      message.warn("无权访问")
      return <Redirect to='/login'/>
    }

    // function onChange(pagination, filters, sorter, extra) {
    //   console.log('params', pagination, filters, sorter, extra);
    // }

    // 取出状态数据
    const {tags, loading, showStatus, searchType, searchKey, confirmAddLoading, confirmUpdateLoading} = this.state

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
        <Button type='primary' icon="search" onClick={() => this.getTags(1)}>搜索</Button>
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
          // bordered
          rowKey='_id'
          loading={loading}
          dataSource={tags}
          columns={this.columns}
          pagination={{
          //   current: this.pageNum,
          //   total,
            defaultPageSize: PAGE_SIZE,
            showQuickJumper: true,
          //   onChange: this.getProducts
          }}
          // onChange={onChange}
          size={"middle"}
        />

      <Modal
        title="添加用户"
        visible={showStatus===1}
        onOk={this.addTag}
        onCancel={this.handleCancel}
        confirmLoading={confirmAddLoading}
      >
        <AddForm
          setForm={(form) => {this.form = form}}
        />
      </Modal>

      <Modal
        title="更新用户"
        visible={showStatus===2}
        onOk={this.updateTag}
        onCancel={this.handleCancel}
        confirmLoading={confirmUpdateLoading}
      >
        <UpdateForm
          tag = {this.tag}
          setForm={(form) => {this.form = form}}
        />
      </Modal>


      </Card>
    )
  }
}