---
title: webpack 简明教程----以vue npm run build流程为例
date: 2018-04-15 17:48:01
tags:
---

# webpack 简明教程----以 vue npm run build 流程为例

## webpack 的执行过程

在学习 webpack 配置的时候, 我们会执拗于 webpack 一个个的配置项, 把 webpack 配置搞成了面向运气调参. 但实际上, 如果我们从 webpack 的执行过程开始的话, webpack 其实是很简单的.

webpack 的执行过程主要是这么几步:

![webpack打包流程](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/6ff418c7ly1fqcoph40ioj20kx0lf0uj.jpg)

1.  确定配置参数, 把`webpack.base.conf.js`和`webpack.prod.conf.js`合并到一起, 作为参数启动 webpack()方法
2.  根据配置里的`entry`, 找到所有的入口文件
3.  从入口文件出发, 查找依赖并调用`module.rule`里配置的`loader`进行加载, 把资源转换成对应的 js 资源, 比如, 利用`url-loader`把图片转成 base64, 利用`type-script-loader`把`TypeScript`代码转换成标准的 js 代码.
4.  `TypeScript`代码转成 js 后, 可能会产生新的依赖(ts 里不可识别的 import 被转成了可识别的 js 的 import), 所以需要递归的执行这种转换, 直到所有依赖全部转换为 js 对象. 这样每一个入口配置都对应一个 js 对象, webpack 的工作基本完成
5.  按照`output`里的配置, 将 js 对象输出为文件(静态资源或图片文件)
6.  执行完毕

需要注意的是在这期间 webpack 主进程只进行了加载, 输出工作, **没有做其他的优化**. 我们所看到的优化其实是 webpack 在打包过程中触发各种生命周期事件, 唤起`plugin`(UglifyJs, ExtractText, CommonsChunk)对内容进行处理之后的结果.

知道了 webpack 的执行流程, 再看 vue 的 build 流程就清楚多了

## vue build, 从项目初始化到 webpack 构建

我们来从头捋一下 vue 执行`npm run build`的整个流程

首先, `npm run build` 对应的是执行 package.json 里`scripts`项中配置的命令, 也就是`node build/build.js`

![npm run build](https://mirror-4-web.bookflaneur.cn/https://tva1.sinaimg.cn/large/6ff418c7ly1fqcow6xy3fj20dw09lwew.jpg)

命令实际执行的是`build/build.js`这个文件, 我们来看一下文件的内容

```javascript
"use strict";
// 检查node & npm版本
require("./check-versions")();

// 设定环境变量
process.env.NODE_ENV = "production";

// 开始导入包
const ora = require("ora"); // 进度条, 准确的说是编译的时候来回转的那根竖线
const rm = require("rimraf"); // 专业进行删除操作(rm命令)
const path = require("path"); // node内置包, 用于合成文件实际路径
const chalk = require("chalk"); // 输出彩色的log
const webpack = require("webpack"); // webpack实例
const config = require("../config"); // 用户配置
const webpackConfig = require("./webpack.prod.conf"); // webpack打包配置

// 进度条转起来
const spinner = ora("building for production...");
spinner.start();

// 清空旧的编译结果
// 利用config.build.assetsRoot和config.build.assetsSubDirectory合成输出的静态文件路径
// 这里直接将过去输出的的静态文件夹直接删掉, 简单粗暴
rm(
  path.join(config.build.assetsRoot, config.build.assetsSubDirectory),
  (err) => {
    if (err) throw err; // 删除失败直接报error

    // *******************************
    //
    // 重点来了 =>
    //
    // *******************************
    // 执行webpack命令
    webpack(webpackConfig, (err, stats) => {
      // webpack打包完毕, 回调该函数
      spinner.stop(); // 停止进度条
      if (err) throw err;
      // 输出打包结果
      //
      process.stdout.write(
        stats.toString({
          colors: true,
          modules: false,
          children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
          chunks: false,
          chunkModules: false,
        }) + "\n\n"
      );

      if (stats.hasErrors()) {
        // 打包故障, 输出 **红色的**  Build failed with errors  直接退出
        console.log(chalk.red("  Build failed with errors.\n"));
        process.exit(1);
      }

      // 没有问题, 输出**黄色**的 Build complete 字样
      console.log(chalk.cyan("  Build complete.\n"));
      console.log(
        chalk.yellow(
          "  Tip: built files are meant to be served over an HTTP server.\n" +
            "  Opening index.html over file:// won't work.\n"
        )
      );
    });
  }
);
```

从`build.js`的注释里不难看出, 这个文件只做了两件事:

1.  删除旧的编译结果
2.  再进行一次编译操作

编译操作里唯一的变量就是 webpack 配置项. 然后我们来看一下 webpack 的配置文件内容:

`webpack.base.conf.js` =>

```javascript
"use strict";
const path = require("path");
const utils = require("./utils");
const config = require("../config");
const vueLoaderConfig = require("./vue-loader.conf");

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: "eslint-loader",
  enforce: "pre",
  include: [resolve("src"), resolve("test")],
  options: {
    formatter: require("eslint-friendly-formatter"),
    emitWarning: !config.dev.showEslintErrorsInOverlay,
  },
});

module.exports = {
  // 指定项目根路径
  context: path.resolve(__dirname, "../"),
  // 指定Entry入口
  // 如果Entry是一个key => value对象, 那么key对应输出的文件名(xxx.js), value 对应真实的入口文件地址
  // 这个特性在将脚手架改造成多页面项目时非常有用
  entry: {
    app: "./src/main.js",
  },
  // 指定输出配置
  output: {
    // 本地编译结果输出路径
    path: config.build.assetsRoot,
    // 输出结果文件名, 支持[name], [id], [hash], [chunkhash]等占位符, 详见<深入浅出webpack · 第二章第二节output>, https://webpack.wuhaolin.cn/2%E9%85%8D%E7%BD%AE/2-2Output.html
    filename: "[name].js",
    // 静态文件资源所在的域名. 例如, 配置为https://www.baidu.com, 则项目里的<img src='./xxxx.png'>就会变成 <img src='https://www.baidu.com/xxxx.png'>
    // 同样, 详见<深入浅出webpack · 第二章第二节output>, https://webpack.wuhaolin.cn/2%E9%85%8D%E7%BD%AE/2-2Output.html
    publicPath:
      process.env.NODE_ENV === "production"
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath,
  },
  // 配置解析依赖时的规则
  resolve: {
    // 只解析以下后缀名的入口文件
    extensions: [".js", ".vue", ".json"],
    // 路径别名, 避免import 的时候写一长串路径
    alias: {
      vue$: "vue/dist/vue.esm.js",
      "@": resolve("src"),
    },
  },
  module: {
    // *******************************
    //
    // 重要 =>
    //
    // *******************************
    // loader配置
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        // 调用该loader 对文件名符合正则规则的文件进行处理
        test: /\.vue$/,
        // loader名, 需要提前npm install好
        loader: "vue-loader",
        // loader配置
        options: vueLoaderConfig,
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [
          resolve("src"),
          resolve("test"),
          resolve("node_modules/webpack-dev-server/client"),
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        options: {
          // loader配置, 对与10000b以下的文件, 直接转成base64
          limit: 10000,
          // 10000b以上的文件, 以下列指定格式输出到对应路径下
          name: utils.assetsPath("img/[name].[hash:7].[ext]"),
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: utils.assetsPath("media/[name].[hash:7].[ext]"),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: utils.assetsPath("fonts/[name].[hash:7].[ext]"),
        },
      },
    ],
  },
  // node配置, 不用管
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: "empty",
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty",
  },
};
```

`webpack.prod.conf.js` =>

```javascript
"use strict";
const path = require("path");
const utils = require("./utils");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const env = require("../config/prod.env");

// 合并base配置和prod配置,
const webpackConfig = merge(baseWebpackConfig, {
  module: {
    // prod环境下多加一个css处理器
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true,
    }),
  },
  // source map生成的方式.webpack打包出来的是一整个js文件, debug的时候很不方便, 因此需要额外输出一份source-map来帮助浏览器正确展示js内容, 一般来说, 线上使用false , 测试环境使用 `#cheap-module-source-map`
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  // 覆盖base里的output配置
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath("js/[name].[chunkhash].js"),
    chunkFilename: utils.assetsPath("js/[id].[chunkhash].js"),
  },
  plugins: [
    // 定义环境
    // https://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      "process.env": env,
    }),
    // 压缩js代码
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
        },
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true,
    }),
    // 将css独立出来
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath("css/[name].[contenthash].css"),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    // 压缩css
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true },
    }),
    // 输出html模板, 方便调试(似乎很多公司直接就把这个文件当入口地址用了= =)
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: "index.html",
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: "dependency",
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // 提取多个入口的公共部分
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks(module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, "../node_modules")) === 0
        );
      },
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: "manifest",
      minChunks: Infinity,
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: "app",
      async: "vendor-async",
      children: true,
      minChunks: 3,
    }),

    // 处理不需要参与编译的静态文件(比如百度统计, 谷歌统计的js代码)
    // 执行方式很粗暴, 直接把from路径下的文件直接拷贝到to里, 搞定
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "../static"),
        to: config.build.assetsSubDirectory,
        ignore: [".*"],
      },
    ]),
  ],
});

// 如果在配置里指定需要gzip一下的话, 在这里执行压缩操作
// 不过我司一般都是把压缩的工作直接交给CDN完事←_←
if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require("compression-webpack-plugin");

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: new RegExp(
        "\\.(" + config.build.productionGzipExtensions.join("|") + ")$"
      ),
      threshold: 10240,
      minRatio: 0.8,
    })
  );
}

// 如果编译的时候加上了 --report参数, 会打开一个可视化的模块体积分析页面, 展示各个模块在最终打包结果中所占的体积大小
if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin =
    require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
```

结束. webpack 的打包其实就这些东西. 在下一篇文章里, 我们会借助修改配置文件, 为脚手架添加以下功能

1.  添加 vue 多页面支持, 支持编译输出多个项目
    1.  [debug 配置]允许不同开发者在本地调试时只编译自己的项目, 以加快本地调试速度
2.  根据项目 tag(hg/git)自动生成 map.json, 方便进行线上版本控制
3.  根据环境自动为静态资源指定不同的 cdn 地址
4.  支持自定义本地 mockServer 域名和转发规则
    1.  [debug 配置]允许不同开发者通过 debug 配置不同的 mock 域名
5.  axios 支持 jsonp

## 参考资料

1.  [深入浅出 webpack](https://webpack.wuhaolin.cn), 建议重点看下 第五章第一节 webpack 编译流程, 第二章 webpack 配置详解, 这篇文章其实就是对这两部分的概括
2.  [vue 多页面](https://github.com/YaoZeyuan/vue-multi-page), 笔者在 vue 脚手架的基础上, 通过修改 webpack 配置实现的多页面版的 vue 项目
