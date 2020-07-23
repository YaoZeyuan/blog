#   hexo博客示例

依次执行
```bash
npm i -g hexo
npm i && cd ./themes/next && npm i && cd ../..
hexo server
```
就能在本地进行调试.

`baidu_analytics`和`gitcommit`的配置项在`source/_data/next.yml`中, 安全起见ignore掉了

配置文件demo =>
```yaml
baidu_analytics: 12313123123

gitment:
  enable: true
  mint: true # RECOMMEND, A mint on Gitment, to support count, language and proxy_gateway
  count: true # Show comments count in post meta area
  lazy: false # Comments lazy loading with a button
  cleanly: false # Hide 'Powered by ...' on footer, and more
  language: # Force language, or auto switch by theme
  github_user: YaoZeyuan # MUST HAVE, Your Github Username
  github_repo: YaoZeyuan.github.io # MUST HAVE, The name of the repo you use to store Gitment comments
  client_id: 1323213123123132 # MUST HAVE, Github client id for the Gitment
  client_secret: asdsadsadasdsad # EITHER this or proxy_gateway, Github access secret token for the Gitment
  proxy_gateway: # Address of api proxy, See: https://github.com/aimingoo/intersect
  redirect_protocol: # Protocol of redirect_uri with force_redirect_protocol when mint enabled
```



博客地址 => [http://www.yaozeyuan.online](http://www.yaozeyuan.online)

commit信息规范 => 

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