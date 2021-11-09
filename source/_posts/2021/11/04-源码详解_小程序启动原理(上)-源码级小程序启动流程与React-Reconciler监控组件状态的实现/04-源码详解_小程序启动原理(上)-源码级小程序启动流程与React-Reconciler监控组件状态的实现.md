---
title: 小程序架构指南(四):源码详解小程序启动原理(上)
date: 2021-11-08 11:00:00
tags: 小程序架构指南
mermaid: true
---

<!-- # 04-源码详解\_小程序启动原理(上)-源码级小程序启动流程与 React-Reconciler 监控组件状态的实现 -->

上回说到, 借助 React Fiber 架构提供的能力, 我们可以基于 React 完成小程序架构. 但由于篇幅所限, 我们只概要描述了下思路而略过了核心原理和实现方案. 在这篇文章中, 我们会以基于同样构建思路的[remax@2.15.0](https://github.com/remaxjs/remax/blob/v2.15.0/packages/remax-runtime/src/render.ts)为例, 分析类小程序项目中项目的具体启动过程.

通过之前的文章我们知道, 小程序的基本启动模型是:

1.  解析 app.json, 获取其中注册的`JSX`对象和对应的 path
2.  初始化实现了`HostConfig`协议所约定接口的对象, 作为负责实际渲染的容器`Container`
3.  获取待渲染的`JSX`对象
    1.  从 Native 中获取当前打开的 scheme, 解析出正在访问的路径&参数
    2.  和已注册路由进行比较
        1.  如果匹配到已注册 path, 则加载对应的`JSX`对象
        2.  否则加载默认页面对应的`JSX`对象
            1.  [可选]如果没找到匹配路径, 也可以直接报白屏错误, 看小程序引擎实现者的心情
4.  将`Container`对象, 和`JSX`对象 一起传入由`Reconciler`导出的`render`方法
5.  在传统浏览器环境中
    1.  `Reconciler`会将`JSX`渲染为虚拟 Dom
    2.  期间根据`JSX`变动, 不断产生更新指令, 将指令转换为`HostConfig`中约定的 Dom 操作, 并调用`Container`暴露的操作方法.
    3.  `Container`根据被调用的操作, 创建实际 Dom. 从而生成实际页面
6.  在实际小程序运行环境中
    1.  由于小程序环境中逻辑层和渲染层分开展示, 因此在逻辑层中运行的`Container`并不会创建实际 Dom.
    2.  所以在小程序应用中, 我们引入一个中间层, 用 js 对象模拟 Dom 操作, 并记录`Reconciler`传入的 Dom 操作指令.
    3.  在一个操作批次结束后, 将操作指令 json 化, 变成字符串格式的指令列表
    4.  通过`Native`转发给位于渲染层的`webview-render`对象
    5.  `webview-render`对象根据操作指令, 在 webview 中构建实际 Dom

也就是这个模型

`ReactElement对象 -> Render(React-Reconciler) -> Container(HostConfig) -> 转发命令 -> Webview-Render`

我们以`Remax@2.15.0`和`React@16.7.0`为例, 结合实际代码对启动流程进行一次跟踪

小程序启动示例代码如下所示

```ts
// 最简小程序模型.
// https://github.dev/remaxjs/remax/blob/v2.15.0/packages/remax-runtime/src/__tests__/index.test.tsx#L53
import Container from "@remax/remax-runtime/Container";
import render from "@remax/remax-runtime/render";

const MiniProgramPage = () => <View className="foo">hello</View>;
const container = new Container();
render(<MiniProgramPage />, container);
```

在这段代码中, 我们完成了以下工作:

0.  直接获取待渲染的 jsx 对象 MiniProgramPage
1.  在逻辑层内初始化 Dom 容器 `Container`, 用于在 js-core 中模拟 Dom 功能, 接收并缓存后续`ReactReconciler`传过来的 Dom 指令
2.  将 `jsx对象`和`Container`传给 render, 进入渲染逻辑.

值得一提的是, 整个小程序启动进程只有这三行代码, `render`函数执行完毕启动进程即宣告结束. 后续 render 中的 react-reconciler 会接管`jsx对象`的 setState 方法, 从而可以接管组件中的所有变动, 进而和旧 jsx 对象进行比较, 计算虚拟 Dom 变更情况, 生成实际 Dom 操作指令, 然后再根据 HostConfig 协议调用 Container 对象上暴露的方法...

HostConfig 协议和 Container 对象的实现我们放在下篇文章, 这篇文章我们只搞清楚两件事:

1.  render 函数的实现
2.  react-reconciler 接管 JSX 变更的实现

# render 函数的实现

先看下 render 函数的实现

```ts
// 位于 https://github.dev/remaxjs/remax/blob/v2.15.0/packages/remax-runtime/src/render.ts
import * as React from "react";
import ReactReconciler from "react-reconciler";
import hostConfig from "./hostConfig";
import Container from "./Container";
import AppContainer from "./AppContainer";

export const ReactReconcilerInst = ReactReconciler(hostConfig as any);

if (process.env.NODE_ENV === "development") {
  ReactReconcilerInst.injectIntoDevTools({
    bundleType: 1,
    version: "16.13.1",
    rendererPackageName: "remax",
  });
}

function getPublicRootInstance(container: ReactReconciler.FiberRoot) {
  const containerFiber = container.current;
  if (!containerFiber.child) {
    return null;
  }
  return containerFiber.child.stateNode;
}

export default function render(
  rootElement: React.ReactElement | null,
  container: Container | AppContainer
) {
  // Create a root Container if it doesnt exist
  if (!container._rootContainer) {
    container._rootContainer = ReactReconcilerInst.createContainer(
      container,
      0,
      false,
      null
    );
  }

  ReactReconcilerInst.updateContainer(
    rootElement,
    container._rootContainer,
    null,
    () => {
      // ignore
    }
  );

  return getPublicRootInstance(container._rootContainer);
}
```

可以看到, render 函数实际是对`ReactReconciler`的封装. 整个实现可以分为三步:

1.  基于 HostConfig 初始化`ReactReconcilerInst`对象, 后续`ReactReconciler`会根据 HostConfig 提供的 API 生成 Dom 操作指令, 然后按照指令调用`container`上的接口
2.  通过`ReactReconcilerInst.createContainer`方法将`container`对象包装为 Fiber 节点
3.  通过`ReactReconcilerInst.updateContainer`方法获取待渲染的 `JSX` 对象

至此, 整个流程执行完毕. 为`ReactReconciler`输入`HostConfig`&`container`&`JSX`, `ReactReconciler`会启动对`JSX`的渲染, 并根据`JSX`对象的变动计算虚拟 Dom 的变更, 生成实际 Dom 更新指令并根据 HostConfig 配置调用 container 上的方法.

但这里存在一个问题了, `JSX`只是一个普普通通的 `React.Component` 对象, 状态变更调用的也是内部的 setState 方法, `ReactReconciler`是怎么知到`JSX`的变动状态并计算虚拟 Dom 变更的呢?

实际情况是`ReactReconciler`在`updateContainer`方法中, 替换了`JSX`对象中 setState 方法的实现. 因此可以获知`JSX`的所有变动情况, 并根据需要调用`JSX`的生命周期钩子, 获取状态更新后的 render 结果.

不过说归说, talk is cheap show me your code. 接下来还是要依次看下 createContainer 和 updateContainer 的实现, 这里要涉及 react 的源码, 我们以react@16.7.0为例

## ReactReconciler.createContainer 的实现

首先是 createContainer

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberReconciler.js#L274
export function createContainer(
  containerInfo: Container,
  isConcurrent: boolean,
  hydrate: boolean
): OpaqueRoot {
  // 如果追下去的话会发现真的只初始化了一个FiberRoot, 其他啥都没干.
  return createFiberRoot(containerInfo, isConcurrent, hydrate);
}
```

可以看到, 初始化容器只是简单创建了一个 Fiber 节点并返回, 本身没有多余操作

# ReactReconciler.updateContainer 的实现

然后看看 updateContainer 的实现

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberReconciler.js#L282

export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function
): ExpirationTime {
  const current = container.current;
  const currentTime = requestCurrentTime();
  const expirationTime = computeExpirationForFiber(currentTime, current);
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback
  );
}
```

updateContainer 主要工作就是将`jsx对象`和`container`传给`updateContainerAtExpirationTime`, 并注册更新任务. 如果继续跟进的话, 可以看到以下调用链

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberReconciler.js#L161
updateContainerAtExpirationTime{
  // ...省略其余代码
  return scheduleRootUpdate(current, element, expirationTime, callback);
}
```

=>

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberReconciler.js#L161
export function updateContainerAtExpirationTime(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  expirationTime: ExpirationTime,
  callback: ?Function
) {
  // ...省略其余代码
  return scheduleRootUpdate(current, element, expirationTime, callback);
}
```

=>

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberReconciler.js#114
function scheduleRootUpdate(
  current: Fiber,
  element: ReactNodeList,
  expirationTime: ExpirationTime,
  callback: ?Function
) {
  // ...省略其他代码
  scheduleWork(current, expirationTime);
}
```

=>

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberScheduler.js#L1788
function scheduleWork(fiber: Fiber, expirationTime: ExpirationTime) {
  requestWork(root, rootExpirationTime);
  // ...省略其他代码
}
```

`requestWork`对应的是注册组件更新任务代码, 如果继续跟下去的话, 会依次看到下边的调用链, 一直到`beginWork`

`requestWork`=>`performWorkOnRoot`=>`renderRoot`=>`workLoop` => `performUnitOfWork` => `beginWork`

看下`beginWork`的代码

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberBeginWork.js#L1673
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime
): Fiber | null {
  // ...省略其他代码
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime
      );
    }
    case ClassComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime
      );
    }
  }
  // ...省略其他代码
}
```

对于函数组件, ReactReconciler 调用的是`updateFunctionComponent`函数, 对于类组件, ReactReconciler 调用的是`updateClassComponent`

至此, render 函数的原理讲解完毕. 接下来是那个核心问题: `ReactReconciler`是怎么拿到`JSX`的状态变更的.

# ReactReconciler 获取 JSX 对象状态变更信息的实现

## 类组件: ClassComponent

先从类组件开始.

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberBeginWork.js#L531
function updateClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps,
  renderExpirationTime: ExpirationTime
) {
  // ...省略其他代码
  constructClassInstance(
    workInProgress,
    Component,
    nextProps,
    renderExpirationTime
  );
}
```

`updateClassComponent`中无门需要关注的是`constructClassInstance`, 将类组件实例化

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberClassComponent.js#513
function constructClassInstance(
  workInProgress: Fiber,
  ctor: any,
  props: any,
  renderExpirationTime: ExpirationTime
): any {
  // ...省略其他代码
  adoptClassInstance(workInProgress, instance);
}
```

需要关注的是`adoptClassInstance`, 在这个函数中, 将组件实例的`updater`设置为了`classComponentUpdater`

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberClassComponent.js#L503
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  // 关键代码
  instance.updater = classComponentUpdater;
  // ...省略其他代码
}
```

而这个`classComponentUpdater`, 其代码如下

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberClassComponent.js#L188
const classComponentUpdater = {
  isMounted,
  enqueueSetState(inst, payload, callback) {
    const fiber = getInstance(inst);
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, fiber);

    const update = createUpdate(expirationTime);
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, "setState");
      }
      update.callback = callback;
    }

    flushPassiveEffects();
    enqueueUpdate(fiber, update);
    scheduleWork(fiber, expirationTime);
  },
  // ...省略其他代码
};
```

由于`classComponentUpdater`由`ReactReconciler`提供, 所以对`classComponentUpdater`自然可以被`ReactReconciler`捕获到.

但为什么将组件实例的`updater`设置成`classComponentUpdater`就会被捕获呢? 搂一眼`React.Component`的源码

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react/src/ReactBaseClasses.js#L58

Component.prototype.setState = function (partialState, callback) {
  invariant(
    typeof partialState === "object" ||
      typeof partialState === "function" ||
      partialState == null,
    "setState(...): takes an object of state variables to update or a " +
      "function which returns an object of state variables."
  );
  this.updater.enqueueSetState(this, partialState, callback, "setState");
};
```

显然, `Component`中的 setState 实际上调用的就是 updater 上的`enqueueSetState`方法. 而由于 updater 本身已经被替换为了`ReactReconciler`自身的实现, 所以自然可以捕获到类组件上的所有数据变更.

问题得解

## 函数组件: FunctionComponent

接着看下一项, `ReactReconciler`对函数组件中 useState 的接管实现

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react/src/ReactHooks.js#L54
export function useState<S>(initialState: (() => S) | S) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
```

useState 位于`ReactHooks.js`文件, 实际调用的是`ReactCurrentOwner.currentDispatcher`上提供的 useState 方法

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react/src/ReactHooks.js#L14
import ReactCurrentOwner from "./ReactCurrentOwner";

function resolveDispatcher() {
  const dispatcher = ReactCurrentOwner.currentDispatcher;
  invariant(
    dispatcher !== null,
    "Hooks can only be called inside the body of a function component."
  );
  return dispatcher;
}
```

而`resolveDispatcher`返回的又是`ReactCurrentOwner.currentDispatcher`对象. 这个`ReactCurrentOwner`看起来位于`packages/react/src/ReactCurrentOwner.js`, 但点进去会发现里边只有一个普通对象

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react/src/ReactCurrentOwner.js#L1
import type {Fiber} from 'react-reconciler/src/ReactFiber';
import typeof {Dispatcher} from 'react-reconciler/src/ReactFiberDispatcher';

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
const ReactCurrentOwner = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: (null: null | Fiber),
  currentDispatcher: (null: null | Dispatcher),
}

export default ReactCurrentOwner;
```

所以`react/src/ReactCurrentOwner.js`显然不是`ReactCurrentOwner`实际的提供者. 如果返回`beginWork`, 看`ReactReconciler`提供`ReactCurrentOwner`的方式时我们会看到

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberBeginWork.js#L47
// ...省略其他代码
import ReactSharedInternals from "shared/ReactSharedInternals";
// ...省略其他代码
const ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
// ...省略其他代码
function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps: any,
  renderExpirationTime
) {
  // ...省略其他代码
}
```

`ReactReconciler`也提供了一个`ReactCurrentOwner`, 如果继续往后跟, 可以看到他在`workLoop`中替换了`ReactCurrentOwner.currentDispatcher`

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberScheduler.js#29
import ReactSharedInternals from "shared/ReactSharedInternals";
// ...省略其他代码
const { ReactCurrentOwner } = ReactSharedInternals;
// 位于 https://github.com/facebook/react/blob/v16.7.0/packages/react-reconciler/src/ReactFiberScheduler.js#1187
function workLoop(isYieldy) {
  // ...省略其他代码
  if (enableHooks) {
    ReactCurrentOwner.currentDispatcher = Dispatcher;
  } else {
    ReactCurrentOwner.currentDispatcher = DispatcherWithoutHooks;
  }
}
```

但问题是, `ReactReconciler`引入的是`shared/ReactSharedInternals`, react 中引用的却是`react/src/ReactCurrentOwner.js`, 这是怎么做到的?

来看这段代码

```ts
// 位于 https://github.com/facebook/react/blob/v16.7.0/scripts/rollup/forks.js#L48

// Without this fork, importing `shared/ReactSharedInternals` inside
// the `react` package itself would not work due to a cyclical dependency.
'shared/ReactSharedInternals': (bundleType, entry, dependencies) => {
  if (entry === 'react') {
    return 'react/src/ReactSharedInternals';
  }
  if (dependencies.indexOf('react') === -1) {
    // React internals are unavailable if we can't reference the package.
    // We return an error because we only want to throw if this module gets used.
    return new Error(
      'Cannot use a module that depends on ReactSharedInternals ' +
        'from "' +
        entry +
        '" because it does not declare "react" in the package ' +
        'dependencies or peerDependencies. For example, this can happen if you use ' +
        'warning() instead of warningWithoutStack() in a package that does not ' +
        'depend on React.'
    );
  }
  return null;
},
```

显然, 答案是 rollup.

react 在使用 rollup 构建时, 通过定制编译脚本, 在输出将`shared/ReactSharedInternals`映射为了`react/src/ReactSharedInternals`, 从而实现对`ReactCurrentOwner`变量的替换, 进而将 useState 的实际提供者替换为`ReactReconciler`, 实现了对 useState 的控制

而我们对`ReactReconciler`接管函数组件`useState`的过程, 也可以宣告结束.

搞定了`ReactReconciler`的秘密, 在接下来的文章里, 我们就可以放心的研究 HostConfig 和 Container 的设计和实现了

# 参考资料

[小前端读源码 - React 组件更新原理](https://zhuanlan.zhihu.com/p/59831684)
[react 源码剖析：react/react-dom/react-reconciler 的关系](https://zhuanlan.zhihu.com/p/266892192)
