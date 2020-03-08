//函数防抖
export default function debounce(func, wait = 500) {
    let timeout;  // 定时器变量
    return function (event) {
        clearTimeout(timeout);  // 每次触发时先清除上一次的定时器,然后重新计时
        event.persist && event.persist()   //保留对事件的引用
        timeout = setTimeout(() => {
            func(event)
        }, wait);  // 指定 xx ms 后触发真正想进行的操作 handler
    };
}