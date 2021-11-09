---
title: 小程序架构指南(五):源码详解小程序启动原理(下)
date: 2021-11-08 12:00:00
tags: 小程序架构指南
mermaid: true
---

<!-- # 05-源码详解\_小程序启动原理(下)-HostConfig 原理与 webview-render 的实现 -->

上篇文章中, 我们通过跟踪 React 源码, 找到了`React-Reconciler`接管组件更新的原理. 但对小程序而言, `React-Reconciler`接管组件更新还不够, 我们需要`React-Reconciler`能够将组件的更新动作转化为界面更新指令并通知出来, 这样才能在 webview 层构建出实际 Dom. 而这, 就是`HostConfig`和`Container`的工作.

# HostConfig 与 Container: Reconciler 与 Renderer 间的中间层

通过之前的文章我们知道, Fiber 架构下的 React 分为三层, 分别是对外的`React Component API`, 也就是我们平常写的 `JSX`, 和监控`JSX`变动, 根据对应虚拟 Dom 结构变更生成界面操作指令的`React-Reconciler`和将界面操作指令转化为对应平台实现的`Renderer`渲染器.

`React component API <----> Reconciler 调和器 ----> Renderer 渲染器`

`Reconciler` 通过接管 `useState`/`setState` 的实现获取 `JSX` 对象的变动情况, 并根据变动调用 JSX 对象的生命周期钩子和计算界面更新指令. 但具体实现时, `Reconciler`会面临这样一个问题: **我怎么知道当前的 Renderer 渲染器支持哪些指令?**

答案当然是在初始化`Reconciler`时, 就要告诉`Reconciler`当前渲染器支持的指令列表, 而这份列表, 就叫做`HostConfig`.

对于 HostConfig, `Reconciler`规定了两类 API, 分别是必须接口和可选接口.按 React 项目组的[说法](https://github.com/facebook/react/tree/main/packages/react-reconciler), 这些接口目前还不稳定所以并没有公开介绍. 但实际上, 这个功能已经可以满足日常使用了(要不怎么会有 Remax 项目&一众小程序项目). react 项目组给出了[HostConfig 的示例](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/forks/ReactFiberHostConfig.custom.js), 这里贴一下 remax 中 hostConfig 的部分内容

```ts
// 位于 https://github.dev/remaxjs/remax/blob/v2.15.0/packages/remax-runtime/src/hostConfig/index.ts
import * as scheduler from "scheduler";
import { REMAX_METHOD, TYPE_TEXT } from "../constants";
import { generate } from "../instanceId";
import VNode from "../VNode";
import Container from "../Container";
import { createCallbackProxy } from "../SyntheticEvent/createCallbackProxy";
import diffProperties from "./diffProperties";
// ...省略其余代码

export default {
  now,

  // ...省略其余代码

  // 创建dom节点
  createInstance(type: string, newProps: any, container: Container) {
    const id = generate();
    const node = new VNode({
      id,
      type: DOM_TAG_MAP[type] ?? type,
      props: {},
      container,
    });
    node.props = processProps(newProps, node, id);

    return node;
  },

  // 创建文本节点
  createTextInstance(text: string, container: Container) {
    const id = generate();
    const node = new VNode({
      id,
      type: TYPE_TEXT,
      props: null,
      container,
    });
    node.text = text;
    return node;
  },

  // ...省略其余代码

  // Reconciler更新周期执行完毕后, 会调用该接口, 通知渲染器可以进行实际渲染
  // 在小程序代码中用于作为向webview发送更新指令的标记
  resetAfterCommit: (container: Container) => {
    container.applyUpdate();
  },
};
```

`Reconciler`会根据虚拟 Dom 变动情况, 调用`HostConfig`中提供的接口, 这些调用方法和参数汇合到一起, 就是界面更新指令. 而对`HostConfig`接口的调用又会被转发给`Container`, 由`Container`对象维护`updateQueue`数组, 记录操作执行过程.

```ts
// 位于 https://github.dev/remaxjs/remax/blob/v2.15.0/packages/remax-runtime/src/Container.ts

export default class Container {
  // ...省略其余代码
  updateQueue: Array<SpliceUpdate | SetUpdate> = [];

  // ...省略其余代码
  requestUpdate(update: SpliceUpdate | SetUpdate) {
    this.updateQueue.push(update);
  }

  applyUpdate() {
    if (this.stopUpdate || this.updateQueue.length === 0) {
      return;
    }
    // ...省略其余代码
    this.context.$spliceData(
      {
        [this.normalizeUpdatePath([...update.path, "children"])]: [
          update.start,
          update.deleteCount,
          ...update.items,
        ],
      },
      callback
    );

    // ...省略其余代码
    this.updateQueue = [];

    return;
  }
}
```

当`Reconciler`的一个更新周期结束时, 会调用`HostConfig`上的`resetAfterCommit`函数, 然后被转发给`Container`的`applyUpdate`方法. `Container`收到消息后, 将之前记录下来的界面更新指令 JSON 化为字符串, 通过 Native 转发给 运行在 webview 上的 `webview-render` 对象, webview-render 收到更新指令后, 根据指令操作实际 Dom, 界面构建完成.

# webview-render: 更新指令的设计与用户交互的实现

界面的更新指令则由两种类型实现. `SpliceUpdate`对应于节点变动, 前端收到后直接删除旧 Dom, 创建新 Dom. 但这样会出现问题. 例如, 对于`<input value={$value} />`元素, 当 value 发生改变时, 如果直接删除重建 input 元素, 会导致输入光标丢失. 因此出现了`SetUpdate`指令, 对于该指令, 只更新 Dom 属性, 不重建 Dom.

```ts
// 界面更新指令类型定义
// 位于 https://github.dev/remaxjs/remax/blob/v2.15.0/packages/remax-runtime/src/Container.ts#L8

interface SpliceUpdate {
  path: string[];
  start: number;
  id: number;
  deleteCount: number;
  items: RawNode[];
  children?: RawNode[];
  type: "splice";
  node: VNode;
}

interface SetUpdate {
  path: string[];
  name: string;
  value: any;
  type: "set";
  node: VNode;
}
```

```ts
// 发送到webview-render端的VNode数据结构
// 位于 https://github.dev/remaxjs/remax/blob/v2.15.0/packages/remax-runtime/src/VNode.ts#L6

export interface RawNode {
  id: number;
  type: string;
  props?: any;
  nodes?: { [key: number]: RawNode };
  children?: Array<RawNode | number>;
  text?: string;
}
```

weview-render 收到指令后会根据 node 中的配置创建 Dom 元素, 并更新到 webview 中. 这个比较好实现, 直接`document.createElement`就行. 前端 render 的难点在于: **如何将用户操作时产生的 click/touch/change 事件回传给 js-core 中的 Reconciler**?

我们知道, jsx 中绑定的事件处理函数是不能在 json 化之后传递给 webview-render 的, 但是, **不能传递函数, 我们可以传递函数名啊**

在生成 Dom 构建命令时, 我们可以建立一个事件处理函数映射表, 函数名命名规范为`${事件名}_${递增计数器}_handler`. 在 webview 中则用 addEventListener 为对应 dom 节点绑定事件处理函数. 当事件发生时, 把 event 对象中的数据和需要调用的函数名通过 Native 传回 js-core 引擎, 然后在 js-core 中调用对应的实际函数, 触发组件状态变更, 组件重新渲染.

至此, 小程序运行流程形成闭环.

# 结尾的话

通过这五篇文章, 我们了解了小程序项目价值, 梳理了开发路线图, 解决了小程序开发过程中最为核心的数据传递和跨进程 Dom 交互问题. 但这并不意味着小程序任务的圆满结束. 事实上, 正如`02-小程序业务流程与开发路线图`分析的那样, 后续的小程序基础库/IDE/后台/组件库更是小程序项目中所面临的难点.

不过, 这一系列的文章已经写得太长, 有必要在这里简单收束一下. 至于小程序项目中面临的其他问题该怎么解决嘛

欲知后事如何, 请待下回分解~

# 参考资料

[Remax 实现原理](https://remaxjs.org/guide/implementation-notes/)
