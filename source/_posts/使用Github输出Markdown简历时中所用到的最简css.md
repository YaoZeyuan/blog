---
title: 使用Github输出Markdown简历时中所用到的最简css
date: 2016-06-25 17:48:01
tags:
---

``` CSS
/* css from github */

html {
    font-family: sans-serif;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%
}

body {
    margin: 0
}

article {
    display: block
}

a {
    background-color: transparent
}

a:hover {
    outline: 0
}

h1 {
    font-size: 2em;
    margin: .67em 0
}

* {
    box-sizing: border-box
}

body {
    font: 13px/1.4 Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    color: #333;
    background-color: #f6f5f5
}

a {
    color: #4078c0;
    text-decoration: none
}

a:hover {
    text-decoration: underline
}

h1,
h2 {
    margin-top: 15px;
    margin-bottom: 15px;
    line-height: 1.1
}

h1 {
    font-size: 30px
}

h2 {
    font-size: 21px
}

ol,
ul {
    padding: 0;
    margin-top: 0;
    margin-bottom: 0
}

ul ol {
    list-style-type: decimal
}

ul ul ol {
    list-style-type: decimal
}

.octicon {
    font: normal normal normal 16px/1 octicons;
    display: inline-block;
    text-decoration: none;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none
}

.octicon-link:before {
    content: '\f05c';
}

.markdown-body {
    font-family: "Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 16px;
    line-height: 1.6;
    word-wrap: break-word
}

.markdown-body:before {
    display: table;
    content: ""
}

.markdown-body:after {
    display: table;
    clear: both;
    content: ""
}

.markdown-body>:first-child {
    margin-top: 0!important
}

.markdown-body>:last-child {
    margin-bottom: 0!important
}

.markdown-body a:not([href]) {
    color: inherit;
    text-decoration: none
}

.markdown-body .anchor {
    display: inline-block;
    padding-right: 2px;
    margin-left: -18px
}

.markdown-body .anchor:focus {
    outline: 0
}

.markdown-body h1,
.markdown-body h2,
h6 {
    margin-top: 0.5em;
    margin-bottom: 16px;
    font-weight: 700;
    line-height: 1.4
}

.markdown-body h1 .octicon-link,
.markdown-body h2 .octicon-link {
    color: #000;
    vertical-align: middle;
    visibility: hidden
}

.markdown-body h1:hover .anchor,
.markdown-body h2:hover .anchor,
.markdown-body h3:hover .anchor,
.markdown-body h4:hover .anchor,
.markdown-body h5:hover .anchor,
.markdown-body h6:hover .anchor {
    text-decoration: none
}

.markdown-body h1:hover .anchor .octicon-link,
.markdown-body h2:hover .anchor .octicon-link,
.markdown-body h3:hover .anchor .octicon-link,
.markdown-body h4:hover .anchor .octicon-link,
.markdown-body h5:hover .anchor .octicon-link,
.markdown-body h6:hover .anchor .octicon-link {
    visibility: visible
}

.markdown-body h1 {
    padding-bottom: .3em;
    font-size: 2.25em;
    line-height: 1.2;
    border-bottom: 1px solid #eee
}

.markdown-body h1 .anchor {
    line-height: 1
}

.markdown-body h2 {
    padding-bottom: .3em;
    font-size: 1.75em;
    line-height: 1.225;
    border-bottom: 1px solid #eee
}

.markdown-body h2 .anchor {
    line-height: 1
}

.markdown-body ol,
.markdown-body p,
.markdown-body ul {
    margin-top: 0;
    margin-bottom: 4px
}

.markdown-body ol,
.markdown-body ul {
    padding-left: 2em
}

.markdown-body ul ol,
.markdown-body ul ul {
    margin-top: 0;
    margin-bottom: 0
}

.markdown-body li>p {
    margin-top: 4px
}

.markdown-body {
    word-wrap: normal
}

body {
    word-wrap: break-word
}

.octicon {
    color: inherit;
    opacity: 1
}

p {
    margin: 0
}

.octicon {
    color: inherit
}

#readme {
    max-width: 800px;
    margin: 5% auto;
    padding: 2em;
    background-color: #FFF;
    border-radius: 6px
}

@media screen {
    #readme {
border: 1px solid #DDD;
box-shadow: 0 1px 15px rgba(0, 0, 0, .15);
    }
}

@media print {
    #readme {
margin: 0 auto;
padding: 0;
    }
}
```
