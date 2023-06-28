---
title: 一次特别的企微网页 bug 调试记录
date: 2022-03-28 13:00:00
tags: 神奇bug
---

工作中遇到了一个比较奇特的 bug, 花了三整天才处理完, 挺有意思, 记录下处理过程.

# 故障表现

手机端打开 `https://wx-work.ke.com`, 由于是未登录状态, 因此自动跳转到`https://wx-auth.ke.com`上进行登录. 但回退到`https://wx-work.ke.com`后仍提示未登录, 自动跳转`https://wx-auth.ke.com`...陷入循环, 100%复现.

如果打开其他域名的话(`https://wx-other.ke.com`), 可以正常跳转`https://wx-auth.ke.com`后转回原网站获取登录态. 登陆成功后再打开`https://wx-work.ke.com`, 可以正常获取登录态(登录 cookie 种在了`.ke.com`主域上, 因此各子域间可以共享登录态)

本地开发中没有问题, 只在线上存在

# 原因探索

看起来只是简单的无法获取 cookie 问题, 但想想又不对. 既然`wx-other`可以种上 cookie, 那`wx-work`没道理拿不到. 而且既然用`wx-other`登录后就能正常访问`wx-work`, 说明`wx-work`可以正常读取种入的 cookie. 考虑到 cookie 本身是由相同的第三方站点`wx-auth`种入, 那`wx-work`读不到 cookie 就更奇怪了.

而且, 这个 bug 调试前还要解决三个问题:

1.  如何观察问题.
    1.  页面是手机页面, 需要跳转到企微内置的 oauth 链接进行登录, 不能直接在电脑上调试. 虽然加上 vConsole 之后可以查看打印的日志, 也可以通过录屏&重新播放录像并暂停的方法查看快速闪过的日志, 但由于页面刷新速度实在太快, 调试起来仍然很困难
2.  如何复现问题.
    1.  手机端种入 cookie 之后, 页面会回归正常----但也带来一点是登录信息无法清除. 比较靠谱的办法是等待 cookie 自然过期, 但这也未尝太慢了一些----而且, 万一登录信息被写在 localstorage 里不过期怎么办
3.  如何调试问题.
    1.  页面反复跳转问题只在线上出现, 本地启动开发环境并不会出现该问题.
    2.  但在线上调试, 需要反复部署代码. 每次线上更新都需要 5 分钟时间编译/发布.

> bug 调试三要素
>
> 1.  稳定复现 => 确认复现条件, 不能复现的 bug 不是 bug
> 2.  易于观察 => 日志充分, 方便定位
> 3.  调试方便 => 修改->响应时间越短越好. 调试总耗时 = 修改次数 \* 修改后部署时间

# 调试环境搭建

## 本地模拟线上环境

由于问题只在线上出现, 所以调试的第一步是在本地模拟线上环境. 方案如下:

0.  构建本地域名, 准确来说, 是在 host 中, 添加`127.0.0.1 wx-other.ke.com`, 将正常的业务域名映射到本地, 方便调试
1.  执行`bash script/online.sh`, 构建线上实际代码, 得到`dist`目录, 其内为线上服务代码
2.  进入`dist`目录, 将 cdn 域名换成本地静态文件路径前缀, 新 cdn 域名为`http://wx-other.ke.com/public/client/static`, 这样拼上`/js/runtime-main.e039c3b3.js`就是实际 js 地址(构建后的 js 文件位于 static 目录下)
3.  为加快构建速度, 使用 vite 进行构建, 添加构建配置(移除文件名中的 hash 以保持稳定)并自动将构建文件移动到`static`目录中, 命令 demo => `npm run vite-debug-build && rm -rf ../dist/server/static/dist && cp -R ./vite-build-result ../dist/server/static/dist`, 这样本地修改完毕后, 执行一下命令就可以更新最新的静态资源文件. 当然, 也可以在本地用 webpack 起静态资源文件服务, 速度更快
4.  由于企微只允许 80/443 端口的域名调用 js-sdk, 因此需要将线上环境启动的端口号改为 80. 应用启动 1024 以下端口需要 sudo 权限, 因此启动命令为 `ENV=prod sudo node dist/server/index.js`

自此, 本地的线上环境模拟完毕. 手机挂代理后访问`wx-other.ke.com`的效果和线上环境一模一样----只是静态资源被替换了而已.

## 将调试工具由手机改为电脑

企微手机端 debug 非常困难, 只能挂`Charles`代理查看发出的请求&用 alert 查看进度. 如果能用电脑调试会好很多. 很幸运, 企微提供了[电脑端网页调试工具](https://developer.work.weixin.qq.com/document/path/95466), 按指定配置操作, 即可打开开发调试工具(Windows 上是 chrome devtool, mac 上是 safari 调试工具). 一般来说是打开 debug 开关后, 在工作台中任意找一张网页应用进入, 右键启动调试工具后在控制台里输入`location.href="wx-other.ke.com"`进入对应页面.

# 实际调试

首先根据代码&日志整理 bug 出现的过程:

![根据devtools日志, 复现bug流程](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/007Yq4pTly1h0li2rdocnj31hc0qo1kx.jpg)

根据 Network 记录, 可以推断代码运行流程为:

1.  首次进入`wx-other`页, 发现没有 cookie 后转入企微 oauth 页启动登录流程
    1.  如果带有 cookie, 则会直接发出请求. 若后端正常响应则流程结束. 但如果 cookie 失效, 后端返回统一错误码 100001, http 中间件检测到该响应值后, 也会转入企微`oauth`页, 开始登录流程
2.  进入企微`oauth`页, 企微 oauth 生成身份验证 code, 转入`wx-auth`页,
3.  `wx-auth`页验证 code 无误后, 在主域名上种入 cookie, 然后通过 302 跳转到`back`页
4.  `back`页加载 js 文件, 通过`history.back()`返回上一页(即`wx-other`页)
5.  退回`wx-other`页后, 此时主域名中已有 cookie, 登录流程完成
6.  `wx-other`页重新执行 js 后, 会带 cookie 重新发起请求. 此时期望收到后端的正常响应----然而并没有

异常表现有这么几个点:

1.  服务端收到的请求和实际发出的数量不一致. 从服务器日志中可以看到, 服务端并没有收到重新执行 js 后发出的请求.

![服务器收到的请求数和实际发出的数量不一致](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/007Yq4pTly1h0lia1gomqj30u50h8n1n.jpg)

2.  神奇的是看 Network 监控确实也发出了请求, 只是响应值仍然是未登录状态下的响应值.

# 发现问题

**等等, 服务端明明没收到请求, Network 监控里接口的响应值是哪儿来的?**

![disk-cache](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/007Yq4pTly1h0pnoqmsl9j313b0eeqe4.jpg)

**这个 Disk-Cache 是怎么回事?**

![disk-cache高清大图](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/007Yq4pTly1h0pnpm403yj30s60em450.jpg)

答案很显然, 在企微环境下, 浏览器缓存住了接口响应值, 更过分的是, 企微甚至缓存了网页响应值----当调用`history.back()`的时候, 企微甚至没去请求页面内容.

> 如果进一步查阅的话, 会发现 w3c 协议中只规定了 `history.back()` 只需要回到前一页, 而回退时是否需要刷新页面则由浏览器自行实现. 从这点上说, 企微内置浏览器的回退不刷新虽然和直觉相违, 但并不违背 w3c 规范.
> https://html.spec.whatwg.org/multipage/history.html#dom-history-back-dev
>
> 如果需要强制重刷页面的话, 需要使用 `location.reload(true)`
>
> https://developer.mozilla.org/zh-CN/docs/Web/API/Location/reload

确认问题后修复就很简单了. 虽然企微内置浏览器自动缓存接口响应值的行为很诡异, 但也不是不可以绕过. 在请求 header 里添加显式声明`Cache-Control`策略或添加随机 header 头, 甚至在请求中添加随机 get 参数都可以.

**准确定义问题，比解决问题更重要**
