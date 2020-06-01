import {
  MAP_W,
  MAP_H,
  // RATIO,
  // ANCHOR_W,
  // ANCHOR_H,
  // TRIGGER_RADIS,
} from '../config/mapConfig'

/**
  * 缩放修改坐标
  * @method zoom
  * @param {Object} canvasData canvas绘图数据
  * @param {Number} scaling 缩放比例
  * @param {Boolean} updateOriginAnchor 是否更新初始anchor，默认true
  * @return {Object} 缩放后canvas绘图数据
  */
export const zoom = (canvasData, scaling, updateOriginAnchor = true) => {
  let canvasData_after = JSON.parse(JSON.stringify(canvasData));
  canvasData_after.map.w = MAP_W * scaling;
  canvasData_after.map.h = MAP_H * scaling;

  Object.keys(canvasData.anchor).forEach((id) => {
    canvasData_after.anchor[id].x = canvasData_after.map.x - (canvasData_after.map.x - canvasData_after.anchor[id].x) * canvasData_after.map.w / canvasData.map.w;
    canvasData_after.anchor[id].y = canvasData_after.map.y - (canvasData_after.map.y - canvasData_after.anchor[id].y) * canvasData_after.map.h / canvasData.map.h;
    if (updateOriginAnchor) {
      canvasData_after.originAnchor[id].x = canvasData_after.map.x - (canvasData_after.map.x - canvasData_after.originAnchor[id].x) * canvasData_after.map.w / canvasData.map.w;
      canvasData_after.originAnchor[id].y = canvasData_after.map.y - (canvasData_after.map.y - canvasData_after.originAnchor[id].y) * canvasData_after.map.h / canvasData.map.h;
    }
  });

  return canvasData_after;
}

/**
  * 移动修改坐标
  * @method move
  * @param {Object} canvasData canvas绘图数据
  * @param {Number} offset_x x轴偏移
  * @param {Number} offset_y y轴偏移
  * @param {Boolean} updateOriginAnchor 是否更新初始anchor，默认true
  * @return {Object} 移动后canvas绘图数据
  */
export const move = (canvasData, offset_x, offset_y, updateOriginAnchor = true) => {
  let canvasData_after = JSON.parse(JSON.stringify(canvasData));
  canvasData_after.map.x = canvasData.map.x + offset_x;
  canvasData_after.map.y = canvasData.map.y + offset_y;

  Object.keys(canvasData_after.anchor).forEach((id) => {
    canvasData_after.anchor[id].x = canvasData_after.anchor[id].x + offset_x;
    canvasData_after.anchor[id].y = canvasData_after.anchor[id].y + offset_y;
    if (updateOriginAnchor) {
      canvasData_after.originAnchor[id].x = canvasData_after.originAnchor[id].x + offset_x;
      canvasData_after.originAnchor[id].y = canvasData_after.originAnchor[id].y + offset_y;
    }
  });

  return canvasData_after;
}

/**
  * 在anchor下方绘制坐标
  * @method drawCoord
  * @param {Object} ctx canvas绘图环境
  * @param {Number} x 绘制坐标的位置x
  * @param {Number} y 绘制坐标的位置y
  * @param {Number} coordX 要显示的x坐标
  * @param {Number} coordY 要显示的y坐标
  */
export const drawCoord = (ctx, x, y, coordX, coordY) => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = "14px SimSun, Songti SC";
  ctx.fillText(`(${coordX.toFixed(2)}, ${coordY.toFixed(2)})`, x, y + 20);
}

/**
  * 在anchor上方绘制ID
  * @method drawID
  * @param {Object} ctx canvas绘图环境
  * @param {Number} x 绘制id的位置x
  * @param {Number} y 绘制id的位置y
  * @param {String} id 要显示的id
  */
export const drawID = (ctx, x, y, id) => {
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font="14px SimSun, Songti SC";
  ctx.fillText(`${id}`, x, y - 20);
}

/**
  * 绘制两点间连线
  * @method drawLine
  * @param {Object} ctx canvas绘图环境
  * @param {Number} from_x 起始x坐标
  * @param {Number} from_y 起始y坐标
  * @param {Number} to_x 终止x坐标
  * @param {Number} to_y 终止y坐标
  * @param {String} from_color 起始线条颜色，默认黑色
  * @param {String} to_color 终止线条颜色，默认黑色
  */
export const drawLine = (ctx, from_x, from_y, to_x, to_y, from_color = "rgb(0,0,0)", to_color = "rgba(0,0,0,1)") => {
  ctx.beginPath();
  // 设置线宽
  ctx.lineWidth = 2;
  // 设置间距（参数为无限数组，虚线的样式会随数组循环）
  ctx.setLineDash([4, 4]);
  // 移动画笔至坐标 x20 y20 的位置
  ctx.moveTo(from_x, from_y);
  // 绘制到坐标 x20 y100 的位置
  ctx.lineTo(to_x, to_y);
  // 填充颜色
  // ctx.strokeStyle="red";
  var gradient = ctx.createLinearGradient(from_x, from_y, to_x, to_y);
  gradient.addColorStop(0, from_color);
  gradient.addColorStop(1, to_color);
  // gradient.addColorStop(0, "rgba(216,30,6,1)");
  // gradient.addColorStop(1, "rgba(191,191,191,1)");
  // 填充颜色
  ctx.strokeStyle = gradient;
  // 开始填充
  ctx.stroke();
  ctx.closePath();
}