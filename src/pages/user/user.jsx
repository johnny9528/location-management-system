import React, { Component } from "react";
import { Redirect} from "react-router-dom";
import { connect } from 'react-redux'
import { Table, Badge, message, Button, Modal, Card, Icon, Divider, Tooltip } from "antd";

import LinkButton from "../../components/link-button/index";
import { reqUsers, reqAddUser, reqUpdateUser, reqDeleteUser } from "../../api/index";
// import storageUtils from '../../utils/storageUtils'
import AddForm from './add-form'
import UpdateForm from './update-form'
import { getUsers } from "../../redux/actions";

const { confirm } = Modal;

class User extends Component {
  state = {
    data: [],
    userLevel: 1,
    isShow: false, // 是否显示确认框
    showStatus: 0,
    loading: false,
    expandedRowKeys: [], //装展开行的key
    confirmAddLoading: false,
    confirmUpdateLoading: false,
    confirmDeleteLoading: false,
  };

  initColumns = () => {
    this.userCol = [
      {
        width:'16%',
        title: "用户名",
        dataIndex: "username",
      },
      {
        width:'16%',
        title: "邮箱",
        dataIndex: "email",
      },
      {
        width:'16%',
        title: "上次登录时间",
        dataIndex: "lastLoginTime",
      },
      {
        width:'16%',
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        width:'16%',
        title: '最近修改时间',
        dataIndex: 'updateTime',
      },
      {
        width:'16%',
        title: "操作",
        render: (user) => {
          return (
            <span>
              <LinkButton onClick={() => this.showUpdate(user)}>修改</LinkButton>
              <Divider type="vertical" />
              <LinkButton onClick={() => this.confirmDelete(user._id)}>删除</LinkButton>
            </span>
          );
        }
      }
    ];
    this.tagCol = [
      {
        width:'20%',
        title: "标签编号",
        dataIndex: "tId",
        sorter: (a, b) => a.tId > b.tId
      },
      {
        width:'20%',
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
        width:'20%',
        title: '创建时间',
        dataIndex: 'createTime',
        sorter: (a, b) => a.createTime > b.createTime,
      },
      {
        width:'20%',
        title: '最近修改时间',
        dataIndex: 'updateTime',
        sorter: (a, b) => a.updateTime > b.updateTime
      },
      {
        width:'20%',
        title: "状态",
        dataIndex: "status",
        render: (status) => {
          // const show = status ? "正常" : "异常"
          return (
            <span>
              <Badge status="success" />
              正常
            </span>
          );
        }
      }
    ];
  };

  getUsers = async () => {
    this.setState({loading: true}) // 显示loading

    // 如果store中有users则直接使用
    if (this.props.users.length > 0) {
      const data = this.nestTable(this.props.users)
      this.setState({ data })
      this.setState({loading: false})
      return;
    }

    const result = await reqUsers();
    this.setState({loading: false}) // 隐藏loading

    if (result.code === 200) {
      const data = this.nestTable(result.users)
      this.setState({ data });
    } else {
      message.error("获取数据失败");
    }
  };

  //嵌套表格数据
  nestTable = (users) => {
    let data = [...users];
    data.forEach((item, index) => {
      if (Array.isArray(users[index].tags)) {
        item.tags = (
          <Table
            rowKey='_id'
            className="components-table-demo-nested"
            columns={this.tagCol}
            dataSource={users[index].tags}
            pagination={false}
            size='middle'
          />
        );
      }
    });
    return data
  }

  /*
  显示添加的确认框
  */
  showAdd = () => {
    this.setState({
      showStatus: 1
    });
  };

  /*
  显示修改的确认框
  */
  showUpdate = (user) => {
    // // 保存tag对象
    this.user = user;
    // // 更新状态
    this.setState({
      showStatus: 2
    });
  };

  /*
  响应点击取消: 隐藏确定框
  */
  handleCancel = () => {
    // // 清除输入数据
    // this.form.resetFields();
    // // 隐藏确认框
    this.setState({
      showStatus: 0
    });
  };
  /*
  添加user
  */
  addUser = () => {
    this.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({confirmAddLoading: true})
        // 收集数据, 并提交添加分类的请求
        const { username, email, password } = values;
        const result = await reqAddUser(username, email, password);

        if (result.code === 200) {
          // 清除输入数据
          this.form.resetFields();
          // 隐藏确认框
          this.setState({
            showStatus: 0
          });
          message.success("添加成功");
          this.props.getUsers()
          // this.getUsers();
        } else {
          message.error("添加失败" + result.message);
        }
        this.setState({confirmAddLoading: false})
      }
    });
  };
  /*
  更新user
   */
  updateUser = () => {
    // 进行表单验证, 只有通过了才处理
    this.form.validateFields(async (err, values) => {
      if(!err) {
        this.setState({confirmUpdateLoading: true})
        // 准备数据
        const id = this.user._id
        const {username, email} = values
        let result = await reqUpdateUser(id, username, email)

        if (result.code === 200) {
          // 隐藏确定框
          this.setState({
            showStatus: 0
          })
          // 清除输入数据
          this.form.resetFields()
          message.success("修改成功");
          this.props.getUsers()
          // this.getUsers()
        }
        else if (result.code === 11000) {
          message.error('修改失败：用户名已存在')
        }
        this.setState({confirmUpdateLoading: false})
      }
    })
  }

  confirmDelete = (id) => {
    let _this = this;
    confirm({
      title: '是否删除该用户？',
      onOk() {
        _this.deleteUser(id)
      },
      onCancel() {},
    });
  }

  deleteUser = async (id) => {
    let hide = message.loading('删除中', 0);
    const result = await reqDeleteUser(id)
    if (result.code===200) {
      hide();
      message.success("删除成功");
      this.props.getUsers()
      // this.getUsers()
    }
    else {
      message.error("删除失败" + result.message)
    }
  };

  /* 展开控制 */
  onExpand = (expanded, record) => {
    let expandedRowKeys = [];
    if (expanded) {
      expandedRowKeys.push(record._id)
    }
    this.setState({ expandedRowKeys });
  }

  componentWillMount() {
    this.initColumns();
  }

  componentDidMount() {
    // 使用redux管理后不需要this.getUsers()
    // this.getUsers();
  }

  render() {
    const user = this.props.user
    if(user.level !== "admin") {
      message.warn("无权访问")
      return <Redirect to='/login'/>
    }

    const { showStatus, loading, expandedRowKeys, confirmAddLoading, confirmUpdateLoading } = this.state;
    const users = this.props.users;
    const data = this.nestTable(users)

    const extra = (
      <Button type='primary' onClick={() => this.showAdd()}>
        <Icon type="user-add" />
      </Button>
    )

    return (
      <Card extra={extra}>
        <Table
          // bordered
          rowKey='_id'
          loading={loading}
          className="components-table-demo-nested"
          columns={this.userCol}
          expandedRowRender={(record) => <span>{record.tags}</span>}
          dataSource={data}
          expandedRowKeys={expandedRowKeys}
          onExpand={this.onExpand}
          // scroll={{ y: 300 }}
        />
        <Modal
            title="添加用户"
            visible={showStatus===1}
            onOk={this.addUser}
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
            onOk={this.updateUser}
            onCancel={this.handleCancel}
            confirmLoading={confirmUpdateLoading}
          >
            <UpdateForm
              user = {this.user}
              setForm={(form) => {this.form = form}}
            />
          </Modal>
        </Card>
    );
  }
}

export default connect(
  //user为当前登录用户，users是管理员可以管理的用户
  state => ({user: state.user, users: state.users}),
  {getUsers}
)(User)