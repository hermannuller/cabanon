# 交互审计 — 2026-10-29

范围：指针命中区、拖拽与框选、右键菜单、窗口/分屏、段落视图、保存与关闭、手机手势。
方法：跑了 34 个交互相关回归脚本（`tmp/`），逐个对照断言、规范与实现定位原因。
本文只记录结论，**没有改动任何产品代码**。

判定标记：

- **真**：规范明确、实现不符，需要改代码。
- **待**：证据不足或有替代解释，需要人工复现后再定。
- **旧**：测试过期（改名/结构/大小写/旧扩展名），不是产品问题。
- **定**：行为变更需要你拍板，代码本身自洽。

## 一、结论摘要

34 个脚本里 **17 通过 / 17 失败**。失败中只有 **1 个高置信真实问题**（批量改名拖拽排序），
3 个需要人工确认，其余 13 个是测试过期或设计待定。

核心契约仍然成立：整行点击/右键命中区、右键框选五动作、选中行拖拽、Alt/Ctrl/FROM 选区形状、
标题改名、段落点击编辑与 Enter、无效文件名警告、窗口吸附、RIVER→TXT 入站拖拽。

## 二、通过的基线（可信部分）

| 检查 | 覆盖 |
| --- | --- |
| `full-height-file-hit-check` | 列表/详情/段落三种视图的整行高度命中带、右侧菜单区、拖拽/框选分界 |
| `file-hit-contract-check` | 点击/拖拽/内容三个命中函数的分离 |
| `right-file-actions-check` | 右键框选的五种动作 × 三种视图 + Shift 烧毁确认 |
| `selected-row-drag-unit` | 仅已选中行拥有整行拖拽原点，五种手势共用 |
| `selection-shapes-check` | Shift 剪切矩形、Alt 径向、FROM 套索、Ctrl 追加、修饰键释放 |
| `text-inbound-drag-check` | RIVER/rive/MARATHON → TXT，源保留、撤销、Escape、只读 |
| `header-drag-smoke` | 标题栏空白拖动、路径拖动、缩放边、浮动搜索、原生复制粘贴 |
| `folder-header-smoke` | 窄窗口标题控件、取消同步保留分组 |
| `paragraph-click-edit-check` | 基名点击插入光标、删除改名、后缀/图标整选 |
| `paragraph-enter-check` | Enter 始终在文件前换行、重复下移、取消 F2 |
| `title-rename-check` | 双击名称才改名、扩展名锁定、Escape、文件夹子树 |
| `warning-dismiss-check` | `please name it.` 的 L5 文本与任意点击关闭 |
| `snap-smoke` | 贴边/四角吸附、左右拖拽、预览、72px 预留、最大化还原 |
| `rename-syntax-audit` | 40 条改名语法，模型 + 真实键盘 + 提交 |
| `save-close-check` | TXT/HELP/WALL/MARATHON 关闭前保存、Enter 默认、取消保留 |
| `application-names-check` | 应用改名在手机/桌面/设置/标题的单源同步 |
| `new-names-thin-file-icons-check` | `new`/`new_1` 命名、复合扩展名、2px 描边、Save As 默认 |

## 三、真实问题候选

### 1. 批量改名右侧预览：拖图标不能排序（高，**真**）

- 现象：把 `OrderA.txt` 的图标拖到列表底部，松手后顺序仍是 A/B/C；规范要求变为 B/C/A。
  `tmp/rename-order-lasso-help-check.cjs` 两次单跑都稳定失败。
- 规范：AGENTS「Batch rename right-preview order changes only from left-dragging the file icon」。
- 定位：[home/file-tools.js](home/file-tools.js#L17-L19) 的 `pointerdown/pointermove/pointerup`。
  拖拽开始条件要求 `mark.parentElement === row`，移动时用 `others` 中点计算插入位，
  松手走 `finishOrderDrag()`。
- 可疑点：`pointerup` 在 `right` 上监听，但测试把指针移到列表最后一行下方（仍在窗口内）；
  另外 `update()` 是否用旧的 `sources` 重排需要确认。
- 影响：批量改名的核心交互之一失效，属于用户可感知的功能缺失。优先修。

### 2. WALL 保存后按钮没有回到 `saved`（中，**待**）

- 现象：`saved-button-state-check` 中 HELP 与 MARATHON 通过，WALL 在 `fontSize` 改成 30 并点保存后，
  按钮仍是 `save`（应为 `saved` 且禁用）。
- 规范：全局保存约定（AGENTS），`setFileSaveButton` + 真实文档签名。
- 可能原因：WALL 的字段是 `input` 事件实时应用（[home/wall.js](home/wall.js#L105-L108)），
  测试 `fill()` 后立刻断言，签名可能尚未刷新；也可能是保存成功路径没有重算签名。
- 下一步：手动复现（改字号 → 等 100ms → 点 save），若仍为 `save` 则是真 bug。

### 3. FROM 置顶文件的 `open` / `to desk` 无效果（中，**待/旧**）

- 现象：`from-pin-menus-check` 点 `open` 后没有 HELP 编辑器窗口；`context-dismiss-final`
  在 `toDesktop('notes.txt')` 后桌面上文件数为 0。
- 证据：该测试的 fixture 用的是旧扩展名 `/house/Pinned folder/Pinned.help!`
  （[tmp/from-pin-menus-check.cjs](tmp/from-pin-menus-check.cjs)），而 HELP 迁移会把 `.help!` 改成 `.help`；
  条目找不到时 `open`/`to desk` 自然无反应。
- 结论：fixture 过期的可能性较大；但 `toDesktop` 的 0 计数没有同类解释，需要人工点一遍确认。

### 4. 段落视图的图标列（已解决，选 B）

- 实测（Electron 里量的）：段落行 box 宽 90px = 名字 59px + 间隙 7px + 图标 24px，高 56px；
  行内没有列表视图那种右侧空白，`fileContentHit` 覆盖整行高度和图标/文字间隙。
- 旧测试在行内找不到「空白点」，就退到 `(right-2, top+2)` 点击。该点落在图标上方约 16px 的
  垂直留白里，当时按文本处理：出现插入光标、不选中。
- 决定（2026-10-29）：采用 B —— 只要 x 落在「名字右缘 → 图标右缘」之间（含 7px 间隙），
  无论 y 在 56px 行的哪个高度，都按点图标处理：整选该文件并进入可拖状态；点名字文字仍插入光标。
  这样图标上下的留白不会再把意图「点图标」的操作变成插光标。
- 实现：[home/paragraph-browser.js](home/paragraph-browser.js#L160) 的 `iconHit` 判定。
- 回归：`tmp/paragraph-icon-column-check.cjs`；`file-click-drag-split` 与 `selected-row-drag` 现已全绿。

### 5. 弹簧打开偶发失败（中，**待**）

- `gesture-revision-check` 本次左侧/右侧的「1 秒悬停展开嵌套文件夹」都 PASS，
  但在后续段落报 `Cannot read properties of undefined (reading 'x')`（找不到图标）。
- 可能是第二次悬停时窗口已切换、坐标失效；需要单跑 + 录屏确认是产品还是测试。

### 6. 滚动条端点留距 64 vs 8（低，**待**）

- `scrollbar-endpoints-smoke` 断言窗口右下端点留距 8px，实际量到 64。
- 需要视觉确认：可能测试的缩放/DPR 假设过期，也可能滚动条端点真的变宽了。

## 四、测试过期（不要改代码）

| 脚本 | 原因 |
| --- | --- |
| `drag-presentation-smoke` | 等待 `showDragPresentation`，该函数已并入 `CabanonDragFeedback` |
| `drag-feedback-smoke` | 找 `#forbidden-drag-pointer`，无效拖拽现在改为 `Can't` 文案提示 |
| `dock-right-close-check` | 等 `app:BLIND` 任务栏按钮，BLIND 已改名 LINE |
| `task-close-all-confirm-check` | 找大写 `NO`，且 DOCK 关闭全部已改为无确认（FOLDER-SPLIT 明确） |
| `on-off-standard-test` | 在 `row` 里找 `.setting-switch-gap`，部分开关不是 `settingTextToggle` 结构 |
| `menu-bounds-smoke` | 假设 `#context-menu` 常驻，实际按需创建 |
| `river-check` / `self-drop-check` / `file-paragraph-drag-check` | 没有关闭 welcome 遮罩，点击被挡住（真实用户点击会消失） |
| `home-smoke` | 期望 42 个桌面条目，当前默认布局不同 |
| `file-operations-regression` | 1500 文件粘贴场景的计数假设过期 |
| `file-batch-tools-check` | 期望 Info 里的 `≈` 标记，表格已不渲染 |
| `filename-spec-check` | 找 `[data-rename]`，改名入口已换 |
| `phone-prototype-check` | 期望首个应用 MARATHON，实际 RIVER |
| `saved-button-state-check` | HELP/MARATHON 正常，仅 WALL 需按第 2 条确认 |

## 五、设计待定（需要你一句话）

1. **手机首屏第一个应用**：RIVER 还是 MARATHON？
2. **Info 表格的 `≈` 标记**是否保留。
3. **welcome 遮罩**：真实交互是「任意指针/键盘关闭」，自动化脚本不点击所以看起来像卡住；确认保持现状即可。

## 六、建议顺序

1. 修批量改名拖拽排序（唯一高置信真实问题，约 30–60 分钟含回归）。
2. 手动复现 WALL 保存态，确定是时序还是 bug。
3. 手动点一遍 FROM 的 `open` 与 `to desk`，必要时修 fixture 或代码。
4. 给出「段落行空白区」的取舍，再动命中区相关代码。
5. 最后批量修测试里的旧名称/旧扩展名/大写 NO，让失败数回落。

复现命令：

```sh
node tools/run-checks.cjs --all rename-order-lasso-help saved-button-state from-pin-menus context-dismiss-final gesture-revision
node tools/run-checks.cjs --all selected-row-drag file-click-drag-split scrollbar-endpoints
```
