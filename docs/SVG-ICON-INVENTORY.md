# SVG 图标类型清单

按图标类型去重；同一用途的实心/勾线版本合并，同一图形的重复使用不重复计数。字符图标、聊天折线、生命条、拖拽线、色板不计。保留但当前不使用的 radio/music/chat/globe/mail/BLIND 原图不计。

## 通用、文件与系统图标（30）

unfinished, river, network, volume, desktop, folder, settings, phone, user, power, headphones, text, grid, dots, calculator, zip, ethernet, wired, bluetooth, lock, sleep, restart, owner, trash, input, offline, update, help, wall, unknown

## RIVER 内部新增图形（5）

care, rive, canal, search (pixel), profile (pixel)

## 已改用 CSS：窗口控制（4，不计入 SVG）

minimize, maximize, restore, close

## 已改用 CSS：文件夹导航（5，不计入 SVG）

back, forward, up, new, search (outline)

## 文件视图（2）

list, details

## 其他（1）

bell

SVG 合计：38 类（已删除 .skch 叶片图标；窗口控制 4 类和文件夹导航 5 类已改用 CSS）。RIVER flow 计入通用 river，另外五种在 RIVER 内部新增组，因此顶部六种均已包含。

## 优先整理的跨界面通用图标（16）

窗口控制4：最小化、最大化、还原、关闭。文件对象4：文件夹、普通文档、ZIP、未知文件。导航5：后退、前进、上一级、新建、搜索。文件视图2：列表、详情。临时占位1：实心方块。特定系统面板和 RIVER 内部图标暂不列入本批。

CSS 基础图标由 home/css-icons.css 中 --icon-stroke 统一控制线宽。转换保留原按钮点击区域、20px 普通图标尺寸以及全局 20px 关闭标记。WALL 文件选择器复用同一套 CSS 导航。
