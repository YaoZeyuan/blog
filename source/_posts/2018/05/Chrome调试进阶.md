---
title: Chrome调试进阶
date: 2018-05-18 17:48:01
tags:
---

# 目录

- [调试 JavaScript](#调试JavaScript)
  - [Preserve Log](#Preserve-Log)
  - [代码断点与单步执行](#代码断点与单步执行)
  - [debugger](#debugger)
  - [Event Listener Breakpoin & 屏蔽无用 log](#Event-Listener-Breakpoin-amp-屏蔽无用log)
  - [提取断点内变量值](#提取断点内变量值)
  - [调试 Immutable.js](#调试Immutable.js)
  - [彩色 log](#彩色log)
  - [输出 log 时添加时间戳](#输出log时添加时间戳)
  - [JS 执行计时](#JS执行计时)
  - [clear & filter](#clear-amp-filter)
- [调试元素](#调试元素)
  - [设备模拟](#设备模拟)
  - [远程调试](#远程调试)
  - [远程调试微信页面](#远程调试微信页面)
  - [模拟元素状态](#模拟元素状态)
- [性能分析](#性能分析)
  - [disable cache](#disable-cache)
  - [模拟弱网条件 & 录制屏幕](#模拟弱网条件-amp-录制屏幕)
  - [调试动画](#调试动画)
- [神奇功能](#神奇功能)
  - [密码找回](#密码找回)
  - [source map 抓源码](#source-map抓源码)
  - [Copy as Curl](#Copy-as-Curl)
- [扩展资料](#扩展资料)

# 调试 JavaScript

## Preserve Log

<!-- demo => 知乎的登录页 -->
<!-- demo => 0.0.0.0:6003 -->

调试页面的时候经常会遇到页面跳转, 跳转完之后 Console & Network 面板里记录全部清空, 这在页面上存在 302 跳转时会很恶心.

不过 Chrome 提供 Preserve Log 选项, 勾上这个, 只要不关页面, 记录就可以永久保存

![Preserve Log](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlvsaa7f5j30ns07sgm6.jpg)

## 代码断点与单步执行

![JavaScript代码调试_断点_说明](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjgwnaum2j31ft0hmjzr.jpg)

## debugger

除了手工加断点, 在源代码中加入`debugger`, 也可以起到断点的效果

注意: debugger 只能在本地测试的时候加, 线上要是有 debugger 的话用户的 js 就执行不了了

## Event Listener Breakpoin & 屏蔽无用 log

或者, 也可以按事件去加

![按事件加断点](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjjtoxrttj30qo09575l.jpg)

同样, 如果某些库绑了太多无用代码, 你可以选择屏蔽这整个库. 比如, 把这个库加到 黑盒 里, 黑盒里 js 的执行过程不会被显示出来, 略有用

![屏蔽无用log](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjjxdjqrgj30ql0aw75k.jpg)

demo =>

![加黑盒demo](https://wx4.sinaimg.cn/large/6671cfa8ly1frmed3jvhzg20go0ci7wk.gif)

## 提取断点内变量值

调试过程中有可能会需要将一些变量值保存下来, 这时候只要在想要保存的变量上点击右键, 选择`Store as global variable`, 就可以在`Console`面板里使用这个变量(temp1, temp2, temp3, ...)

![保存为全局变量](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjhxwhwlcj30dl08pjrj.jpg)

## 调试 Immutable.js

虽然将变量保存了下来, 但如果调试的是 Immutable.js, 打印出来的 Immutable 对象其实会很难看.

![原始immutable对象打印效果](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frji65o0ktj30iz06l0sz.jpg)

解决办法也简单, F12 打开开发者工具, 然后 F1 打开开发者工具的设置, 勾选`Preference->Console -> Enable Customer Formatters`

![开启Enable Customer Formatters](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frji9k26gqj31hc0gpdhp.jpg)

然后点击安装[Immutable.js Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog)插件

重启一下控制台, 再打印一下 Immutable 对象看看?

![新immutable对象打印效果](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frji9vkq22j30dt095gls.jpg)

## 彩色 log

Immutable 的原理是利用了 console.log API, console.log 实际上是支持在打印结果中添加 css 效果的

示例:

```javascript
console.log(
  "%c    ",
  "padding:10% 50%background:ur('https://stcms.beisen.com/CmsPortal/107965/107965_mdias_2018514_2018514logo.png') no-repeatbackground-position:center center"
);
console.log(
  "确认过眼神，你就是对的人\n来到链家，你可以尽发挥自己的特长\n来到链家，你可以不断提高自己的技术\n加入家，加入贝壳，成就房产行业新的巅峰"
);
console.log(
  "请将简历发送至 %c guliming@lianjia.com（邮件标题请以“姓名-应聘XX职位-来自console”命名）",
  "color:red"
);
console.log(
  "%c前端，PHP，QA等等各个岗位各个级别都有在哦，期待你的加入！",
  "color:red"
);
console.log("职位介绍：https://join.lianjia.com/");
```

效果 =>

![彩色log效果](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjy6sr74xj327y0yuwpb.jpg)

参考 => [Chrome 开发者文档文档](https://developers.google.com/web/tools/chrome-devtools/console/console-write?hl=zh-cn#_8)

| 说明符 | 输出                                                          |
| ------ | ------------------------------------------------------------- |
| %s     | 将值格式化为字符串                                            |
| %i     | 或 %d 将值格式化为整型                                        |
| %f     | 将值格式化为浮点值                                            |
| %o     | 将值格式化为可扩展 DOM 元素。如同在 Elements 面板中显示的一样 |
| %O     | 将值格式化为可扩展 JavaScript 对象                            |
| %c     | 将 CSS 样式规则应用到第二个参数指定的输出字符串               |

## 输出 log 时添加时间戳

log 除了打印消息, 还有一个用途是拿来检测页面性能. 比如开发 React Native 时, 我们可以通过 Android Studio 输出的日志时间戳来判断 JS 的执行情况

![RN日志](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjj3ya1hcj30sp0brn1p.jpg)

其实这个功能 Chrome 也可以做到, 还是 F1 打开开发者工具设置, 勾选`Preference->Console -> Show Timestamps`

![打开log时间戳](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjj8l0h9bj31h70g875y.jpg)

再看看日志, 是不是以后优化页面加载性能, 查看 js 执行瓶颈的时候就方便多了

![带时间戳的log](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjj9ci0r8j31hc0a4q4d.jpg)

## JS 执行计时

说到 JS 执行计时, 其实不太需要看 log 日志, 看下边的动图就够了

![JS执行计时](https://wx4.sinaimg.cn/mw690/6671cfa8ly1frmed68n76g20go0ciqv6.gif)

## clear & filter

Console 面板里执行 clear() 清屏, 在 filter 中输入关键字可以按条件过滤日志, 选项里有一条 Preserve Log, 选中之后只要不关 DevTool, 即使页面刷新也不会清空日志, 勾选之后调试带 302 跳转的页面特别方便

![Console控制台说明](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frjjr3k2nqj31hc0gmmyi.jpg)

# 调试元素

## 设备模拟

在大多数情况下, 网页/后端都是通过 UA 来判断设备类型的, 所以我们只要将 UA & 分辨率改成和移动端一样, 再把点击鼠标事件从 click 改成 touch, 就可以直接在浏览器里调试移动端页面

![切换为移动端模式](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frltmrdkcyj30pc0l3q7j.jpg)

如果想要模拟 App 操作的话, 只要选择 Edit, 添加上 App 的 UA 就可以了(具体值用 Charles 抓)

![更换UA_1](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frmd6rnzvcj30mq0g4776.jpg)
![更换UA_2](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frltst5my3j30ro0mst94.jpg)

一般来说靠这两步就可以解决 99%的移动端调试问题, 但是谷歌显然还觉得不够, 如果你想了解进一步模拟 DPI 修改, 媒体查询检测等功能的话, 在[这里](https://developers.google.com/web/tools/chrome-devtools/device-mode/emulate-mobile-viewports?hl=zh-cn)可以看到谷歌官方的说明(当然是汉语)

## 远程调试

当然, 模拟归模拟, 谷歌表示有些移动端的功能实在模拟不了(iOS7 不支持 WebGL, iOS 5 的方向缩放有 bug, etc). 所以 Chrome 也提供了远程调试功能.可以让我们在电脑上**直接**调试 App 内的网页.

方法如下:

1.  App 启用 WebView 调试模式(一般的测试包都支持, 这里以 Chrome 为例)
2.  手机启用开发者模式, 打开 USB 调试开关
3.  电脑装驱动(Windows), 然后用 USB 线把手机连到电脑上
4.  在 Chrome 上打开 [chrome://inspect/](chrome://inspect/), 找到 App 内的页面, 点击 inspect, over

效果 =>

![Chrome调试手机WebView](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlukz6y9rj31a20o1doa.jpg)

然后就跟正常调试页面一样了, 想打断点打断点, 想看 log 看 log, 比用 Charles 把线上 js 替换成本地 js, 然后一个一个的写 alert 效率高多了

详细说明见[官方文档](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/?hl=zh-cn)

PS 一句, iOS 下也可以这么干, 除了要用 Safari 而不是 Chrome 调试外, 其他地方都一样

## 远程调试微信页面

和 Chrome 远程调试一样, 微信也支持远程调试功能, 只是需要手工开启一下

1.  微信内访问[https://debugx5.qq.com/](https://debugx5.qq.com/), 或者直接扫描二维码![二维码](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlv4pbutvj308c08ca9y.jpg)
2.  如果是首次使用需要先装线上 TBS 内核
    ![安装线上TBS内核](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlv77513rj30qo1hcju5.jpg)
3.  然后打开[https://debugx5.qq.com/](https://debugx5.qq.com/), 勾选 信息-TBS Setting- 打开 TBS 内核 inspect 调试功能
4.  剩下的和 Chrome 远程调试一样, 折腾完打开[chrome://inspect/](chrome://inspect/), 完毕
    ![微信调试效果图](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlva13rsbj317y0m60xw.jpg)

## 模拟元素状态

讲完远程调试, 就可以讲讲检查元素的具体办法. 有时候我们会为元素的 hover 设置一个样式, 但是调试的时候只有把鼠标移上去才能看见样式, 很麻烦.

Chrome 里可以直接模拟这种状态

![切换元素伪类状态](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlvkbaobej31hc0jejve.jpg)

:hov 中可以模拟各种伪类, .cls 中可以为元素动态添加/删除 class

# 性能分析

## disable cache

刷新页面的时候, 如果想访问到最新的资源(或者模拟初次打开页面), 除了使用隐身模式外, 还可以直接勾上`disable cache`这项, 效果一样

![disable cache](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlvxom51bj30nl04cmxg.jpg)

## 模拟弱网条件 & 录制屏幕

Chrome 还允许模拟 2G/3G 等弱网环境, 而且为了方便调试, 还提供了录屏功能, 可以录制页面的整个加载过程, 方便检查分析

![录屏和模拟弱网](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlw4tbiq7j30nh0as0uv.jpg)

## 调试动画

和 Network 一样, 动画也提供了录屏, 模拟移动端 CPU 效果(主动降速), 分析动画成分功能

![Chrome动画调试指南_1](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlwgx6zy9j31hc0i3djp.jpg)
![Chrome动画调试指南_2](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlwh8gcjzj30o20ofdk0.jpg)

# 神奇功能

## 密码找回

浏览器里我们看到的密码都是打过马赛克的, 解码的方式也很简单----只要把 input 的 type 类型从 password 随便改成其他值, 就可以看见我们输入的密码

![密码找回](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlwm3r2gtj30le0feaf5.jpg)

## 源代码下载

有些公司安全意识不强, 代码发布上线的时候还是 debug 版本(知乎), 甚至连 source map 都带上了. 如果是 debug 版本, 我们可以用 React/Vue 开发者工具查看他们的页面结构, 如果是 source map 都有的话, 加个[插件](https://chrome.google.com/webstore/detail/aioimldmpakibclgckpdfpfkadbflfkn), 可以直接还原出页面的源码 => [点我看原理](https://zhuanlan.zhihu.com/p/26033573)

![Chrome 查看源代码](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/6671cfa8ly1frnq0euhx9j227y16ytrl.jpg)

![源码下载](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlwtp2tpkj30x70rc43d.jpg)

## Copy as Curl

如果要在命令行中模拟 Http 操作的话, 可以直接在 NetWork 面板中点右键, 这在手工抓接口数据的时候比较有用

![Copy as Curl](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/00749HCsly1frlwxm1meoj30nz0bxac0.jpg)

# 扩展资料

- 我整理的[Chrome 常用插件 & 推荐理由](https://www.yaozeyuan.online/2018/01/08/2018/01/Chrome扩展推荐/)
- [谷歌开发者工具文档](https://developers.google.com/web/tools/chrome-devtools/?hl=zh-cn)
- [你不知道的 devtools](https://umaar.github.io/devtools-animated-2016/)
- [未来的 DevTools(里面提到的新功能, 目前仅在 Canary 中可用(2018))](https://umaar.com/dev-tips/)
