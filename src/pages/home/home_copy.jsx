import React, { Component } from 'react'
import pic_map from '../../assets/images/map.png'
import './home.less'
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.state = {
      colorList: ['red', 'green', 'yellow', 'blue'],
      locationList: [
        [100, 100], [123, 132], [400, 204], [250, 300]
      ]
    }


  }
  componentDidMount() {
    const canvas = this.canvas.current;
    if (canvas.getContext) {
      var ctx = canvas.getContext("2d");
      console.log(ctx);
      console.log(Object.getPrototypeOf(ctx));
      // ctx.moveTo(0, 0);
      // ctx.lineTo(200, 100);

      // ctx.beginPath();

      // ctx.arc(100, 75, 8, 0, 2 * Math.PI);
      // ctx.fillStyle='red';
      // ctx.fill();
      // ctx.stroke();

      for (let i = 0; i < this.state.locationList.length; i++) {

        let location = this.state.locationList[i];
        console.log("the test is " + location);
        ctx.beginPath();
        ctx.arc(location[0], location[1], 8, 0, 2 * Math.PI);
        ctx.fillStyle = this.state.colorList[i];
        ctx.fill();
        ctx.stroke();
      }
    }
  }
  render() {
    return (
      <div className='first_div'>

        <canvas ref={this.canvas} width="500" height="400">
          您的浏览器不支持canvas，请更换浏览器.
        </canvas>
        {/* <img src={pic_map} alt="logo" /> */}

      </div>

    )
  }
}
