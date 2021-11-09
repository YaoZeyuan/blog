# hexo 博客示例

依次执行

```bash
npm i -g hexo
npm i && cd ./themes/next && npm i && cd ../..
hexo server
```

就能在本地进行调试.

`baidu_analytics`和`gitcommit`的配置项在`source/_data/next.yml`中, 安全起见 ignore 掉了

配置文件 demo =>

```yaml
baidu_analytics: 12313123123

gitalk:
  enable: true
  githubID: YaoZeyuan # 例：Introspelliam
  repo: YaoZeyuan.github.io # 例：Introspelliam.github.io
  ClientID: xxxxxxxxxxxxxxxxxxxxxx
  ClientSecret: xxxxxxxxxxxxxxxxxxxxxx
  adminUser: YaoZeyuan #指定可初始化评论账户
  distractionFreeMode: true
```

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
