// 只在首页隐藏滚动条
function initFunc() {
  // 展示scroll-bar的类名
  var Const_Class_Name = "hidden-scroll-bar";
  var el = document.querySelector("body");
  if (location.pathname === "/") {
    el.classList.add(Const_Class_Name);
  }

  // 原始的html中没有目录id信息, 需要待页面加载完成后, 刷新一下toc目录
  setTimeout(() => {
    if (window.tocbot && tocbot.refresh) {
      tocbot.refresh();
    }
  }, 1000);
}
initFunc();
