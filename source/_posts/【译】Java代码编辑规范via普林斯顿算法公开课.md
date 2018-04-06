---
title: 【译】Java代码编辑规范via普林斯顿算法公开课
date: 2016-06-23 17:48:01
tags:
---

# 【译】Java代码编辑规范via普林斯顿算法公开课

目前[普林斯顿的算法公开课](https://class.coursera.org/algs4partI-006)已经开到了第二周，执教老师是一如既往亮瞎眼的Adobe公司董事Robert Sedgewick，如果你没听说过Adobe的话……算了，你只要知道PhotoShop，PDF，Flash现在都是他家出的就行，嗯。

译者作为一名没接受过代码规范教育的野生猿类，初次提交代码时被判卷系统的空格和缩进要求折磨的欲仙欲死。所以，如果你也准备去上他的课，提前看一下这篇文章可能会对你有些帮助。
## 前言

编写代码时的首要任务就是保证代码的易读易懂。一个良好的编程习惯往往等同于更方便的捉虫、维护和更少的错误。写程序如同作文，如果能按照一定的格式与标点去写文章，你在文章里所透露出的信息才会令人更加信服，显然，当你书写代码时，你也要秉持同样的原则。而且，如果考虑到将来会有人被派去维护你的代码，遵守下面这些要求就更重要了。在你被派去维护别人的代码时，我想你一定会非常感谢这些编码规范的！
## 编码(Coding)
-   保持你的程序和方法足够少而且便于管理
-   充分利用语言自身的特性去解决问题
-   使用简单的逻辑结构与控制流
-   避免使用魔数(比如-1.0.1.2)，作为替代，给他们一个有意义的符号做名字(使用宏来替代魔数)
## 命名规范(Name conventions):

以下是在为变量、方法、类命名时的常用约定
-   使用那些可以准确传达你目的的词作为变量名。选择易于发音的单词，避免使用含义模糊的缩写。比如，使用_wageParHour_或者_hourlyWage_代替_wph_，使用_polygon_代替_p_或者_poly_或_pgon_
-   前后一致(be consistent)
-   用_是/否_来为变量方法进行命名，以使名称含义清晰有意义，例如_isPrime_或者_isEmpty()_或_contains()_
-   为临时变量和在循环语句中使用的计数变量使用短名字(比如i,j,k)，把那些更富有描述性的名字留给重要的变量
-   拒绝使用太平常的名字比如_foo_或者_tmp_，当然，也别用那些乱码似的名字，比如_adqw_，如果可能，尽量在代码里使用术语(作为名字)
-   使用实际意义命名而不是用它的值，_DAYS_PER_WEEK_显然比_SEVEN_要好得多

<table >
<thead>
<tr>
 <th style="text-align:center;">种类</th>
 <th style="text-align:center;">命名规则</th>
 <th style="text-align:center;">示例</th>
</tr>
</thead>
<tbody>

<tr><td></td><td style="text-align:left;">变量名要求短且有意义</td><td style="text-align:left;">mass</td></tr>
<tr><td>变量</td><td style="text-align:left;">最好能简单的说明该变量所代表的意义——而非用途</td><td style="text-align:left;">hourWage</td></tr>
<tr><td></td><td style="text-align:left;">变量名使用驼峰命名法，首字母小写</td><td style="text-align:left;">isPrime</td></tr>


<tr><td colspan="3"></td></tr>

 <tr><td></td><td style="text-align:left;"></td><td style="text-align:left;">N</td></tr>
<tr><td>常量</td><td style="text-align:left;">全部使用大写字母，以『_』分割</td><td style="text-align:left;">BOLTZMANN</td></tr>
<tr><td></td><td style="text-align:left;"></td><td style="text-align:left;">MAX_HEIGHT</td></tr>

<tr><td colspan="3"></td></tr>

 <tr><td></td><td style="text-align:left;">使用可以表达出该类意义的<i>名词</i></td><td style="text-align:left;">class Complex</td></tr>
<tr> <td>类</td><td style="text-align:left;">以大写字母起头，驼峰法命名</td><td style="text-align:left;">class Charge</td></tr>
<tr><td></td><td style="text-align:left;"></td><td style="text-align:left;">class PhoneNumber</td></tr>

<tr><td colspan="3"></td></tr>




<tr><td></td><td style="text-align:left;">使用一个可以表达出该方法在做什么的的<i>动词</i></td><td style="text-align:left;">move()</td></tr>
<tr><td>方法</td><td style="text-align:left;">使用小写字母起头，驼峰法命名</td><td style="text-align:left;">draw()</td></tr>
<tr><td></td><td style="text-align:left;"></td><td style="text-align:left;">enquene()</td></tr>
</tbody></table>

## 注释:

程序员通过添加注释的方式帮助读者理解程序是如何以及为何工作的。一般而言，代码被用来向电脑说明怎样去做，而注释则用来对程序员解释为什么程序可以完成工作。注释可以出现在现代程序任何一处留有空白的地方，而Java编译器会自动忽略掉所有注释
-   行注释：在每行结尾处使用『//』起头，本行内『//』后任何内容都将被视为注释
-   块注释：使用『/*』起头，『*/』收尾的一块文本，其中所有内容都将被视为注释
-   强调注释：这是一种特殊的块注释，用于提示此处需要注意
  
  ```
  /*---------------------------------------------------------
  *  这里是强调注释
  *  用于将注意力吸引到这里来
  *---------------------------------------------------------*/
  ```
-   Javadoc注释：Javadoc是以『/**』起头的特殊块注释，同城被用于自动生成类的API文档

以下为一些未获得广泛认可的规则，但遵守下面的规则往往会让你的程序变得更好
-   确保注释与代码的一致。当你修改完代码之后，及时更新注释里的内容
-   不要为写而写。一般而言，注释被用来描述你正在做的是什么或者为什么要去做，而不是去解释你是怎么做到的
  
  反例：
  
  ```
  i++;      //  让i的值增加一
  ```
-   如果注释可能会让你的代码含义变得模糊不清，最好重写一遍代码，让它们变得清晰易懂起来
-   在每个文件的开头加上下面的注释，简要说明程序的用途以及调用的方法
  
  示例
  
  ```
  /*----------------------------------------------------------------
  *  Author:        Kevin Wayne
  *  Written:       5/3/1997
  *  Last updated:  8/7/2006
  *
  *  Compilation:   javac HelloWorld.java
  *  Execution:     java HelloWorld
  *  
  *  Prints "Hello, World". By tradition, this is everyone's
  *  first program.
  *
  *  % java HelloWorld
  *  Hello, World
  *
  *----------------------------------------------------------------*/
  ```
## 空格：

程序员通过留白让他们的程序更方便阅读
-   每行只能有一条语句
-   把你的程序按逻辑关系用空行分割成程序块
-   使用一个空格将变量和操作符之间隔开，除非是想重点强调它
  
  例
  
  ```
  a*x + b
  ```
-   在关键字(_for_，_while_，_if_……)和括号间插入一个空格
-   用空格将for声明内的表达式隔开，比如：
  
  示例
  
  ```
  for(int i=0;i<N;i++)    vs.      for (int i = 0; i < N; i++)
  ```
-   在参数列表的每个逗号后面加上一个空格
-   在每条注释定界符『//』的后面加上空格
  
  示例
  
  ```
  //This comment has no space           //  This comment has two 
  //after the delimiter and is          //  spaces after the delimiter
  //difficult to read.                  //  and is easier to read.
  ```
-   不要在句末分号前加空格
-   不要在对象名『.』方法间加空格
-   如果代码间有联系，使用空行将他们与其他代码分开
-   使用空格将代码与代码之间对齐，提高它们的可读性
  
  示例
  
  ```
  int N      = Integer.parseInt(args[0]);      //  size of population
  int trials = Integer.parseInt(args[1]);      //  number of trials
  ```
## 缩进

程序员通过格式与缩进展现代码的结构，好的程序就像纲要，一眼就能看清楚
-   每行不要超过80个字
-   一行内不要有一条以上的语句
-   我们推荐使用3~4个空格来控制缩进
-   使用空格代替『\t』，现代编辑器已经可以做到使用空格自动替换『\t』(又称软制表)，硬制表符在远古时代用于节约内存(1个\t等于4个空格)，现在已经被抛弃掉了
-   当开始嵌套时，使用新的缩进来将他们与外围代码区分开
-   在使用大括号时，只使用K&R或者BSD/Allman风格的一种并坚持下去，不要混用
  
  示例
  
  ```
  //  K&R       风格的缩进                   
  public static void  main(String[] args) {
  System.out.println("Hello, World");
  }
  
  //  BSD-Allman 风格的缩进
  public static void main(String[] args)
  {
      System.out.println("Hello, World");
  }
  ```

原文链接:[http://introcs.cs.princeton.edu/java/11style/](http://introcs.cs.princeton.edu/java/11style/)
