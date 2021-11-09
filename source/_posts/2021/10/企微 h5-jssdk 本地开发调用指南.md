---
title: 企微 h5-jssdk 本地开发调用指南
date: 2021-10-20 08:00:00
tags:
mermaid: false
---

企微在 h5 环境下调用 js-sdk, 需要解决以下五个问题

1. 在已验证的域名下调用, 域名下要有指定文件
2. 域名不能带端口号(想在本地开发时测试 api, dev-server 必须启动在 80 端口下)
3. 初始化 api 时, 企微 sdk 会发送请求验证是否有 api 调用权限(重要)
4. 初始化 api 时, 配置参数要带校验签名, 该签名由 signature + 当前域名计算得出
   - 由于该项由后端返回, 在构建本地开发环境过程中不重要, 略过.
5. 企微 web 界面不可调试, 没有开发者工具可用, 无法查看日志

由于要验证域名权限, 所以需要域名在公网可访问, 且域名下要有指定文件. 相当于要求必须在线上环境下才能进行开发企微应用. 但由于 node_modules 体积一般都很大, 线上部署一次要 10 分钟, 一小时理论上最多才能调试&验证 6 次, 这显然是不可接受的. 所以开发企业微信 h5 应用, 必须要解决本地调试问题

# 方案一

购买一台线上服务器, 将域名指向该服务. 本地使用 VsCode 的 ssh 登录功能远程在线上服务器上进行编辑/开发, 问题得解

目前 vps 价格大约 1500/年, 情况紧急也能接受. 但...有没有更便宜的方案?

# 方案二

1. 使用公司域名验证域名权限(假设待验证域名为 `dev-wework-h5.ke.com`)
   1. 将验证文件添加到 node 服务静态资源下, 配置路由规则使文件可访问, 完成权限校验
      1. 例如在 node 服务进程中添加一个`/auth_check.txt` 接口, 接口返回内容是验证文件的值
      2. 或者直接把静态文件添加到静态文件夹中, 然后通过 rewrite 规则把`/auth_check.txt` 请求转到`/public/auth_check.txt` 资源下
      3. 总之让企微服务器在访问 `dev-wework-h5.ke.com/auth_check.txt` 的时候, 能够拿到 `auth_check.txt` 文件的内容即可
2. 在本地配置 hosts, 将 `dev-wework-h5.ke.com` 映射到 `127.0.0.1`, 本地将 dev-server 的启动端口设置为 80
   1. mac/linux 上启动 80 端口需要 sudo
   2. windows 上需要在 powershell/cmd 中启动, wsl2 环境下无法启动 80 端口, wsl1 未测试
   3. 启动前记得把可能会占用到 80 端口的进程先关掉(例如 docker-desktop/xampp 啥的)
3. 手机挂代理(例如 charles), 通过电脑上网.
   1. 这样当手机端请求 `dev-wework-h5.ke.com` 时, http 请求会被转发到电脑端, 并由电脑端代为发出
   2. 发出的请求经过 hosts 文件映射, `dev-wework-h5.ke.com` 会被认为是 `127.0.0.1`, 也就是本机地址, 从而连接上本机的 dev-server
   3. 企微会去查询自己的服务器 `dev-wework-h5.ke.com` 是否可用-->由于公网上 `dev-wework-h5.ke.com` 下有权限校验文件, 所以服务器自然认为该域名可以使用
4. 本地开发流程, 通?

并不通...主要是有这么几个问题

1. 从实践看, charles 不能转发企微校验 jssdk 权限时发出的 https 请求, 因此企微会认为当前域名没有调用 jssdk 的权限
2. 对于公司域名而言, 存在 https 提升问题, 问题背景如下
   1. 部分公司/node 服务脚手架中启用了 HSTS 策略, 即, 当浏览器使用 http 协议访问该域名时, 自动提升为 https 请求
   2. 该记录类似 cookie, 会储存在浏览器中. 因此, 当在企微 App 中触发 HSTS 策略后, 除了等待策略过期或清空企微数据, 否则所有对该域名的 http 访问都会被提升为 https
   3. 但本地开发时只有 80 端口, 并没有提供 https 服务
   4. 所以会导致页面白屏, 又企微开发时由于看不到当前页面 url, 会认为页面莫名其妙的白屏, 而且无法修复
   5. 进一步的, 如果这个域名是企微验证过有 js-sdk 调用权限的域名, 出于保障应用可用性的诉求, 企微对页面内容进行了缓存, 当服务无响应时, 企微会使用已缓存的域名
   6. 表现为在企微中打开 `http://dev-wework-h5.ke.com`, 会先被转为 `https://dev-wework-h5.ke.com`, 然后企微发现无法响应, 即显示之前已经缓存的内容, 也就是说, 无论本地怎么改, 在企微中看起来页面始终停留在 HSTS 提升前的那个状态, **本地修改无效, 而且在其他应用中页面还是好的**
   7. 然后开发者会怀疑人生, 薅头发, 傻笑, 直至崩溃

也就是说, 为了避免 HSTS 问题, 要尽量避免使用公司域名, 为了解决企微权限校验问题, 要避免使用代理转发(或者用可以转发 https 的代理进行转发, 但这个又涉及中间人攻击的可实现性, 我认为企微大概率做了中间人攻击的校验, 因此没有测试这种方案)

所以, 有改进方法吗?

# 方案三

1. 购买一个域名, 一年 30~50 元左右(我用的是个人博客域名)
2. 利用阿里云的[函数计算(serverless)](https://fcnext.console.aliyun.com/) 服务, 实现权限验证
   1. 例如, 首先配置一个函数 hello_world, 返回值为验证文件内容
   2. 将购买的域名和该函数相绑定, 并指定路由, 在阿里云上可以直接操作
      1. 例如, 将 `dev-wework-h5.yaozeyuan.online` 配置到这个函数服务上, 配置 `dev-wework-h5.yaozeyuan.online/auth_check.txt` 路由对应函数 hello_world
   3. 在企微后台中添加 `dev-wework-h5.yaozeyuan.online` 域名, 完成权限验证
      1. 企微只在添加应用可信域名时才验证权限, 所以可以通过临时配置域名+serverless 的方式 hack 掉企微的验证流程
      2. 阿里云函数计算每月前 100 万次调用免费, 足够测试
3. 完成权限验证后, 修改 DNS 配置, 将域名 ip 配置为电脑在办公网 wifi 下的 ip
4. 本地将 dev-server 的启动端口设为 80, 启动 dev-server
5. 手机连接办公网 wifi, 或确保手机和电脑在同一 wifi 环境下(没有同一 wifi 就借台手机开热点, 效果一样)
6. 手机直接访问 `dev-wework-h5.yaozeyuan.online`, 不用挂代理. 此时手机通过 DNS 查询到该域名对应的 ip 是电脑的 ip, 因此相当于直接访问电脑端的 80 服务.
7. 问题解决

扩展问题:

1. `dev-wework-h5.yaozeyuan.online` 和 `dev-wework-h5.ke.com` 域名不一致, 因此无法读取登录 cookie, 进而导致所有转发出去的 api 请求都没有 cookie, 如何处理
   1. 答:
   2. 本地 node 服务增加一个接口, 访问接口后自动种上 cookie 即可(该 cookie 是用户正常登录后得到的 cookie)
2. 企微中没有开发者工具, 所有日志只能通过 alert 查看, 非常痛苦
   1. 使用 VConsole , 它会在页面上由 js 画出一个 console 界面, 用于查看 console.log 和网络请求信息
   2. 使用文档: https://github.com/Tencent/vConsole/blob/HEAD/README_CN.md
3. 线上怎么用 vconsole?
   1. 在 node 服务层添加检测, 如果发现是请求 url 中有特殊标记, 就就在 ejs 模板里加一行 vconsole 的 cdn 地址, 从而实现自定义 debug 开关效果
   2. 示例
      1. `const Const_Debug_Flag = 'Debug_Flag_ff8036a42dd51644b8cd97ed3d19957d'`
      2. 当判断 url 中有`Const_Debug_Flag`时, 注入以下文本即可
      3. `<script src="https://unpkg.com/vconsole/dist/vconsole.min.js"></script><script>var vConsole = new window.VConsole();</script>`
