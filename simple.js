// 通过 object.defineProperty 实现对数据的监听
// 将 input 的内容与变量绑定
let a = {
  _val: "",
};

let input = document.getElementById("a");
let span = document.getElementById("b");

// 当 val 发生变化时，触发 DOM 元素的变化
Object.defineProperty(a, "val", {
  set: function (newVal) {
    if (this._val == newVal) return;
    this._val = newVal;
    input.value = newVal;
    span.innerHTML = newVal;
  },
  get: function () {
    return this._val;
  }
})

// 当 DOM 元素发生变化时，触发数据对象的变化
input.addEventListener("keyup", (e) => {
  let newVal = e.target.value;
  a.val = newVal;
});
