---
title: node 接口转发注意事项
date: 2021-10-30 08:00:00
tags:
mermaid: false
---

前端开发过程中经常遇到接口跨域问题, 很难处理. 因此有了本地起一个 koa, 通过转发接口绕过跨域限制的方案. 这个方案具体实现步骤如下

## 处理同一服务的不同接口

假设本地开发的请求需要转移到 a1.ke.com 项目上, 那么我们需要做这么几件事

1.  添加中间件, 捕获以指定字符串开始的请求, 以便后续转移

- 首先配置服务地址, 区分本地/dev/测试/预览/线上环境

```ts
// src/config/api-host/a1.ke.com.ts
import env from "../env";

let config: { [key in typeof env]: string } = {
  local: "http://dev-a1.ke.com/a1/api",
  dev: "http://dev-a1.ke.com/a1/api",
  test: "http://test-a1.ke.com/a1/api",
  pre: "http://pre-a1.ke.com/a1/api",
  prod: "http://a1.ke.com/a1/api",
};

// 环境下对应的host地址
export const Const_Host = config[env];
// 需要转发到a1.ke.com的前端请求特征前缀
export const Const_Prefix = "/api/a1" as const;
// 需要转发到a1.ke.com的前端请求特征正则匹配表达式
export const Const_Match_Reg = /^\/api\/a1\/.+/;
```

- 安装 koa-router, 注册中间件, 添加路由以捕获特定请求

在转发 http 请求, 配置 headers 头时需要注意, 不能直接透传客户端发送的 header 头, 要采取白名单模式, 只转发特定的 header 字段, 理由如下

1. 客户端请求的 host(dev-server 地址)和实际请求域名(api 服务)不一致, 则对方 Nginx 服务器无法根据 host 值做端口转发, http 报 403, https 报证书验证失败
2. 如果后续修改过请求内容, content-length 会和实际请求长度不一致, 则有可能被认为是非法请求被 api 服务端直接拒绝
3. 使用 axios 进行请求转发时, cookie 不能为 undefined, 只能为空字符串或不传, 否则 axios 转发时会报配置异常----如果 h5 环境中正好没有 cookie, 那么 ctx.request.headers?.["cookie"]就是 undefined, 不加兜底的""就会导致无法转发网络请求

具体代码如下

```ts
// src/service/api_redirect.ts
import * as A1_Ke_Com_ApiHost from "~/src/config/api-host/a1.ke.com";
import Router from "koa-router";
import Koa from "koa";
import axios from "axios";
// 用于解析cookie, 方便根据服务端要求配置请求的header头
import cookie from "cookie";

// 定义前缀类型列表, 方便后续编写匹配函数
type Type_Prefix = typeof A1_Ke_Com_ApiHost.Const_Prefix;

// 初始化接口转发实例
let http = axios.create();

// 根据前端请求的页面前缀, 判断实际需要转发的host值
function getApiHost(prefix: Type_Prefix) {
  switch (prefix) {
    case A1_Ke_Com_ApiHost.Const_Prefix:
      return A1_Ke_Com_ApiHost.Const_Host;
    default:
      return A1_Ke_Com_ApiHost.Const_Host;
  }
}

// 包裹一层, 以根据prefix返回对应接口转发函数
let getAsyncRedirectResponse = (prefix: Type_Prefix) => {
  return async (ctx: Koa.ParameterizedContext) => {
    let headers = {
      // 不能直接透传header头, 否则会有很多问题
      // 例如:
      // host和实际请求域名不一致, 则对方Nginx服务器无法根据host值做端口转发, http报403, https报证书验证失败
      // content-length 和实际请求长度不一致(后续修改过body), 则有可能被认为是非法请求直接拒绝
      // cookie不能为undefined, 只能为空字符串或不传, 否则axios转发时会报配置异常----如果h5环境中正好没有cookie, 那么ctx.request.headers?.["cookie"]就是undefined, 不加兜底的""就会导致无法转发网络请求
      cookie: ctx.request.headers?.["cookie"] || "",
      "user-agent": ctx.request.headers?.["user-agent"] || "",
      // 强制指定响应值为json格式
      accept: "application/json",
    };

    // 过滤cookie, 获取token
    let cookieStr = ctx.request.headers?.["cookie"] || "";
    let cookieObj: {
      token?: string;
    } = cookie.parse(cookieStr);

    // 拿到客户端cookie中的token值, 后续根据api业务方需求进行专门处理
    let token = cookieObj.token || "";

    // 根据api类别添加额外处理逻辑
    if (prefix === A1_Ke_Com_ApiHost.Const_Prefix) {
      // a1.ke.com需要在header中额外添加token字段, 以进行权限校验
      headers["a1.ke.com-token"] = token;
    }

    // 根据传入prefix配置, 解析客户端请求url, 拼接生成实际需要请求的api服务地址
    let rawRequestUrl = ctx.request.url;
    let requestUrl = rawRequestUrl.split(prefix)[1];
    let api_host = getApiHost(prefix);
    let targetUrl = `${api_host}/${requestUrl}`;

    // 实际发送请求
    let response;

    if (ctx.request.method === "GET") {
      // get请求
      response = await http.get(targetUrl, {
        headers: headers,
      });
    } else {
      // post请求
      // 未支持其他类型请求
      response = await http.post(
        targetUrl,
        {
          // @ts-ignore
          ...ctx.request?.body,
        },
        {
          headers: headers,
        }
      );
    }

    if (response?.status === 200) {
      // 返回数据
      ctx.body = response?.data || "";
      // 设置响应头
      ctx.set("Content-Type", response?.headers?.["content-type"]);
    } else {
      ctx.status = response?.status;
      ctx.body = {
        success: false,
      };
      ctx.set("Content-Type", "application/json");
    }
    return;
  };
};

// 总路由, 接管以api为前缀的网络请求
let totalRouter = new Router();

// a1服务系列接口
let a1_ke_com_ApiRouter = new Router();
a1_ke_com_ApiRouter.all(
  A1_Ke_Com_ApiHost.Const_Match_Reg,
  // 获取a1.ke.com服务对应的接口处理函数
  getAsyncRedirectResponse(A1_Ke_Com_ApiHost.Const_Prefix)
);

// 在总路由中注册a1路由
totalRouter.use(a1_ke_com_ApiRouter.routes());

// 实际注册中间件服务
export default (_) => {
  // 添加路由拦截操作
  return totalRouter.routes();
};
```

编写完中间件服务后, 在`src/index.ts`中启用该中间件即可

```ts
// src/index.ts

// 配置 ~/src 通用导入前缀, 方便编写后续文件
require("module-alias").addAlias("~/src", __dirname + "/");
import Koa from "koa";
import ApiRedirectService from "~/src/service/api_redirect";

const app = new Koa();

// 注册中间件服务
app.use(ApiRedirectService);

// 实际业务代码
app.use(async (ctx) => {
  ctx.body = "Hello World";
});

// 启动并监听端口
app.listen(3000);
```

- 这样, 本地开发时, js 只要请求`/api/a1/hello/world`, 经 dev-server 转发到刚才启动的 koa 服务上后, 即可被转发给`http://a1.ke.com/a1/api/hello/world`(注意 h5 发出的请求是/api/a1, 实际有效请求 url 是`/hello/world`, koa 将 config 中配置的 host 地址`http://a1.ke.com/a1/api`和有效 url 请求`/hello/world`拼接后, 生成最后的实际请求地址`http://a1.ke.com/a1/api/hello/world`)

## 处理多个服务的接口转发请求

在上述单服务端口转发请求示例中, 我们通过`src/config/api-host/a1.ke.com.ts`, `getApiHost`和`getAsyncRedirectResponse`已经留出了配置多个服务的扩展空间, 这里仅以添加对 b2.ke.com 的转发服务为例

- 添加 config 文件

```ts
// src/config/api-host/a1.ke.com.ts
import env from "../env";

let config: { [key in typeof env]: string } = {
  local: "http://dev-b2.ke.com/b2/api",
  dev: "http://dev-b2.ke.com/b2/api",
  test: "http://test-b2.ke.com/b2/api",
  pre: "http://pre-b2.ke.com/b2/api",
  prod: "http://b2.ke.com/b2/api",
};

// 环境下对应的host地址
export const Const_Host = config[env];
// 需要转发到b2.ke.com的前端请求特征前缀
export const Const_Prefix = "/api/b2" as const;
// 需要转发到b2.ke.com的前端请求特征正则匹配表达式
export const Const_Match_Reg = /^\/api\/b2\/.+/;
```

- 调整`getApiHost`和`getAsyncRedirectResponse`的内容, 添加 b2 转发的 case

```ts
// src/service/api_redirect.ts

/**
 * ...其他代码忽略
 */

import * as B2_Ke_Com_ApiHost from "~/src/config/api-host/b2.ke.com";

type Type_Prefix =
  | typeof A1_Ke_Com_ApiHost.Const_Prefix
  | typeof B2_Ke_Com_ApiHost.Const_Prefix;

// getApiHost 修改为
function getApiHost(prefix: Type_Prefix) {
  switch (prefix) {
    case A1_Ke_Com_ApiHost.Const_Prefix:
      return A1_Ke_Com_ApiHost.Const_Host;
    case B2_Ke_Com_ApiHost.Const_Prefix:
      return B2_Ke_Com_ApiHost.Const_Host;
    default:
      return A1_Ke_Com_ApiHost.Const_Host;
  }
}

// getAsyncRedirectResponse 修改为
// ------↓↓↓↓↓getAsyncRedirectResponse内容↓↓↓↓↓-------
// 根据api类别添加额外处理逻辑
if (prefix === A1_Ke_Com_ApiHost.Const_Prefix) {
  // a1.ke.com需要在header中额外添加token字段, 以进行权限校验
  headers["a1.ke.com-token"] = token;
}
if (prefix === B2_Ke_Com_ApiHost.Const_Prefix) {
  // b2.ke.com不需要进行额外操作
  // headers["a1.ke.com-token"] = token;
}
// ------↑↑↑↑↑getAsyncRedirectResponse内容↑↑↑↑↑-------

// 注册b2服务系列接口
// b2服务系列接口
let b2_ke_com_ApiRouter = new Router();
b2_ke_com_ApiRouter.all(
  B2_Ke_Com_ApiHost.Const_Match_Reg,
  // 获取b2.ke.com服务对应的接口处理函数
  getAsyncRedirectResponse(B2_Ke_Com_ApiHost.Const_Prefix)
);

// 在总路由中注册b2路由
totalRouter.use(b2_ke_com_ApiRouter.routes());

/**
 * ...其他代码忽略
 */
```

这样, 通过一个文件即可解决前端开发中对接口转发的需求.

示例项目可戳 => https://github.com/YaoZeyuan/demo-koa-api-proxy
