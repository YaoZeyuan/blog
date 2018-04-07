---
title: 线上服务器vimrc
date: 2018-01-09 17:48:01
tags:
---

因为要在线上服务器使用, 所以只用的vim自带的功能

编写原则 =>  简单, 方便, 无依赖, 方便在线上改代码




```vim


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