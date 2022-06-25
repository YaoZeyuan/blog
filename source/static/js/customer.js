// 只在首页隐藏滚动条
function initFunc() {
  // 展示scroll-bar的类名
  var Const_Class_Name = "hidden-scroll-bar";
  var el = document.querySelector("body");
  if (location.pathname === "/") {
    el.classList.add(Const_Class_Name);
  }
}
initFunc();
