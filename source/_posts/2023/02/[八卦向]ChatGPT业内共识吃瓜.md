---
title: [八卦向]ChatGPT业内共识吃瓜
tags: 人工智能
date: 2023-02-24 13:00:00
---

> 专业吃瓜

看完了[邱锡鹏教授的讲座](https://www.bilibili.com/video/BV1Tx4y1w78p), 难以按捺自己的吃瓜之情, 这里按讲座顺序八卦下.

免责声明: 笔者专业不是人工智能方向, 对这块所知了了, 本文仅为吃瓜, 就图一乐, 不保证内容正确性.

> 严肃讨论出门左转`知网`/`arxiv.org/list/cs.AI`谢谢
>
> 严肃讨论出门左转`知网`/`arxiv.org/list/cs.AI`谢谢
>
> 严肃讨论出门左转`知网`/`arxiv.org/list/cs.AI`谢谢

# AI 学界对 ChatGPT 的能力/缘起有共识

目前为止我看过三个独立来源的学术分享.

- 北大高才生版论文综述: [符尧:拆解追溯 GPT-3.5 各项能力的起源](https://yaofu.notion.site/GPT-3-5-360081d91ec245f29029d37b54573756#cf00f4e11d974187956122ce7d534386)
- 人话版论文综述: [张俊林：由 ChatGPT 反思大语言模型（LLM）的技术精要](https://mp.weixin.qq.com/s/MISCVMGeT6MvzzhfjHmyCg
- 还有就是今天看到的[复旦大学邱锡鹏教授《大型语言模型的能力分析与应用》](https://www.bilibili.com/video/BV1Tx4y1w78p)()

三个作者一个在爱丁堡读博(符尧), 一个在新浪微博 AI Lab 做负责人(张俊林), 一个在复旦大学尝试复现 ChatGPT(邱锡鹏, [人民邮电报:复旦大学团队发布国内首个类 ChatGPT 模型 MOSS](https://paper.cnii.com.cn/article/terms-zh-cn_16337_315620.html)), 但对 ChatGPT 的能力范围/缘起/训练过程的介绍思路几乎一模一样, 说明学术界内部对 ChatGPT 能力取得了共识, 否则声音不会这么一致

反过来, 这也说明学术界认可`ChatGPT是大型语言模型, 而非通用智能模型`这一论断, 基于这一论断可以得出的具体结论参考我上篇文章[ChatGPT 快问快答](https://mp.weixin.qq.com/s/i-aDQBsOFzj2vv6UNO4Big), 简单来说就是, 凡是认为 ChatGPT 是**通用型 AI**或者基于 ChatGPT 可以在近期(5 年内)发展成**通用型 AI**,可以引发大规模失业/解决大部分问题的, 都是民科, 这些言论都可以略过了.

大型语言模型的作用只是根据上文生成**合适的下文**, 但**不是正确的下文**, 保证不了正确, 后续应用无从谈起.

> 太先进的科技在不了解原理的人看来宛如神迹
>
> 譬如神话 ChatGPT 那一批

# 邱锡鹏教授做出来的不是国产 ChatGPT, 可能是 ChatGPT 的萌芽版 InstructGPT

参考邱教授自己在知乎上的点赞截图, 原答案在[这里](https://www.zhihu.com/question/585248111/answer/2903543913)

![点赞截图](https://article.biliimg.com/bfs/article/8114581b4c0ded3ee308d099cffef64f3767de72.png)

InstructGPT 是 22 年 2 月提出来的, 目前看邱教授团队是世界第一个宣布复现出类 InstructGPT 模型的团队. 亮点是世界其他团队居然需要一年时间才能复刻 InstructGPT(InsructGPT 参数量为 0.13 亿, GPT-3 参数量 1.75 亿 , ChatGPT 则是 1750 亿. 可以近似认为大语言模型的能力和参数量线性相关), 说明 OpenAI 这条路确实不好走.

下一步应该是看百度预计三月份发布的`文心一言`和谷歌的`Bard`的效果, 如果效果和 ChatGPT 接近, 说明 OpenAI 的技术护城河没有那么深. 如果确认还是 ChatGPT 遥遥领先, 那后边追赶的路可就长了

![邱教授介绍ChatGPT发展路径](https://article.biliimg.com/bfs/article/2fe1af3d2bac5c16957a379c7288f2985bd79de7.png)

# 流浪地球 2 从哪里搞得科学顾问, 这么专业

在电影院的时候, 流浪地球 2 片尾彩蛋, MOSS 说自己基于图丫丫`人在回路`的学习确认了延续人类文明的最优选择是毁灭人类. 我当时听了就很惊奇: 人在回路这个名词听起来非常怪, 是不是创作团队搞错了? 出门一查发现居然真有这个词, 是 AI 领域的专业名词

![流浪地球2:人在回路彩蛋截图](https://article.biliimg.com/bfs/article/7b1de153827b2acc840655c6fca690cd410bbe9e.png)

今天听邱教授分享时又看到这个词----郭导你的科学顾问从哪儿找的, 为什么这么专业, 连用处都是对的 😂

![人在回路与ChatGPT训练](https://article.biliimg.com/bfs/article/0c7b881ed16088763c744f7a3f2a9b76ef111e5f.png)

# 训练 ChatGPT 的不只是肯尼亚"血汗工厂"里的标注员, 还有 40+ 个硕士生

为了确保 ChatGPT 的回答和人类预期一致, 需要主动为其编写模范回答----但这显然就不是简单数据标注就能完成的事了.

听邱教授分享, OpenAI 团队为了保证问题&回答的质量, 请了 40 多个硕士生负责选择问题&提供标准答案, 够认真

![需要硕士参与对ChatGPT进行校对](https://article.biliimg.com/bfs/article/497a88eed147da020ca460c6218bd3f0c7868ee6.png)

# 普通的训练集已经不能评估大模型的能力了...邱教授选择用...22 年的高考题!

邱教授认为普通的 AI 训练集都是为了检测单项能力, 但对于大模型这种怪物, 普通训练集缺点重重(见附图), 一言蔽之就是太弱了

![普通训练集的缺陷](https://article.biliimg.com/bfs/article/eede2374f8ca9c536f9068ec134ea3e4e389825b.png)

那怎么整呢, 邱教授考虑到 ChatGPT 所有的训练材料截至于 2021 年----那它肯定没做过 22 年的中国高考题啦对不对, 所以邱教授专门为 ChatGPT 定制了一套`GaoKao-Bench`----看看谁才是真正的做题家!

![GAOKAO-Bench](https://article.biliimg.com/bfs/article/bd764f573759cf89d85be25d31b872ca82b1b164.png)

做题现场大概是这样:

数学 =>

![做题现场:数学](https://article.biliimg.com/bfs/article/56c14eff30dbcbe58329d43d1fc33559420df25d.png)

历史 =>

![做题现场:历史](https://article.biliimg.com/bfs/article/25082b024f382909346871701dd2f01c18e9fe11.png)

最终结果显示 ChatGPT 在(文理科)客观题上达到了 500 分考生的水平, 主观题上文科得分率 78%, 理科得分率小于 30%, 亲爱的文科朋友们你们准备好了吗 😂

![最终考试结果](https://article.biliimg.com/bfs/article/43404b09d2e305cf692a80b701291f6850d4758f.png)

# ChatGPT 的可能应用

![ChatGPT的进一步改进](https://article.biliimg.com/bfs/article/024d483a43c0847f2d06b8b48eeabdc9ecd67f84.png)

这一点显示 ChatGPT 实际上是大家的镜子, 我身边的(程序员)纷纷表示 ChatGPT 非常适合拿来写代码/写正则表达式/写 SQL/写 Shell 脚本/写..., 邱老师身为教授居然完全没提到这一茬, 心心念念想的只有----可以帮忙生成更多的人工智能训练集啦

比如改善`句子表示学习`
![ChatGPT应用:句子表示学习](https://article.biliimg.com/bfs/article/44fad1a0236232a0b1a3e6ce337ceaf6bfe25a02.png)

帮忙进行各种学习任务
![ChatGPT应用:句子表示学习](https://article.biliimg.com/bfs/article/86d4447054074cc90eadeb20c52f2d2c12dc5918.png)

总之就是: 用人工智能训练人工智能, 正反馈飞轮转起来~

# 最后的总结

总结上其实没什么

![最后的总结](https://article.biliimg.com/bfs/article/1faea9c5acab3d6a719feab23d0daa65962da25d.png)

我认为主要还是 ChatGPT 太新, 目前留出的扩展能力又太弱(只有 4000 个字的记忆空间), 所以也只能泛泛而谈

![将加速通用人工智能的实现](https://article.biliimg.com/bfs/article/60fea0071901377af773a63991b0223dae09a563.png)

等待复刻版吧.

感谢邱教授分享, 感谢 B 站和 up 主提供机会让我们看到这么专业的分享. 感谢互联网, 感谢现代科技的力量

最后再安利一下自己写的总结文章:

- 简单科普: [ChatGPT 快问快答](https://mp.weixin.qq.com/s/i-aDQBsOFzj2vv6UNO4Big)
- 论文精读: [ChatGPT 资料梳理](https://mp.weixin.qq.com/s/GilyrTia3aVygoXIiZPRYA)
