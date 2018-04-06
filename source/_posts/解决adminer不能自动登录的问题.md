---
title: 解决adminer不能自动登录的问题
date: 2017-10-11 17:48:01
tags:
---

`adminer`是一个非常好用的数据库管理软件, 但是在我把网络服务器从`apache`换成`ngnix`之后，它的记住账号密码的功能突然不能用了。

每次重启完电脑，再点左边的登录记录，总是提示说『`Master password expired. Implement permanentLogin() method to make it permanent.`』


这个问题困扰了我很长时间，一开始认为是`session`的问题，看了下配置&重启虚拟机发现`session`记录完好。然后发现只要不关浏览器，就没有问题。这就很诡异了。。。

今天下午突然发现每次重启浏览器后它的`cookie`都不一样，再查看源代码，发现有这么一句：

    $params = session_get_cookie_params();
    cookie("adminer_key", ($_COOKIE["adminer_key"] ? $_COOKIE["adminer_key"] : rand_string()), $params["lifetime"]);


果断编辑代码查看`$params["lifetime"]`的值，果然是`0` =>  `cookie`没有保存上！

那答案就很明显了。由于`cookie`没记上，所以记住密码功能肯定也不能用了。查了下`session_get_cookie_params`的函数说明，把`php.ini`里`session.cookie_lifetime`的配置从`0`改成`8640000`，问题解决


PS: 顺带补一句，如果在配置中没开启`session.auto_start`的话, `adminer`会在代码里重载`cookie`的生命周期配置,还是会导致cookie生存时间为0, 出现无法记录登录信息的bug。这里可以直接在`adminer.php`的代码前加行`session_name("adminer_sid");session_start();` 或者搜索`call_user_func_array('session_set_cookie_params'`,把前边那句`$xe=array(0,preg_replace('~\\?.*~','',$_SERVER["REQUEST_URI"]),"",$ba)`改成`$xe=array(8640000,preg_replace('~\\?.*~','',$_SERVER["REQUEST_URI"]),"",$ba)`，手工指定上`cookie`过期时间就好了  