---
title: Windows系统重装指南
date: 2020-07-23 23:04:00
tags:
---

电脑又双叒叕坏了。 重装了一遍系统。 这里记录一下重装后的操作（顺序）

1.  安装 Win10，登录微软账号，激活，加入预览计划，然后让 windows 在后台下载补丁&更新
2.  重新登陆 onedrive，
    1.  onedrive 有云同步`桌面`/`个人文档`/`图片`文件夹功能. 所有软件的设置默认都在`个人文档`里, 换句话说, 只要保证`个人文档`没事, 系统重装后软件的配置就不会丢失
    2.  同理, 为了保证系统和软件设置分离, 我之前就勾上了 onedrive 的`备份`-`重要电脑文件夹`选项, 并且把 onedrive 存储目录设为了`F盘`. 因此, 重装系统之后, 只要重登 onedrive, 系统会自动恢复`桌面`和软件配置
    3.  唯一美中不足的就是 ondrive 默认存储目录在 C 盘, 因此需要退出 onedrive 再登入， 把同步目录修改为 F:/onedrive
3.  事实上所有不便同步的文件都在 F 盘, 包括不限于以下目录
    1.  翻墙 => v2ray. 双击运行勾上开机启动
    2.  `QQ微信聊天记录` => 安装 QQ/微信的时候手工配置下, 将聊天内容存在`QQ微信聊天记录/tencet`和`QQ微信聊天记录/wechat`里
4.  安装
    1.  Chrome
        1.  借道安利两篇文章
        2.  [扩展推荐](http://www.yaozeyuan.online/2018/01/08/2018/01/Chrome扩展推荐/)
        3.  [调试进阶](http://www.yaozeyuan.online/2018/05/18/2018/05/Chrome调试进阶/)
    2.  VSCode
        1.  VSCode 的 remote 模式可以作为 XShell 的替代品
        2.  ![使用方式](http://ww1.sinaimg.cn/large/6671cfa8ly1gh1aldo25cj20sq0lg76y.jpg)
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
    3.  VSCode, 搜索插件`Settings Sync`, 然后同步配置(刚发现 VS Code 开始支持账户登录, 那未来这一步就可以省了)
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
        1.  zoom
        2.  PyCharm 社区版(用于查看 git 历史)
        3.  [python](https://www.python.org/downloads/windows/), 开发 node 项目时可能会用
9.  补充配置
    1.  win10
        1.  配置 hosts 文件
            1.  创建`F:\OneDrive\Documents\个人文档\Program\hosts.md`文件作为通用 hosts 文件
            2.  使用管理员身份打开 powershell, 依次执行以下命令, 替换 hosts 配置
                1.  `rm C:\Windows\System32\drivers\etc\hosts`
                2.  `New-Item -Path C:\Windows\System32\drivers\etc\hosts -ItemType SymbolicLink -Value F:\OneDrive\Documents\个人文档\Program\hosts`
    2.  ubuntu18.04
        1.  git
            1.  ssh-keygen 生成 ssh 公钥, 将 pub 公钥添加到公司 git & github 上
            2.  建议在 win10 中也使用相同的 ssh 公钥/私钥. 具体方法为: 在 powershell 中执行`ssh-keygen`, 然后使用 everything 搜索`id_rsa.pub`, 把 ubuntu 中的公钥私钥复制过去覆盖上即可
        2.  系统
            1.  切为阿里云源(默认是欧洲官方源)
                ```bash
                #阿里云源
                deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
                deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
                deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
                deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
                deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
                deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
                deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
                deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
                deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
                deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
                ```
            2.  安装 nvm, 配置淘宝镜像
                1.  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`
                2.  更换 nvm 源 => `echo "export NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node" >> ~/.bashrc && source ~/.bashrc`
                3.  安装 node `nvm install stable && nvm use stable`
                4.  更换 npm 源 => `npm config set registry=http://registry.npm.taobao.org`
            3.  免除用户的 sudo 密码
        3.  vim
            1.  配置 vimrc(建议使用 vim 粘贴前先执行`set paste`, 避免配置内容被 vim 自动换行)
                ```vimrc
                " 功能说明：
                " 显示行号 => 可使用`set nonumber` 关闭行号显示
                " 不生成swp交换文件
                " 关闭粘贴代码时添加注释的功能
                " 在行头/行尾使用左/右键时自动前往上一行/下一行
                " 在插入模式下, 按 `ctrl+n` 自动补全单词(多个单词可选时使用`↑`、`↓`键选择, 回车确认)
                " 在普通模式下, 按 `shift`+`t` 打开文件夹浏览窗口, 回车在屏幕右侧预览编辑文件, `t` 在新标签中打开文件, `ctrw + w`切换光标所在屏幕区域, `ctrl + n`切换到右侧标签页， `ctrl + b`切换到左侧标签页
                "
                " 使用方式：
                " 将文件重命名为.vimrc ,置于用户的~目录下
                "
                autocmd! bufwritepost .vimrc source % " vimrc文件修改之后自动加载。 linux。
                " 常规设定
                "set number " 显示行号。
                set ambiwidth=double " 将所有字符显示为全角宽度
                set autoindent " 自动缩进
                set wildmenu " 自动补全的时候，将补全内容使用一个漂亮的单行菜单形式显示出来。
                set whichwrap=b,s,<,>,[,] " 光标从行首和行末时可以跳到另一行去
                set nobackup " 取消备份
                set noswapfile " 不生成交换文件
                autocmd FileType * setl fo-=cro " 关闭自动添加注释的效果
                " 支持鼠标滚动
                " set mouse=a
                colorscheme elflord " 设定颜色主题
                " tab 空格
                set expandtab " 将输入的tab自动转换为空格(默认4个空格)
                set smarttab " 在行首输入tab时自动转换为空格
                set shiftwidth=4 " 缩进时默认的缩进宽度(4个空格)
                " netrw文件浏览器
                set autochdir " 当打开一个文件时，自动切换到该文件所在的目录
                let g:netrw_altv = 1 " 与preview项相配合，在右侧打开预览文件
                let g:netrw_preview = 1 " 在一个垂直列表中打开预览文件
                let g:netrw_liststyle = 3 " 列表模式-文件夹浏览模式
                let g:netrw_winsize = 30 " 文件夹列表的宽度(30个字符)
                let g:netrw_browse_split = 4 " 在当前窗口的新区域内预览文件(与P操作相同)
                " 编写函数实现开关 Vexplore 文件夹列表的效果
                function! ToggleVExplorer()
                if exists("t:expl_buf_num")
                let expl_win_num = bufwinnr(t:expl_buf_num)
                if expl_win_num != -1
                let cur_win_nr = winnr()
                exec expl_win_num . 'wincmd w'
                close
                exec cur_win_nr . 'wincmd w'
                unlet t:expl_buf_num
                else
                unlet t:expl_buf_num
                endif
                else
                "exec '1wincmd w'
                Vexplore
                let t:expl_buf_num = bufnr("%")
                endif
                endfunction
                " 按键 => 指令快捷方式
                map <C-n> :tabn<CR>
                map <C-b> :tabprevious<CR>
                map <S-t> :call ToggleVExplorer()<CR>
                set paste " 复制模式
                ```

done
