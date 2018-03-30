/*
订阅发布模式
发布者 pub：发出通知
主题对象 dep：收到通知并推送给订阅者
订阅者 sub: 接受通知并执行相应操作
*/

var pub = {
  publish: (dep) => {
    // 主题对象通知所有订阅者 --> l27
    dep.notify(); 
  }
}

var sub1 = { update: () => {console.log(1);} }
var sub2 = { update: () => {console.log(2);} }
var sub3 = { update: () => {console.log(3);} }

function Dep () {
  this.subs = [];
}
Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
}
Dep.prototype.notify = function () {
  this.subs.forEach((sub) => {
    // 所有订阅者执行相应操作
    sub.update();
  });
}

var dep = new Dep();
// 订阅者订阅到该主题对象
dep.addSub(sub1);
dep.addSub(sub2);

// 发布通知到主题对象 dep --> l10
pub.publish(dep); 
console.log('\n');

dep.addSub(sub3);
pub.publish(dep);
