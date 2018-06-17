---
title: 不再重要的CSS调优:读<CSS重构:样式表性能调优>
date: 2018-06-17 17:48:01
tags:
---

概括下书里我认为有用的部分:

##  优秀架构的标准
1.  可预测
    *   优秀的软件架构可以对软件的工作方式和结构做出准确的假设, 新成员可以通过架构直接知道
        1.  组件的功能是什么
        2.  某一段代码在何处
        3.  新代码应该添加到哪里
2.  可扩展
    *   好的软件架构在其上添加新功能很容易, 而且不需要做大的结构性变化.
3.  可维护
    *   可维护性指: 当你修改一处代码时, 没必要大规模改动其他代码. 因此, 在好的架构上, 修改现有功能是一件比较容易地事
4.  可提升代码复用性

##  选择器优先级

    优先级就是分配给指定的CSS声明的一个权重，它由 匹配的选择器中的 每一种选择器类型的 数值 决定。

    而当优先级与多个CSS声明中任意一个声明的优先级相等的时候，CSS中最后的那个声明将会被应用到元素上。

    当同一个元素有多个声明的时候，优先级才会有意义。因为每一个直接作用于元素的CSS规则总是会接管/覆盖（take over）该元素从祖先元素继承而来的规则。

    
    
via [MDN:优先级](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity)

优先级其实是一个元组(A, B, C, D, E), 具体计算规则如下

1.  A/B/C/D/E 默认值为0, 每一项权重值单独计算, 不会进位
2.  如果有!important, A +1
3.  如果是内联样式, B + 1
3.  每有一个 id选择器, C + 1
4.  每有一个下列选择器, D + 1
    1.  类选择器（class selectors） (例如,.example)，
    2.  属性选择器（attributes selectors）（例如, [type="radio"]），
    3.  伪类（pseudo-classes）（例如, :hover）
5.  每有一个下列选择器, E + 1
    1.  类型选择器（type selectors）（例如, h1）
    2.  伪元素（pseudo-elements）（例如, ::before）
6.  每有一个下列选择器, E + 0
    1.  通配选择符（universal selector）(*), 
    2.  关系选择符（combinators） (+, >, ~, ' ')  
    3.  否定伪类（negation pseudo-class）(:not()) 
7.  否定伪类:not() 内部声明的选择器, 按 2~6 的规则为当前选择器增加优先级 
8.  浏览器自带样式和继承样式的优先级为**无**, 因此优先级为(0,0,0,0,0)的选择器可以覆盖浏览器自带样式(例如 *{box-sizing: border-box;})

示例 =>
```CSS
*                                   /* (0, 0, 0, 0, 0) */
li                                  /* (0, 0, 0, 0, 1) */
li!important                        /* (1, 0, 0, 0, 1) */
ul li                               /* (0, 0, 0, 0, 2) */
ul ol+li                            /* (0, 0, 0, 0, 3) */
ul ol+li                            /* (0, 0, 0, 0, 3) */
h1 + *[REL=up]                      /* (0, 0, 0, 1, 1) */
ul ol li.red                        /* (0, 0, 0, 1, 3) */
li.red.level                        /* (0, 0, 0, 2, 1) */
a1.a2.a3.a4.a5.a6.a7.a8.a9.a10.a11  /* (0, 0, 0, 11,0) */
#x34y                               /* (0, 0, 1, 0, 0) */
#s12:not(FOO)                       /* (0, 0, 1, 0, 1) */
.foo :matches(.bar, #baz)           /* (0, 0, 1, 1, 0) 或  (0, 0, 0, 2, 0), 取决于元素具体匹配到了哪个选择器 */
```



##  然后

没了...

浏览器盒子模型, constent-box和border-box的差别虽然比较重要, 但几乎所有的css类库中都会有一句`*{box-sizing: border-box;}`, 所以不需要掌握

css选择器性能由于Chrome的一个[优化](https://stackoverflow.com/a/19431833), 导致性能问题不复存在, Chrome30里直接把开发者工具里的CSS性能分析器给[删了](https://bugs.chromium.org/p/chromium/issues/detail?id=265486)

关于视觉测试, 书里建议使用[Gemini](https://gemini-testing.github.io/) + PhantomJS, 这个我没有用过, 留作参考吧. 不过目前来看国内前端团队的UI测试基本靠设计手工看, antd也有UI自动化测试, 不过他们是用[jest+puppeteer](https://facebook.github.io/jest/docs/en/puppeteer.html)实现的, 或许也可以考虑下.

剩下的就没啥了, 在这个组件化的时代, CSS优化, 已经不重要了