---
title: 无需root的微信聊天记录导出方案
tags: 日常
date: 2023-06-03 13:00:00
---

> 价值三台手机&至少10个工作日的研究成果
> 前置要求:
> 编程开发能力(必须->未来可能会封装解决方案)
> 小米手机(必须)
> ubuntu运行环境(用于安装sqlcipher)

微信前后用了近10年, 最近两年每回换手机都想把聊天记录导成文本进行记录, 但没找到好方法. 今天终于把路径跑通了, 记录一下.

微信聊天记录导出分为三步:

1.  将微信数据库从手机端导出, 得到微信数据库`EnMicroMsg.db`
2.  破解微信数据库密码, 得到解密后的数据库`EnMicroMsg.db.decrypted`
3.  读取数据库内容, 导出为html格式

这里边最难的是前两步.

#  准备阶段

导出聊天记录需要以下前提

-   硬件: **小米/红米**手机(必须)
    -   微信版本8.0.37
    -   MIUI版本14及以下
-   操作系统: Ubuntu22.04

该方案要求用户使用的必须是**小米/红米**手机. 如果没有的话可[买台任意的二手小米手机](https://list.jd.com/list.html?cat=13765%2C13767%2C13768&psort=2&ev=exbrand_%E5%B0%8F%E7%B1%B3%EF%BC%88MI%EF%BC%89%5E&psort=2&shop=1&click=2), 三四百块钱不算太贵. 考虑到只用一次的话, 临时借台也能接受.

拿到小米手机后, 为避免意外, 需要对操作环境状态进行初始化. 流程如下 

1.  将原聊天记录备份到电脑端
2.  删除小米手机内的微信, 安装[微信8.0.37](https://www.apkmirror.com/apk/wechat-tencent/wechat/wechat-8-0-33-release/wechat-8-0-33-3-android-apk-download/)版本
3.  从电脑端将聊天内容恢复到手机上.

通过这个步骤, 可以保证微信聊天记录一定是以8.0.37的加密算法进行的加密, 避免未来微信升级, 加密策略变更导致流程失效

然后开始处理

#   从手机中导出微信数据库

首先从手机中导出微信数据库. MIUI版本14及以下提供了手机端备份App功能, 依次点击`设置`-`我的设备`-`备份与恢复`-`手机备份恢复`-`手机备份`(备份内容只选择微信)-`立即备份`

![设置-我的设备](http://tva1.sinaimg.cn/large/007Yq4pTly1heli1688mgj30u01uoq7s.jpg)
![备份与恢复](http://tva1.sinaimg.cn/large/007Yq4pTly1heli1nzfenj30u01uodkx.jpg)
![手机备份](http://tva1.sinaimg.cn/large/007Yq4pTly1heli21re3cj30u01uo444.jpg)
![备份产物路径](http://tva1.sinaimg.cn/large/007Yq4pTly1heliamh8lgj30u01uowk4.jpg)
![备份产物路径-2](http://tva1.sinaimg.cn/large/007Yq4pTly1helic7d5hej310m08rgo7.jpg)

备份完成后, 文件位于`MIUI/Backup/AllBackup`中, `微信(com.tencent.mm).bak`即为微信应用的所有内容, 复制到电脑上, 将后缀名从`.bak`修改为`.zip`, 解压即可.

解压后微信聊天记录数据库名为`EnMicroMsg.db`, 位于`微信(com.tencent.mm)/apps/com.tencent.mm/r/MicroMsg/xxxxxx`文件夹内. 这个位置不太好找, 可以直接在操作系统下搜索文件名.

由于准备环节中我们通过重装微信的方式, 保证了当前手机上只有一个用户, 所以这里只会出现一个聊天数据库文件, 不需要和其他数据库进行分辨.

![确认数据库文件位置](http://tva1.sinaimg.cn/large/007Yq4pTly1heliju5wupj31ap0ay45n.jpg)
![微信聊天记录数据库](http://tva1.sinaimg.cn/large/007Yq4pTly1helifb8n7uj313k06nwhk.jpg)

接下来是数据库解密环节

#   解密微信数据库

##  生成解密密码

解密微信数据库需要两个参数:

IMEI: 这个在8.0.37版本是固定值, 恒定为`1234567890ABCDEF`
uin: 可以理解为是微信uid, 获取方法是登陆[文件传输助手-网页版](https://filehelper.weixin.qq.com/?from=windows&type=recommend), cookie里的wxuin字段即是

![微信uin](http://tva1.sinaimg.cn/large/007Yq4pTly1helinunp8jj30fl0gndk1.jpg)

uin也可以直接查看导出的`./微信(com.tencent.mm)/apps/com.tencent.mm/sp/auth_info_key_prefs.xml`文件, 里边有`_auth_uin`字段

或者更暴力一点用`find  /mnt/d/redmi_微信数据备份测试/微信\(com.tencent.mm\)/apps/com.tencent.mm/sp/  -name "*.xml"  -type f -exec sh -c 'grep -q uin "$1" && echo "$1"' _ {} \;` 直接过滤也可以----当然从路径中可以看出, 需要在wsl下执行这个命令

对应的密码是`md5(imei + uin)`的前7位(密码中如有字母, 均为小写)

## 将加密数据库转换为无密码数据库

拿到数据库密码后, 确保sqlcipher为**4.1及以上版本**,  执行命令`sqlcipher ./resource/EnMicroMsg.db`, 打开加密数据库, 依次执行以下代码即可转换得到无密码数据库`decryption_en_micro_msg.sqlite3`

```sql
-- 查看sqlcipher版本, 要求必须是4.1以上
-- 本次验证通过的版本是 4.5.4 community
PRAGMA cipher_version;
-- 配置密码
PRAGMA key = '1234567';
-- 配置解密算法
PRAGMA cipher_compatibility = 1;
-- 创建无密码数据库
ATTACH DATABASE 'decryption_en_micro_msg.sqlite3' AS db KEY '';
-- 将加密数据库导出到无密码数据库中
SELECT sqlcipher_export('db');
-- 导出完毕, 关闭连接
DETACH DATABASE db;
-- 退出sqlcipher
.q
```

# 将原始数据库转换为html聊天记录

[wechat-dump](https://github.com/ppwwyyxx/wechat-dump)本身提供了简单的将数据库转换为html的能力, 不过聊天样式还停留在古早时代, 输出的文件名也只是简单的按序号递增, 没有区分日期时间. 考虑到这是个人项目, 实现上有待完善的点可以理解. 记录一下转换命令

## 准备阶段

参考[wechat-dump](https://github.com/ppwwyyxx/wechat-dump)本身的项目说明, 需要以下几步.

1.  执行`bash third-party/compile_silk.sh`, 构建silk执行文件, 似乎是一个将微信语音转换为mp3的程序, 执行就是了
2.  下载`https://github.com/ppwwyyxx/wechat-dump/releases/download/0.1/emoji.cache.tar.bz2`文件, 将解压得到的`emoji.cache`放在项目根目录下, 方便读取
3.  整理resource文件夹, 将`avatar/emoji/image2/sfs/video/voice2`文件夹都放在同一个文件夹下, 作为res目录
    1.  这里边`emoji`位于`./微信(com.tencent.mm)/apps/com.tencent.mm/f/public`文件夹下
    2.  其他所有文件夹(`avatar/image2/sfs/video/voice2`)都在`./微信(com.tencent.mm)/apps/com.tencent.mm/r/MicroMsg/${userid}`文件夹下----就是`EnMicroMsg.db`所在的文件夹
4.  最好注释掉`wechat/emoji.py`里的日志输出, 报错过多会影响运行速度

## 执行

项目目录下执行`./dump-html.py 联系人的微信备注名 --db decrypted_enmicrossg.sqlite3  --res /mnt/e/微信\(com.tencent.mm\)/apps/com.tencent.mm/r/MicroMsg/xxxxxxxx --output ./resource/html/test.html`即可.

如果忘记了联系人的备注名, 可以数据库的rcontact表中查询, 对应字段是`conRemark`, 具体数据库结构介绍可以自行百度, 或者看[这篇文章](https://github.com/lefex/LefexWork/blob/master/blog/iOS/%E5%AF%BC%E5%87%BA%E5%BE%AE%E4%BF%A1iOS%E6%95%B0%E6%8D%AE%E5%BA%93.md), 有简单的介绍

更暴力的方法是通过[sqlite3浏览器](https://sqlitebrowser.org/dl/)直接查看message表里的聊天内容

但总而言之, 目前还没看到很好的导出方案. 后续可以考虑自己搞一个

# 特别注意

特别注意: **绝对要保护好无加密的聊天数据库文件**, 这里边有所有的微信聊天记录内容, 而且完全没有加密, 所有人都能查看. 放出去就能当场社死...

不过这都是后话, 属于幸福的烦恼...

接下来是纯技术部分, 仅为记录方案发现过程. 非代码爱好者可以`Ctrl+W`了

# 方案探索过程笔记-与正文无关

事实上, 上述流程是一个非常取巧的过程, uin和imei一步都不能错. 错了之后排查问题也相当麻烦. 所以还是得知其所以然, 记录一下正确的探索流程.

## 排查思路的来源

以上思路实际上均来源于[wechat-dump](https://github.com/ppwwyyxx/wechat-dump)开源项目, 具体来说是他的`Decrypt database file`步骤.

项目提供了一个`./decrypt-db.py decrypt --input ./resource/EnMicroMsg.db --imei 1234567890ABCDEF --uin 123456789` 命令, 可以用这个命令快速验证imei和uin组合是否正确, 正确就可以得到无密码数据库, 不正确就报错.

而这个项目又依赖`pysqlcipher3`包, 这个包要求操作系统中有4.10以上版本的`libsqlcipher-dev`, 但ubuntu/debian目前`libsqlcipher-dev`只提供到 3.4.1, 不能满足要求. 所以问题来了...

##  如何获得sqlcipher应用程序

目前官方未提供直接的应用程序下载, 我们需要的是...**手工编译**

首先克隆[sqlcipher](https://github.com/sqlcipher/sqlcipher)项目

构建前可能需要一些依赖, 可以提前安装
```shell
sudo apt-get install openssl tcl
```

如果configure失败, 提示`configure: error: C compiler cannot create executables `的话, 可以先卸载`sudo apt-get autoremove gcc g++`后重新安装`sudo apt-get install gcc g++`, 还不行就运行`prelink -au && depmod -a`以更新系统


执行以下代码
```shell
export SQLITE_HAS_CODEC
export SQLITE_TEMP_STORE=2
```
然后开始构建
```shell
# 生成构建配置
./configure --enable-tempstore=yes CFLAGS="-DSQLITE_HAS_CODEC" LDFLAGS="-lcrypto"
# 构建sqlcipher的可执行文件. 如果构建失败, 或需要重新构建前, 记得先执行make clean 清理之前的残留构建产物
make 
# 将构建产物推送至/usr/local/lib, 提供libsqlcipher.so动态链接库供pysqlcipher3绑定
# 由于是推送到/usr/local/lib, 所以需要sudo权限
sudo make install
# 将构建后的sqlcipher推送至全局Path下, 方便使用
cp sqlcipher /usr/local/sbin/
```


构建完成后执行`sudo /sbin/ldconfig -v`, 否则`pip install pysqlcipher3`时会有`cannot open shared object file: No such file or directory`报错

`pip install pysqlcipher3`默认会有缓存, 如果需要强制重新安装的话, 需要先执行`rm -rf ~/.cache`清理pip缓存

可以通过`python3 -c "from pysqlcipher3 import dbapi2 as sqlite; print(sqlite.sqlite_version)"`确认pysqlcipher3绑定的是不是预期中的sqlite版本, SQLCipher 4.5.4 community的输出是`3.41.2`. 如果输出值是`3.37.2`, 说明是sqlcipher (3.4.1-2build1)的产物, `apt autoremove`把官方的sqlcipher卸掉吧.

##  其他的破解微信数据库密码的方法

[wechat-dump](https://github.com/ppwwyyxx/wechat-dump)的思路是已知密码生成规则破解密码. 还有其他的两种思路:

方案一: 暴力破解.
对应于[EnMicroMsg.db-Password-Cracker](https://github.com/chg-hou/EnMicroMsg.db-Password-Cracker)这个项目. 由于密码只取了md5的前7位, 一共只有16^7=268435456种可能. 只要用程序反复尝试肯定也能搞出来. 

但这里其实也有风险: 这里只考虑了密码的状态空间有穷, 但没有想到加密算法组合本身也是一个问题----如果加密算法组合配置不正确, 密码正确也一样解不出来. 目前只能祈祷微信别换加密算法了

方案二: root手机后, 利用xposed框架拦截微信运行时的密码. 好处是该方法肯定可行. 问题是: 需要安卓开发能力----但这是我的弱项.

好了, 就这样. 剩下的看什么时候有空, 把数据库转html写写吧

#   参考资料

- [提取微信聊天记录](https://ssine.ink/posts/wechat-data-decryption/)
  - 按这篇文章实现的微信聊天记录导出
-  [文件传输助手-网页版](https://filehelper.weixin.qq.com/?from=windows&type=recommend)
   -  虽然微信大量封禁了网页版微信的登录权限, 但奈何文件助手也是网页, 登陆上去一样可以看uin...
- [Installing pysqlcipher3 on CentOS](https://dheeraj-alim.medium.com/installing-pysqlcipher3-on-centos-6bdaf8b53537)
  - 编译sqlcipher以安装pysqlcipher3时必看
- [加载共享库报错：cannot open shared object file: No such file or directory](https://blog.csdn.net/weixin_44401286/article/details/106699335)
-   [软件包: sqlcipher (3.4.1-2build1) [universe]](https://packages.ubuntu.com/jammy/sqlcipher)
    - 目前ubuntu/debian官方提供的sqlcipher(3.4.1)对应sqlite3版本是3.37.2