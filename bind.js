/*
1. 将绑定的 HTML node “劫持到” documentFragment 容器中
2. 解析 node，实现数据初始化绑定
3. 实现响应式的数据绑定：当 input value 发生改变时将其值发送给data中绑定值
4. 订阅发布模式：
    三个角色：发布者、主题对象、订阅者
    发布者发出通知；主题对象受到通知并推送给多个订阅者；订阅者接收通知并执行相应操作
    对应到双向绑定实现：set 方法触发后发布者发出通知，dom 节点作为订阅者
    为每一个 data 属性添加一个 dep 对象，该 dep 对象与相应的 dom 节点订阅者“绑定”，当 data 属性
    发生变化的时候 publish
5. 双向绑定实现：
    操作1：监听数据，为 data 中每一个属性生成一个主题对象 dep
    操作2：编译 HTML，为每一个与数据绑定相关的节点生成一个订阅者 watcher。watcher 将自己
        添加到相应属性的 dep 中。
*/

// 主题对象 define
function Dep () {
  this.subs = [];
}
Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
}
Dep.prototype.notify = function (newVal) {
  this.subs.forEach((sub) => {
    // 所有订阅者执行相应操作，传递新值
    sub.update();
  });
}

// 订阅对象 sub
function Sub (vm, node, name) {
  // 使用一个全局变量 Dep,实现 sub 到 dep 的注册
  // 令全局变量 Dep 等于 this
  Dep.target = this;
  this.node = node;
  this.vm = vm;
  this.name = name;
  this.update();
  Dep.target = null;
}
Sub.prototype.get = function () {
  // 触发 vm[this.name] 的 get 方法
  this.value = this.vm[this.name];
}
Sub.prototype.update = function () {
  this.get();
  if (this.node.nodeType === 1) this.node.value = this.value;
  else this.node.nodeValue = this.value;
}


// 对于每一个节点，寻找其 v-model 属性或双括号语法，将其与 vm 的 data 联系起来
function parseNode(node, vm) { // vm 表示 “vue” 实例
  if (node.nodeType === 1) { // 为元素节点
    // 遍历 attr
    var attrs = node.attributes;
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i].nodeName == 'v-model') {
        let bindedData = attrs[i].nodeValue;
        node.value = vm[bindedData];
        
        new Sub(vm, node, bindedData);
        node.addEventListener('input', (e) => {
          vm[bindedData] = e.target.value; // input -> data
        })
        node.removeAttribute('v-model');
      }
    }
  }

  var reg = /\{\{(.*)\}\}/g;
  if (node.nodeType === 3) { // 为文本节点
    if (reg.test(node.nodeValue)) {
      let bindedData = RegExp.$1;
      bindedData = bindedData.trim();
      node.nodeValue = vm[bindedData]; // 只适用于 nodevalue 仅包含双括号的情况

      new Sub(vm, node, bindedData);
    }
  }
}

// 编译 dom 节点，对 dom 节点的所有后代节点应用 parseNode 函数
function compile(dom, vm) {
  var children = dom.childNodes;
  for (let i = 0; i < children.length; i++) {
    parseNode(children[i], vm);
    compile(children[i], vm);
  }
}

// “劫持” html node
function getDocumentFragment(node, vm) {
  var fragDom = document.createDocumentFragment();
  while (child = node.firstChild) {
    fragDom.append(child);
  }
  compile(fragDom, vm);
  return fragDom;
}

// 对 vm.data 的每个属性进行观测，vm.data.attr -> vm.attr
// shallow here
function observe(data, vm) {
  Object.keys(data).forEach((key) => {
    // 对每一个属性，创建主题对象
    let dep = new Dep();
    
    Object.defineProperty(vm, key, {
      set: (newVal) => {
        if (newVal === data[key]) return;
        data[key] = newVal;
        // 发布更新消息
        dep.notify();
      },
      get: () => {
        // 判定此时 Dep.target，若不为 null，说明在新建一个 sub 对象，且该对象想要订阅本属性
        if (Dep.target) dep.addSub(Dep.target);
        return data[key];
      }
    });
  });
}

Vue = function(options) {
  this.data = options.data;
  observe(this.data, this);
  
  var id = options.el;
  var dom = getDocumentFragment(document.getElementById(id), this);
  document.getElementById(id).append(dom);
}

var vm = new Vue({
  el: "ex",
  data: {
    a: "initial",
    b: "b"
  }
})