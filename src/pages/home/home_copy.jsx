import React, { Component } from 'react'
import { Redirect} from "react-router-dom";
// import pic_map from '../../assets/images/map.png'
import './home.less'
import {
  Form,
  Icon,
  Input,
  Button,
  message,
  Radio,
  Row,
  Col,
} from 'antd'
import storageUtils from '../../utils/storageUtils'
// import memoryUtils from '../../utils/memoryUtils'
import map_svg from './map_pin.svg';
import memoryUtils from '../../utils/memoryUtils';
const Item = Form.Item // 不能写在import之前
const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 },
};
const user = storageUtils.getUser();

const level = user.level;
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.state = {
      circle_r: 15,
      colorList: ['red', 'green', 'yellow', 'blue'],
      locationList: [
        [250, 300], [100, 100], [123, 132], [400, 204]
      ],
      selectedIndex: -1,
      forTest: 234,
      dataForShow: [['904E9140F9120000000', '250', '300', '-50', '0.777'],
      ['904E9140F9121111111', '100', '100', '-60', '1.777'],
      ['904E9140F9122222222', '123', '132', '-70', '2.777'],
      ['904E9140F912333333', '400', '204', '-40', '3.777']
      ]
    }


  }

  render() {
    // const user = storageUtils.getUser()
    // console.log("user"+user);
    // if(Object.keys(user).length !== 0) {
    //   return <Redirect to='/login'/>
    // }

    const seletedIndex = this.state.selectedIndex;
    const dataForShow = this.state.dataForShow;
    const locationList = this.state.locationList;
    return (
      <div>
        <Row>
          <Col span={14}>
            <div className='first_div'>
              <svg width="500" height="400">
                {this.state.locationList.map((value, index) => {
                  return (
                    <circle cx={value[0]} cy={value[1]} r={this.state.selectedIndex === index ? 12 : 8}
                      fill={this.state.colorList[index]} onClick={() => {
                        // alert("the people is " + user.level);
                        // console.log("the memory is .....kkk");
                        // console.log(user)
                        this.setState({
                          selectedIndex: index,
                        })
                      }}
                    />
                  )
                })}
              </svg>
            </div>
          </Col>
          <Col span={6}>
            <div className='second_div'>
              <Row>
                <Col span={24} >
                  <Form {...layout} >
                  <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                    <Input.Search
                      placeholder="根据aId查询"
                      onSearch={value => console.log(value)}
                      style={{ width: 200 }}
                    />
                    </Form.Item>

                    <Item label="aId">
                      <Input
                        value={seletedIndex === -1 ? '' : dataForShow[seletedIndex][0]}
                      />
                    </Item>
                    <Form.Item label="x" rules={[{ type: 'number', min: 0, max: 500 }]}>
                      <Input
                        value={seletedIndex === -1 ? '' : locationList[seletedIndex][0]} onChange={(event) => {
                          // if (level != 'user') {
                            for (let i = 0; i < locationList.length; i++) {
                              if (i === seletedIndex) {
                                locationList[i][0] = event.target.value;
                              }
                            }
                            this.setState({
                              locationList: locationList,
                            })
                          // }
                        }}
                      />
                    </Form.Item>
                    <Item label="y" rules={[{ type: 'number', min: 0, max: 400 }]}>
                      <Input
                        value={seletedIndex === -1 ? '' : locationList[seletedIndex][1]} onChange={(event) => {
                          // if (level != 'user') {
                            for (let i = 0; i < locationList.length; i++) {
                              if (i === seletedIndex) {
                                locationList[i][1] = event.target.value;
                              }
                            }
                            this.setState({
                              locationList: locationList,
                            })
                          // }
                        }}
                      />
                    </Item>
                    <Item label="A">
                      <Input
                        value={seletedIndex === -1 ? '' : dataForShow[seletedIndex][3]}
                      />
                    </Item>
                    <Item label="N">
                      <Input
                        value={seletedIndex === -1 ? '' : dataForShow[seletedIndex][4]}
                      />
                    </Item>
                    <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                      <Button type="primary" htmlType="submit">
                        提交修改信息
                      </Button>
                    </Form.Item>

                  </Form>
                </Col>
              </Row>

            </div>
          </Col>
          <Col span={4}>

          </Col>
        </Row>






        <div>
          {/* <svg width="300" height="180" onD
          // mycircle.setAttribute('r', 25);
          >
            <circle cx="90" cy="50" r={this.state.circle_r} class="red" onDragStart={() => console.log("tuozhaui kaishi")} onDragEnd
              ={() => console.log("jieshu tuozhuai")} />
          </svg> */}
          <div >
            <p draggable="true" onDragStart={() => console.log("tuozhaui kaishi")} onDragEnd
              ={() => console.log("jieshu tuozhuai")}>一段文字</p>
          </div>
          <div>
            <img src={map_svg} draggable="true" onDragStart={(event) => {
              console.log("tuozhaui kaishi");
              var e = event || window.event;
              console.log("x is " + e.clientX + "and y is " + e.clientY)

              var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
              var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
              console.log("x is again " + x + " and y again is " + y)

            }} onDragEnd
              ={(event) => {
                console.log("jieshu tuozhuai")
                var e = event || window.event;
                console.log("x is " + e.clientX + "and y is " + e.clientY)
                var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                var y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
                console.log("x is again " + x + " and y again is " + y)
              }}></img>
          </div>
        </div>
        {/* <div>
          <svg viewBox="0 0 50 50" width="50" height="50" onClick={()=>alert("click")} draggable="true" onDragStart={()=>console.log("start")} onDragEnd={()=>alert("end")}>
            <image xlinkHref={map_svg}
               width="100%" height="100%" onClick={()=>alert("click")} draggable="true" onDragStart={()=>console.log("start")} onDragEnd={()=>alert("end")}/>
          </svg>
        </div> */}
      </div>


    )
  }
}

