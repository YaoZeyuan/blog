---
title: Windows系统重装指南
date: 2020-07-23 23:04:00
tags:
---

> 更新历史
>
> - 2022 年 7 月 28 日
>   - 默认操作系统更新为 win11
>   - Onedrive 存储位置由 F 盘迁移到 D 盘
>   - vscode 支持配置同步
>   - Linux 系统操作使用 VSCode 替代, 移除 vim 配置
>   - WSL2 默认使用导出的版本, 而非重新安装
> - 2020 年 7 月 23 日
>   - 初始化文章

电脑又双叒叕坏了。 重装了一遍系统。 这里记录一下重装后的操作（顺序）

1.  安装 Win10，登录微软账号，激活，加入预览计划，然后让 windows 在后台下载补丁&更新
2.  重新登陆 onedrive，
    1.  onedrive 有云同步`桌面`/`个人文档`/`图片`文件夹功能. 所有软件的设置默认都在`个人文档`里, 换句话说, 只要保证`个人文档`没事, 系统重装后软件的配置就不会丢失
    2.  同理, 为了保证系统和软件设置分离, 我之前就勾上了 onedrive 的`备份`-`重要电脑文件夹`选项, 并且把 onedrive 存储目录设为了`D盘`. 因此, 重装系统之后, 只要重登 onedrive, 系统会自动恢复`桌面`和软件配置
    3.  唯一美中不足的就是 ondrive 默认存储目录在 C 盘, 因此需要退出 onedrive 再登入， 把同步目录修改为 D:/onedrive
3.  事实上所有不便同步的文件都在 D 盘, 包括不限于以下目录
    1.  翻墙 => v2ray. 双击运行勾上开机启动
    2.  `QQ微信聊天记录` => 安装 QQ/微信的时候手工配置下, 将聊天内容存在`QQ微信聊天记录/tencet`和`QQ微信聊天记录/wechat`里
4.  安装
    1.  Chrome
        1.  借道安利两篇文章
        2.  [扩展推荐](https://www.yaozeyuan.online/2018/01/08/2018/01/Chrome扩展推荐/)
        3.  [调试进阶](https://www.yaozeyuan.online/2018/05/18/2018/05/Chrome调试进阶/)
    2.  VSCode
        1.  VSCode 的 remote 模式可以作为 XShell 的替代品
        2.  ![使用方式](https://tva1.sinaimg.cn/large/6671cfa8ly1gh1aldo25cj20sq0lg76y.jpg)
    3.  KeePass
5.  密码库在 onedrive 里，需要用 keepass 打开，所以要先装 keepass。装完顺手把 onedrive 里的中文语言文件（Chinese_Simplified.lngx）扔到`C:/Program Files (x86)/KeePass Password Safe 2/LanguagesLanguange`下，齐活
6.  有了 keepass，v2ray，然后就可以登陆 chrome 账号，让 chrome 在后台同步插件/书签/浏览记录不表
7.  修复配置项
    1.  系统配置
        1.  每次重装都要配置
            1.  默认使用系统自带的微软拼音输入法，把`中文输入时使用英文标点`打开
            2.  `设置`->`账户`
                1.  ->`同步你的设置`, 全勾上
                2.  ->`登录选项`->`隐私`->打开`更新或重启后,使用我的登录信息自动完成设备设置并重新打开我的应用程序`. 有条件的还可以配置上`指纹解锁`
            3.  `设置`->`系统`
                1.  ->`多任务处理`->`虚拟桌面`->`在任务栏上显示打开的窗口`-> 选`所有桌面`
                2.  ->`电源和睡眠`->把睡眠关掉, 在电池高级设置里, 把扣盖子自动睡眠关掉(笔记本有电任性)
            4.  `设置`->`个性化`
                1.  ->`开始`->`使用全屏"开始"屏幕`, 可以把常用程序固定在开始首屏上, 很方便
        2.  只需要设置一次
            1.  `设置`->`系统`->`剪切板`->`剪切板历史记录`->`开`
    2.  把文件管理器的`查看`-`文件后缀名`打开
    3.  VSCode 登录微软账号, 自动同步配置
    4.  chrome 设为默认浏览器
8.  下载应用
    1.  必选
        1.  Microsoft Office
        2.  好压/2345 看图王
        3.  QQ/微信/企业微信
        4.  everything
        5.  Windows Terminal(在应用商店里, 需要 win10.1904 以上版本)
        6.  wsl => Ubuntu 18.04(不要安装 20.04, 20.04 的系统 sleep 函数有 bug, 会吃满 cpu)
        7.  nvm-windows
        8.  git
    2.  可选
        1.  Idea 社区版(用于查看 git 历史)
        2.  [python](https://www.python.org/downloads/windows/), 开发 node 项目时可能会用
9.  补充配置
    1.  win10
        1.  配置 hosts 文件
            1.  创建`D:\OneDrive\Documents\个人文档\Program\hosts.md`文件作为通用 hosts 文件
            2.  使用管理员身份打开 powershell, 依次执行以下命令, 替换 hosts 配置
                1.  `rm C:\Windows\System32\drivers\etc\hosts`
                2.  `New-Item -Path C:\Windows\System32\drivers\etc\hosts -ItemType SymbolicLink -Value D:\OneDrive\Documents\个人文档\Program\hosts.md`
    2.  ubuntu18.04
        1.  git
            1.  ssh-keygen 生成 ssh 公钥, 将 pub 公钥添加到公司 git & github 上
            2.  建议在 win10 中也使用相同的 ssh 公钥/私钥. 具体方法为: 在 powershell 中执行`ssh-keygen`, 然后使用 everything 搜索`id_rsa.pub`, 把 ubuntu 中的公钥私钥复制过去覆盖上即可
        2.  系统
            1.  安装 nvm, 配置淘宝镜像
                1.  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`
                2.  更换 nvm 源 => `echo "export NVM_NODEJS_ORG_MIRROR=https://npm.taobao.org/mirrors/node" >> ~/.bashrc && source ~/.bashrc`
                3.  安装 node `nvm install stable && nvm use stable`
                4.  更换 npm 源 => `npm config set registry=https://registry.npm.taobao.org`
            2.  免除用户的 sudo 密码
        3.  最好使用 wsl
        4.  建议例行导出 wsl 到 OneDrive 上备份, 重新安装系统后, 只需简单导入即可重建系统
            1.  导出命令
                1.  `wsl --export <Distro> <FileName>`
                2.  示例: `wsl --export Ubuntu .\wsl_ubuntu_2022.tar`
            2.  导入命令
                1.  `wsl --import <Distro> <InstallLocation> <FileName>`
                2.  示例: `wsl --import Ubuntu C:\ubuntu\ .\wsl_ubuntu_2022.tar`
            3.  导入系统后需要配置 wsl 默认启动用户, 配置文件位于系统内的`/etc/wsl.conf`, 添加以下字段即可
                1.  ```config
                    [user]
                    default=username
                    ```
                2.  方法来自 via [这里](https://superuser.com/questions/1566022/how-to-set-default-user-for-manually-installed-wsl-distro)
