---
title: Ubuntu16.04安装PHP7.2
date: 2018-04-01 17:48:01
tags:
---

Laravel5.6 要求 PHP7.1 以上的环境, 但是 Ubuntu16.04 自带的 PHP 只到 7.0, 所以需要通过 PPA 源安装下 PHP7.2

这一套的核心在于 Ubuntu 官方源里没有 PHP7.2 & PPA 源被墙了, 因此必须要将 PPA 源替换成中科大的代理源, 方法如下

1.  添加 PPA 源: `sudo add-apt-repository ppa:ondrej/php`
2.  将 PPA 源的地址换成中科大代理源的地址
    1.  打开`sudo vim /etc/apt/sources.list.d/ondrej-ubuntu-php-xenial.list`
    2.  把`https://ppa.launchpad.net/ondrej/php/ubuntu`换成`https://launchpad.proxy.ustclug.org/ondrej/php/ubuntu`
3.  执行`sudo apt-get update` & `sudo apt-get upgrade`, 搞定~

备注:

1.  中科大代理源在[这儿](https://github.com/ustclug/mirrorrequest/issues/43)
2.  部分同学可能系统里没有`add-apt-repository`命令, `sudo apt-get install software-properties-common`手工装一下就好了
