// import React, {Component} from 'react'
// import {
//   Card,
//   Button,
//   Table,
//   Modal,
//   message
// } from 'antd'
// import {formateDate} from "../../utils/dateUtils"
// import LinkButton from "../../components/link-button/index"
// import {reqDeleteUser, reqUsers, reqAddOrUpdateUser} from "../../api/index";
// import UserForm from './user-form'

// /*
// 用户路由
//  */
// export default class User extends Component {

//   state = {
//     users: [], // 所有用户列表
//     roles: [], // 所有角色列表
//     isShow: false, // 是否显示确认框
//   }

//   initColumns = () => {
//     this.columns = [
//       {
//         title: '用户名',
//         dataIndex: 'username'
//       },
//       {
//         title: '邮箱',
//         dataIndex: 'email'
//       },

//       {
//         title: '电话',
//         dataIndex: 'phone'
//       },
//       {
//         title: '注册时间',
//         dataIndex: 'create_time',
//         render: formateDate
//       },
//       {
//         title: '所属角色',
//         dataIndex: 'role_id',
//         render: (role_id) => this.roleNames[role_id]
//       },
//       {
//         title: '操作',
//         render: (user) => (
//           <span>
//             <LinkButton onClick={() => this.showUpdate(user)}>修改</LinkButton>
//             <LinkButton onClick={() => this.deleteUser(user)}>删除</LinkButton>
//           </span>
//         )
//       },
//     ]
//   }

//   /*
//   根据role的数组, 生成包含所有角色名的对象(属性名用角色id值)
//    */
//   initRoleNames = (roles) => {
//     const roleNames = roles.reduce((pre, role) => {
//       pre[role._id] = role.name
//       return pre
//     }, {})
//     // 保存
//     this.roleNames = roleNames
//   }

//   /*
//   显示添加界面
//    */
//   showAdd = () => {
//     this.user = null // 去除前面保存的user
//     this.setState({isShow: true})
//   }

//   /*
//   显示修改界面
//    */
//   showUpdate = (user) => {
//     this.user = user // 保存user
//     this.setState({
//       isShow: true
//     })
//   }

//   /*
//   删除指定用户
//    */
//   deleteUser = (user) => {
//     Modal.confirm({
//       title: `确认删除${user.username}吗?`,
//       onOk: async () => {
//         const result = await reqDeleteUser(user._id)
//         if(result.status===0) {
//           message.success('删除用户成功!')
//           this.getUsers()
//         }
//       }
//     })
//   }

//   /*
//   添加/更新用户
//    */
//   addOrUpdateUser = async () => {

//     this.setState({isShow: false})

//     // 1. 收集输入数据
//     const user = this.form.getFieldsValue()
//     this.form.resetFields()
//     // 如果是更新, 需要给user指定_id属性
//     if (this.user) {
//       user._id = this.user._id
//     }

//     // 2. 提交添加的请求
//     const result = await reqAddOrUpdateUser(user)
//     // 3. 更新列表显示
//     if(result.status===0) {
//       message.success(`${this.user ? '修改' : '添加'}用户成功`)
//       this.getUsers()
//     }
//   }

//   getUsers = async () => {
//     const result = await reqUsers()
//     if (result.status===0) {
//       const {users, roles} = result.data
//       this.initRoleNames(roles)
//       this.setState({
//         users,
//         roles
//       })
//     }
//   }

//   componentWillMount () {
//     this.initColumns()
//   }

//   componentDidMount () {
//     this.getUsers()
//   }

//   render() {

//     const {users, roles, isShow} = this.state
//     const user = this.user || {}

//     const title = <Button type='primary' onClick={this.showAdd}>创建用户</Button>

//     return (
//       <Card title={title}>
//         <Table
//           bordered
//           rowKey='_id'
//           dataSource={users}
//           columns={this.columns}
//           pagination={{defaultPageSize: 2}}
//         />

//         <Modal
//           title={user._id ? '修改用户' : '添加用户'}
//           visible={isShow}
//           onOk={this.addOrUpdateUser}
//           onCancel={() => {
//             this.form.resetFields()
//             this.setState({isShow: false})
//           }}
//         >
//           <UserForm
//             setForm={form => this.form = form}
//             roles={roles}
//             user={user}
//           />
//         </Modal>

//       </Card>
//     )
//   }
// }
import React, { Component } from "react";
import { Table, Badge, message, Menu, Button, Modal, Card, Icon, Popconfirm, Dropdown, Divider } from "antd";
// import {formateDate} from "../../utils/dateUtils"
import LinkButton from "../../components/link-button/index";
import { reqUsers, reqAddUser, reqUpdateUserName, reqUpdateUserPassword, reqDeleteUser } from "../../api/index";

import AddForm from './add-form'
import UpdateForm from './update-form'
// const expandedRowRender = record => <p>{record.desc}</p>;
import LinkedButton from '../../components/link-button'
/*
用户路由
 */
export default class User extends Component {
  state = {
    // users: [], // 所有用户列表
    // tags: [], // 所有标签列表
    data: [],
    isShow: false, // 是否显示确认框
    showStatus: 0,
    loading: false
  };

  initColumns = () => {
    //修改下拉选项
    const menu = (user) => (
      <Menu>
        <Menu.Item>
          <LinkButton
            onClick={() => {
              user.option = true; //选择修改用户名
              this.showUpdate(user);
            }}
          >
            用户名
          </LinkButton>
        </Menu.Item>
        <Menu.Item>
          <LinkButton
            onClick={() => {
              user.option = false; //选择修改密码
              this.showUpdate(user);
            }}
          >
            密码
          </LinkButton>
        </Menu.Item>
      </Menu>
    );
    this.userCol = [
      {
        title: "用户名",
        dataIndex: "username"
        // key: "username"
      },
      {
        title: "创建时间",
        dataIndex: "createdTime"
        // key: "createdTime"
      },
      {
        title: "上次登录时间",
        dataIndex: "lastLoginTime"
        // key: "lastLoginTime"
      },
      {
        title: "Action",
        key: "operation",
        render: (user) => {
          return (
            <span>
              {/* <LinkButton onClick={() => this.showUpdate(user)}>修改</LinkButton> */}
              <span className="table-operation">
                {/* <a>Pause</a>
                <a>Stop</a> */}
                <Dropdown overlay={menu(user)}>
                  <LinkedButton>
                    修改 <Icon type="down" />
                  </LinkedButton>
                </Dropdown>
              </span>
              <Divider type="vertical" />
              <Popconfirm
                title="是否删除此用户所有数据?"
                onConfirm={() => this.deleteUser(user._id)}
                okText="是"
                cancelText="否"
              >
                <LinkButton>删除</LinkButton>
              </Popconfirm>
            </span>
          );
        }
      }
    ];
    this.tagCol = [
      {
        title: "标签编号",
        dataIndex: "tId"
        // key: "tId"
      },
      {
        title: "描述",
        dataIndex: "description"
        // key: "description"
      },
      {
        title: "创建时间",
        dataIndex: "createdTime"
        // key: "createdTime"
      },
      {
        title: "状态",
        dataIndex: "status",
        // key: "status",
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
      // {
      //   width: 200,
      //   title: "操作",
      //   render: (tag) => {
      //     return (
      //       <span>
      //         <LinkButton onClick={() => this.showUpdate(tag)}>修改</LinkButton>
      //         <Popconfirm
      //           title="确定删除此计划?"
      //           onConfirm={() => this.deleteTag(tag._id)}
      //           okText="是"
      //           cancelText="否"
      //         >
      //           <LinkButton>删除</LinkButton>
      //         </Popconfirm>
      //       </span>
      //     );
      //   }
      // }
    ];
  };

  getUsers = async () => {
    this.setState({loading: true}) // 显示loading
    const result = await reqUsers();
    this.setState({loading: false}) // 隐藏loading
    console.log(result);
    if (result.code === 200) {
      // 取出分页数据, 更新状态, 显示分页列表
      let data = [...result.users];
      data.map((item, index) => {
        item.tags = (
          <Table
            className="components-table-demo-nested"
            columns={this.tagCol}
            dataSource={result.users[index].tags}
            pagination={false}
          />
        );
      });
      this.setState({ data });
    }
  };

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
  添加tag
  */
  addUser = () => {
    this.form.validateFields(async (err, values) => {
      if (!err) {
        // 收集数据, 并提交添加分类的请求
        const { username, password } = values;
        const result = await reqAddUser(username, password);
        console.log(result);
        if (result.code === 200) {
          // 清除输入数据
          this.form.resetFields();
          // 隐藏确认框
          this.setState({
            showStatus: 0
          });
          this.getUsers();
        } else {
          message.error(result.message);
        }
      }
    });
  };
  /*
  更新tag
   */
  updateUser = () => {
    // 进行表单验证, 只有通过了才处理
    this.form.validateFields(async (err, values) => {
      if(!err) {

        // 准备数据
        const id = this.user._id
        const {username, password} = values
        console.log(username, password)
        let result;
        if (username) {
          result = await reqUpdateUserName(id, username)
        } else (
          result= await reqUpdateUserPassword(id, password)
        )

        if (result.code === 200) {
          // 隐藏确定框
          this.setState({
            showStatus: 0
          })
          // 清除输入数据
          this.form.resetFields()
          // 重新显示列表
          this.getUsers()
        }
        else if (result.code === 11000) {
          message.error('编号重复')
        }
      }
    })
  }

  deleteUser = async (id) => {
    const result = await reqDeleteUser(id)
    if (result.code===200) {
      this.getUsers()
    }
    else {
      message.error(result.message)
    }
  };

  componentWillMount() {
    this.initColumns();
  }

  componentDidMount() {
    this.getUsers();
  }

  render() {
    const { data, showStatus, loading } = this.state;

    const extra = (
      <Button type='primary' onClick={() => this.showAdd()}>
      <Icon type='plus'/>
      添加
    </Button>
    )

    return (
      <Card  extra={extra}>
        <Table
          bordered
          rowKey='_id'
          loading={loading}
          className="components-table-demo-nested"
          columns={this.userCol}
          expandedRowRender={(record) => <p>{record.tags}</p>}
          dataSource={data}
        />
        <Modal
            title="添加用户"
            visible={showStatus===1}
            onOk={this.addUser}
            onCancel={this.handleCancel}
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
