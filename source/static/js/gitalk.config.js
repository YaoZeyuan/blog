// var gitalk = new Gitalk({
//   clientID: "cb51e467ab7545f311d9",
//   clientSecret: "8712d8263ec17f168dc461ec5ba948d71ea9fb06",
//   repo: "YaoZeyuan.github.io",
//   owner: "YaoZeyuan",
//   admin: [
//     "YaoZeyuan",
//   ],
//   id: location.pathname,
//   language: "zh-CN",
//   labels: ["Gitalk"],
//   perPage: 10,
//   pagerDirection: "last",
//   distractionFreeMode: false,
//   createIssueManually: true,
// });

// gitalk.render("gitalk-container");

var dateStr = location.pathname.split("/").slice(1, 4).join("/");
var pageId = `${dateStr}-${md5(location.pathname)}`;
// 将pageId注入到全局变量上
window.pageId = pageId;
