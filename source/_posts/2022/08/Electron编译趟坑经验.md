---
title: Electron编译趟坑经验
date: 2022-08-16 13:00:00
tags: 趟坑
---

[稳部落](https://www.yaozeyuan.online/stablog/)作为 Electron 项目, 最大的难点不是项目开发, 而是`npm install`之后`C++`代码的二次编译. 每次重装电脑后都要折腾几天用于处理编译问题. 最近雪上加霜, 本地虽然折腾好了, 但线上 Github-CI 反而构建不出来产物, 非常痛苦.

这里记录下当时的处理方法

# 可能并不需要 rebuild

一般的建议是在 npm scripts 中添加这么一段`"postinstall": "electron-builder install-app-deps"`, 效果是在 npm 包安装完成后, 根据 npm 包中的源码和当前平台, 重新执行构建生成本平台的`.node`文件, 避免出现安装完成后项目无法运行的问题.

想法是好想法, 但这个操作基于一个前提: `我们安装的包, npm install之后真的没法在当前平台上运行`. 如果包作者本身已经帮我们执行了构建把`.node`文件添加到了发布产物中了呢? 那么`electron-builder`会先把作者提供的 vender 目录删除(重新构建前要先删除旧产物), 然后用`C++`开始构建...一定概率会出现构建失败的情况(例如在 github-ci 的 mac 环境上构建 sharp, 就会失败)

事实上, 作为软件作者, 我们其实知道安装了那些需要二次编译的 npm 包, 即使真的运行不了, 那么针对具体包执行重编译流程也足够了(假设是 sqlite3, 那么添加一行`"rebuild-sqlite3": "electron-rebuild -f -w sqlite3"`针对 sqlite3 单独构建足矣). 也不需要每次装完后都重新执行构建流程.

另一方面, 至少 sqlite3 和 sharp 的开发者, 都在发行版中提供了预编译版本. 只要保证(Electron 版本, Node 版本,操作系统版本)三者和作者提供的预编译包同时一致, 安装时直接 install 即可, 不需要二次编译. 根据我的经验, 在 Github-CI 的 mac 环境下二次编译 sharp, 首先会提示下边的报错: 找不到 vips/vips8 库.

```shell
warning: /Applications/Xcode_13.2.1.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/libtool: archive library: Release/nothing.a the table of contents is empty (no object file members in the library define global symbols)
../src/common.cc:24:10: fatal error: 'vips/vips8' file not found
#include <vips/vips8>
         ^~~~~~~~~~~~
1 error generated.
make: *** [Release/obj.target/sharp/src/common.o] Error 1
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2
gyp ERR! stack     at ChildProcess.onExit (/Users/runner/hostedtoolcache/node/14.20.0/x64/lib/node_modules/npm/node_modules/node-gyp/lib/build.js:194:23)
gyp ERR! stack     at ChildProcess.emit (events.js:400:28)
gyp ERR! stack     at Process.ChildProcess._handle.onexit (internal/child_process.js:285:12)
gyp ERR! System Darwin 20.6.0
gyp ERR! command "/Users/runner/hostedtoolcache/node/14.20.0/x64/bin/node" "/Users/runner/hostedtoolcache/node/14.20.0/x64/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
gyp ERR! cwd /Users/runner/work/stablog/stablog/node_modules/sharp
gyp ERR! node -v v14.20.0
gyp ERR! node-gyp -v v5.1.0
gyp ERR! not ok
error Command failed with exit code 1.
```

原因是 mac 环境上没有预装 vips 库. 但用 brew 强行安装后`brew install vips`, 编译是能编译过去了, 但不知道为什么 sharp 库二次编译时对 vips 执行了动态链接: 假设用户电脑上也装了 vips 并且有 vips 的动态链接库. 如果没装, 运行时就会报这个错:

```shell
Uncaught Exception:
Error:
Something went wrong installing the "sharp" module

dlopen(/Applications/ç¨³é¨è½.app/Contents/Resources/app/node_modules/sharp/build/Release/sharp-darwin-x64.node, 0x0001): Library not loaded: '/usr/local/opt/vips/lib/libvips-cpp.42.dylib'
Referenced from: '/Applications/ç¨³é¨è½.app/Contents/Resources/app/node_modules/sharp/build/Release/sharp-darwin-x64.node'
Reason: tried: '/usr/local/opt/vips/lib/libvips-cpp.42.dylib' (no such file), '/usr/local/lib/libvips-cpp.42.dylib' (no such file), '/usr/lib/libvips-cpp.42.dylib' (no such file)

Possible solutions:
- Install with verbose logging and look for errors: "npm install --ignore-scripts=false --foreground-scripts --verbose sharp"
- Install for the current darwin-x64 runtime: "npm install --platform=darwin --arch=x64 sharp"
- Consult the installation documentation: https://sharp.pixelplumbing.com/install
at Object.<anonymous> (/Applications/稳部落.app/Contents/Resources/app/node_modules/sharp/lib/sharp.js:34:9)
at Module._compile (node:internal/modules/cjs/loader:1118:14)
at Module._extensions..js (node:internal/modules/cjs/loader:1173:10)
at Module.load (node:internal/modules/cjs/loader:988:32)
at Module._load (node:internal/modules/cjs/loader:829:12)
at c._load (node:electron/js2c/asar_bundle:5:13343)
at Module.require (node:internal/modules/cjs/loader:1012:19)
at require (node:internal/modules/cjs/helpers:102:18)
at Object.<anonymous> (/Applications/稳部落.app/Contents/Resources/app/node_modules/sharp/lib/constructor.js:8:1)
at Module._compile (node:internal/modules/cjs/loader:1118:14)
at Module._extensions..js (node:internal/modules/cjs/loader:1173:10)
at Module.load (node:internal/modules/cjs/loader:988:32)
at Module._load (node:internal/modules/cjs/loader:829:12)
at c._load (node:electron/js2c/asar_bundle:5:13343)
at Module.require (node:internal/modules/cjs/loader:1012:19)
at require (node:internal/modules/cjs/helpers:102:18)
at Object.<anonymous> (/Applications/稳部落.app/Contents/Resources/app/**node_module**
```

作为一名并不了解 C++, 也不愿去魔改 sharp 源码的普通前端开发, 看到这种报错真是没办法了. 但解决方案也很简单: **yarn 安装完之后不要执行 postinstall 重新构建**, 直接利用作者帮忙预编译好的`.node`文件即可----反正 Electron 的发布打包原理也只是把当前系统上的代码简单压缩一下. 那么只要当前系统上能运行, 在用户电脑上也一定可以运行. 非要求同时支持 intel 和 m1 两种芯片的, 也无非是按[sharp 官网的介绍](https://sharp.pixelplumbing.com/install)在构建环境上安装完成后多执行一句`npm install --platform=darwin --arch=x64 sharp`和一句`npm rebuild --platform=darwin --arch=arm64 sharp`. 直接搞定, 何必挣扎(作为个人开发者, 有调试 C++构建的时间, 直接升级下 Electron 版本利用作者提供好的资源不好么)

sqlite3 同理.

简而言之: 能不二次构建, 就不二次构建. 实在需要二次构建又没有 C++开发资源, 考虑换包也比硬着头皮开调试好.

# 如果非要本地编译...

如果非要本地编译的话, 那么需要注意这么几点

1.  本地 node 版本必须和 Electron 内置的 node 版本保持一致, 否则本地 node6, 构建出来的`.node`文件也是为 node6 准备的, 结果 Electron 中内嵌的 Node 版本是 16(Electron-Node 对应关系可以在[发布记录](https://www.electronjs.org/releases/stable)中找到), NAPI 接口都不一样, 项目能运行起来才怪.
2.  对 windows 项目, 直接安装 Visual Studio . 微软官方也提供了中文版的[安装说明](https://docs.microsoft.com/zh-cn/visualstudio/install/install-visual-studio?view=vs-2022), 下一个 Visual Studio Installer, 安装社区版(免费)即可. 安装完成勾上 Node.js 开发, 会自动下载需要的依赖
    - ![VS依赖列表](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/007Yq4pTly1h5945ux8duj31hc0u0tk2.jpg)
3.  如果二次构建时提示找不到 VS 对应版本或 electron 的头文件下载的特别慢, 则创建一个 `.yarnrc`为 yarn 指路即可
    示例文件:
    ```shell
    # 源文件地址: https://github.com/YaoZeyuan/stablog/blob/master/.yarnrc
    # 构建时屏蔽镜像地址(阿里云镜像似乎未向 github 服务器提供服务, 导致构建速度异常慢)
    registry "https://registry.npmmirror.com"
    sass_binary_site "https://npmmirror.com/mirrors/node-sass/"
    electron_mirror "https://npmmirror.com/mirrors/electron/"
    SQLITE3_BINARY_SITE "https://npmmirror.com/mirrors/sqlite3"
    sharp_binary_host "https://npmmirror.com/mirrors/sharp"
    sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
    # 配置 msvs 版本----github action 上为 2022, 所以这里和 github 同步
    # 本地需要和 VS 中安装的版本保持一致, 目前是 2017
    msvs_version 2022
    ```

# 项目体积精简

稳部落发布利用[蓝奏云](https://pc.woozooo.com/)提供的免费 CDN 资源进行的发布(白嫖), 唯一的要求是要求构建包体积小于 100mb. 之前 Electron 版本低, 内置的基础 Chrome 体积小, 没有这方面的压力. 但为了使用 sharp 这样包提供的构建产物, 因此对 Electron 版本进行了升级, 代价就是一个预构建的`.node`文件就 14m, 让人非常崩溃, 因此需要手工精简体积, 优化文件.

这块相对比较简单, 就是剔除没有用的包, 将 moment 替换成 dayjs(压缩前体积由 3mb 压缩到 648kb). 此外就是在开始打包前删除项目中的构建产物(比如 sqlite3, 构建中间产物 17mb), 删除 map.js 文件.

获取项目中所有 map.js 文件的 uri 我还写了段脚本, 贴在这里, 回头可以改造一下, 用于在指定目录下寻找目标文件

```ts
// github地址: https://github.com/YaoZeyuan/stablog/blob/master/script/build.js
let path = require("path");
let fs = require("fs");

const Const_Root_Path = path.resolve(__dirname, "..");
const Const_Dist_Path = path.resolve(Const_Root_Path, "dist");
const Const_Client_Path = path.resolve(Const_Root_Path, "client");
const Const_Client_Dist_Path = path.resolve(Const_Client_Path, "dist");

function getAllJsMapUri(basePath) {
  let pathUri = path.resolve(basePath);
  let jsMapUriSet = new Set();
  let currentDirList = [pathUri];
  let nextDirList = [];
  while (currentDirList.length > 0) {
    for (currentPath of currentDirList) {
      let filenameList = fs.readdirSync(currentPath);
      for (let filename of filenameList) {
        let uri = path.resolve(currentPath, filename);
        let fsStat = fs.statSync(uri);
        if (fsStat.isDirectory()) {
          nextDirList.push(uri);
          continue;
        }
        if (fsStat.isFile()) {
          if (filename.endsWith(".js.map")) {
            jsMapUriSet.add(uri);
          }
        }
      }
    }
    currentDirList = nextDirList;
    nextDirList = [];
  }
  // 得到所有js.map文件的地址
  return [...jsMapUriSet.values()];
}
```

# 最后

祝好运~
