---
title: 解决Laravel编写数据库查询语句时的反人类设计
date: 2018-03-15 17:48:01
tags:
---

Laravel本身是一个很好用的框架, 但是每次查询数据库的时候, 都要`DB::table(表名)`, 非常反人类

今天研究了一下, 发现DB::table(表名) 实际上是返回了一个`\Illuminate\Database\Query\Builder`, 而这个builder是在框架初始化时创建的`Illuminate\Database\Connection`, 存在app('db')字段里, 那就好办了, 搞个Base类, 调用db方法的时候直接返回app('db')->query()->newQuery(), over


截图如下

![Base类](http://ww1.sinaimg.cn/large/6671cfa8ly1fpk7hijeb3j20g50ah0sz.jpg)

![实际查询](http://ww1.sinaimg.cn/large/6671cfa8ly1fpk7hu5263j20k80cxjsd.jpg)


PS: 
1. 相关代码

基类=>
```php
<?php
/**
 * Created by PhpStorm.
 * User: yaoze
 * Date: 2017/10/22
 * Time: 5:00
 */

namespace App\Model;

class Base
{
    protected static $Instance;

    /**
     * @return static
     */
    static public function Instance()
    {
        $class = get_called_class();
        if (empty(self::$Instance[$class])) {
            self::$Instance[$class] = new $class;
        }
        return self::$Instance[$class];
    }

    protected function __construct()
    {
    }

    /**
     * @return \Illuminate\Database\Query\Builder
     */
    protected function db()
    {
        return app('db')->query()->newQuery();
    }
}

```

查询代码=>

```php
<?php
/**
 * Created by PhpStorm.
 * User: yaoze
 * Date: 2017/10/22
 * Time: 4:51
 */

namespace App\Model;

use \DB;

/**
 * 测试方法
 * Class Test
 * @package App\Model
 */
class Test extends Base
{
    /**
     * 初始化地址库
     */
    public function initAddressTable()
    {
        $raw_address_list = $this->db()->select('*')
            ->from('address')
            ->limit(10)
            ->get();
        return $raw_address_list;
    }
}

```


2.  初始化数据库连接的位置
```php

 /**
     * Register container bindings for the application.
     *
     * @return void
     */
    protected function registerDatabaseBindings()
    {
        $this->singleton('db', function () {
            return $this->loadComponent(
                'database', [
                    'Illuminate\Database\DatabaseServiceProvider',
                    'Illuminate\Pagination\PaginationServiceProvider',
                ], 'db'
            );
        });
    }


```