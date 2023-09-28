# 欢迎来到 647 号宇宙的源码世界

项目启动

```bash
pnpm i -g hexo
pnpm install && cd ./themes/next && pnpm install && cd ../..
hexo server
```

就能在本地进行调试.

已添加 github action, push 到 master 后自动部署

博客地址 => [https://www.yaozeyuan.online](https://www.yaozeyuan.online)

commit 信息规范 =>

| 关键字 | 功能          |
| ------ | ------------- |
| feat   | 添加新功能    |
| format | 调整代码格式  |
| fix    | 修复错误      |
| doc    | 修订文档/注释 |

图床: 统一使用新浪微博图床. 利用cloudflare worker 在url前添加 https://mirror-4-web.bookflaneur.cn/ 的方式实现反代

示例: 
| 原地址                                                             | 替换后地址                                                                                             |
| :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| https://tva1.sinaimg.cn/large/007Yq4pTly1heliju5wupj31ap0ay45n.jpg | https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/007Yq4pTly1heliju5wupj31ap0ay45n.jpg |