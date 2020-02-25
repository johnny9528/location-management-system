import React, {Component} from 'react'
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
  Divider
} from 'antd'

import LinkButton from '../../components/link-button'
import {reqTags, reqAddTag, reqUpdateTag, reqDeleteTag, reqSearchTags} from '../../api'
import {PAGE_SIZE} from '../../utils/constants'

import AddForm from './add-form'
import UpdateForm from './update-form'

const Option = Select.Option

/*
Product的默认子路由组件
 */
export default class ProductHome extends Component {

  state = {
    tags: [],
//     total: 0, // 商品的总数量
//     products: [], // 商品的数组
    loading: false, // 是否正在加载中
    searchKey: '', // 搜索的关键字
    searchType: 'searchTId', // 根据哪个字段搜索
    showStatus: 0,
  }

  /*
  初始化table的列的数组
   */
  initColumns = () => {
    this.columns = [
      {
        width: 200,
        title: '编号',
        dataIndex: 'tId',
      },
      {
        width: 200,
        title: '用户名',
        dataIndex: 'user',
        render: (user) => user.username
      },
      {
        title: '描述',
        dataIndex: 'description',
      },
      {
        width: 100,
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
    //   {
    //     title: '价格',
    //     dataIndex: 'price',
    //     render: (price) => '¥' + price  // 当前指定了对应的属性, 传入的是对应的属性值
    //   },
    //   {
    //     width: 100,
    //     title: '状态',
    //     // dataIndex: 'status',
    //     render: (product) => {
    //       const {status, _id} = product
    //       const newStatus = status===1 ? 2 : 1
    //       return (
    //         <span>
    //           <Button
    //             type='primary'
    //             onClick={() => this.updateStatus(_id, newStatus)}
    //           >
    //             {status===1 ? '下架' : '上架'}
    //           </Button>
    //           <span>{status===1 ? '在售' : '已下架'}</span>
    //         </span>
    //       )
    //     }
    //   },
      {
        width: 200,
        title: '操作',
        render: (tag) => {
          return (
            <span>
              {/*将product对象使用state传递给目标路由组件*/}
              {/* <LinkButton onClick={() => this.props.history.push('/product/detail', {product})}>详情</LinkButton>
              <LinkButton onClick={() => this.props.history.push('/product/addupdate', product)}>修改</LinkButton> */}
              <LinkButton onClick={() => this.showUpdate(tag)}>修改</LinkButton>
              <Divider type="vertical" />
              {/* <LinkButton onClick={() => this.deleteTag(tag._id)}>删除</LinkButton> */}
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
		console.log(result);
    this.setState({loading: false}) // 隐藏loading
    if (result.code === 200) {
      // 取出分页数据, 更新状态, 显示分页列表
      this.setState({
        tags: result.tag
      })
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

        // 收集数据, 并提交添加分类的请求
        const {tId, username, description} = values
				const result = await reqAddTag(tId, username, description)
				console.log(result)
        if(result.code===200) {
          // 清除输入数据
          this.form.resetFields()
          // 隐藏确认框
          this.setState({
            showStatus: 0
          })
          this.getTags()
				}
				else {
					message.error(result.message)
				}
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
          this.getTags()
        }
        else if (result.code === 11000) {
          message.error('编号重复')
        }
      }
    })
  }

  deleteTag = async (id) => {
    const result = await reqDeleteTag(id)
    console.log(id)
    if (result.code===200) {
      this.getTags()
    }
    else {
      message.error(result.message)
    }
  }

  componentWillMount () {
    this.initColumns()
  }

  componentDidMount () {
    this.getTags()
  }

  render() {

    // 取出状态数据
    const {tags, loading, showStatus, searchType, searchKey} = this.state

    const title = (
        <span>
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
          <Button type='primary' onClick={() => this.getTags(1)}>搜索</Button>
        </span>
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
            bordered
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
          />

        <Modal
          title="添加用户"
          visible={showStatus===1}
          onOk={this.addTag}
          onCancel={this.handleCancel}
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