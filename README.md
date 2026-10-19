# Cabanon

Cabanon 是一个使用 Electron 构建的桌面环境原型。主要界面、应用和交互代码位于 `home/`。

目前包含文件夹与虚拟文件管理、TXT 纯文本编辑器、BERLIN 壁纸编辑器、HELP 文档，以及 RIVER、rive、CANAL 和 MARATHON 的原型功能。尚未完成的应用保留占位入口。

## 启动

安装 Node.js 后，在项目目录运行：

```sh
cd home
npm install
npm start
```

Windows 上完成依赖安装后，也可双击 `home/start.cmd`。程序使用 PowerShell 辅助处理 Windows 键。

## 目录

- `home/`：Electron 应用、界面、字体和图标。
- `docs/`：功能规范、交互约定和界面参考。
- 根目录的 Markdown 文件：设计方案与规范。
- `paragraph-explorer/`：早期独立段落文件管理器原型。

## 数据

虚拟文件、账户设置和草稿保存在本机应用存储中，与源码仓库分开。上传代码不会备份这些个人数据。Windows 默认数据目录为 `%APPDATA%\Cabanon OS Prototype`。

RIVER、rive 等交互目前属于本机原型，不代表已经接入真实在线服务。当前项目仍在开发中。
