import React, { Component } from "react";
import { Table, Badge, message, Menu, Button, Modal, Card, Icon, Popconfirm, Dropdown, Divider, Tooltip } from "antd";
// import {formateDate} from "../../utils/dateUtils"
import LinkButton from "../../components/link-button/index";
import { reqUsers, reqAddUser, reqUpdateUserName, reqUpdateUserPassword, reqDeleteUser } from "../../api/index";

import AddForm from './add-form'
import UpdateForm from './update-form'
// const expandedRowRender = record => <p>{record.desc}</p>;
/*
用户路由
 */
export default class User extends Component {
  state = {
    // users: [], // 所有用户列表
    // tags: [], // 所有标签列表
    data: [],
    userLevel: 1,
    isShow: false, // 是否显示确认框
    showStatus: 0,
    loading: false,
    expandedRowKeys: [] //装展开行的key
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
        title: "Action",
        render: (user) => {
          return (
            <span>
              {/* <LinkButton onClick={() => this.showUpdate(user)}>修改</LinkButton> */}
              <span className="table-operation">
                {/* <a>Pause</a>
                <a>Stop</a> */}
                <Dropdown overlay={menu(user)}>
                  <LinkButton>
                    修改 <Icon type="down" />
                  </LinkButton>
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
    const result = await reqUsers();
    this.setState({loading: false}) // 隐藏loading

    if (result.code === 200) {
      // 取出分页数据, 更新状态, 显示分页列表
      let data = [...result.users];
      data.forEach((item, index) => {
        item.tags = (
          <Table
            rowKey='_id'
            className="components-table-demo-nested"
            columns={this.tagCol}
            dataSource={result.users[index].tags}
            pagination={false}
            size='middle'
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
    this.getUsers();
  }

  render() {
    const { data, showStatus, loading, expandedRowKeys } = this.state;

    // const title = (
    //   <span>
    //     <Radio.Group
    //       onChange={(e) => this.setState({ userLevel: e.target.value })}
    //       value={this.state.userLevel}
    //     >
    //       <Radio value={1}>普通用户</Radio>
    //       <Radio value={2}>管理员</Radio>
    //     </Radio.Group>
    //   </span>
    // );

    const extra = (
      <Button type='primary' onClick={() => this.showAdd()}>
      <Icon type='plus'/>
      添加
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
