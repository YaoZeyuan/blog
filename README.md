# hexo 博客示例

依次执行

```bash
npm i -g hexo
npm i && cd ./themes/next && npm i && cd ../..
hexo server
```

就能在本地进行调试.

push 到 master 后自动部署

博客地址 => [https://www.yaozeyuan.online](https://www.yaozeyuan.online)

commit 信息规范 =>

| 关键字 | 功能          |
| ------ | ------------- |
| feat   | 添加新功能    |
| format | 调整代码格式  |
| fix    | 修复错误      |
| doc    | 修订文档/注释 |

# 发布

```bash
hexo deploy -g
```
