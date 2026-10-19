# Cabanon 当前颜色与排版清单

更新：2026-10-14。适用于当前桌面原型。此清单记录现有设计与实现，不修改界面。

## 颜色

| 编号 | 色块 | 色值 | 名称 | 当前用途 |
| --- | --- | --- | --- | --- |
| L1 | ![L1](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L1.svg) | `#0e100f` | 最深背景 | 桌面、代码区；拖拽目标提示的深色文字 |
| L2 | ![L2](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L2.svg) | `#1d1d1b` | 容器 / 面板 | from、窗口内容区、导航；未选中窗口的顶部与内容统一背景 |
| L3 | ![L3](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L3.svg) | `#282828` | 交互面 | 菜单、输入框、选中块、悬停底色、已Pin图标方块、滚动条及进度条默认颜色 |
| L4 | ![L4](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L4.svg) | `#414342` | 边界 / 弱结构 | 分隔线、边框；滚动条与进度条悬停 / 拖动颜色 |
| L5 | ![L5](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L5.svg) | `#fefbe3` | 暖黄亮文字 | 主要文字、悬停icon、右键期间的icon、当前窗口指示横线；有效拖拽提示背景 |
| L6 | ![L6](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L6.svg) | `#6d6d62` | 暗文字 | 次级信息、未选中项目；非当前窗口原L5文字与icon映射到此色 |
| L7 | ![L7](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L7.svg) | `#10a53b` | 绿色强调 | 当前代码文字、同步标识；可选文件标记色 |
| L7.5 | ![L7.5](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L7.5.svg) | `#223c26` | 深绿色 | 非当前代码窗口的代码文字 |
| L8 | ![L8](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L8.svg) | `#ff880a` | 橙色强调 | 当前代码窗口行号、计算器等号；可选文件标记色 |
| L8.5 | ![L8.5](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L8.5.svg) | `#ab5e0c` | 深橙色 | 非当前代码窗口行号 |
| L9 | ![L9](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L9.svg) | `#c5173e` | 红色警示 | 错误代码、Burn、禁止拖拽符号、关闭按钮警示底色；可选文件标记色 |
| L10* | ![L10](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L10.svg) | `#ffb3c1` | 粉色标记 | 文件 / 文件夹标记色 |
| L11* | ![L11](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L11.svg) | `#08c5eb` | 青色标记 | 文件 / 文件夹标记色 |
| L12* | ![L12](C:/Users/cgwma/Documents/ChatGPT/cabanon-desktop/docs/color-swatches/L12.svg) | `#999efa` | 淡紫色标记 | 文件 / 文件夹标记色 |

\* 三个新增标记色之前没有L编号；本清单暂记为L10、L11、L12，供统一引用，色值不变。

标记色共六种：L7、L8、L9、L10、L11、L12。标记改变整个icon的颜色；悬停及右键菜单期间统一显示L5，结束后恢复标记色。取消颜色后恢复主题默认值。

### 透明度与状态

| 场景 | 颜色 / 状态 |
| --- | --- |
| 窗口贴边预览 | L3，50%不透明度，无边框；位置与尺寸动画100ms |
| 框选内部 | L4，约26.7%不透明度，即`#41434244` |
| 框选边界 | L5，1px |
| 非当前普通窗口 | 顶部与内容均L2；L5文字 / icon变L6；不使用透明度滤镜 |
| 非当前代码窗口 | L7→L7.5，L8→L8.5；错误仍L9 |
| 有效拖拽目标 | 提示L5底、L1文字；目标文件夹 / ZIP为L5剪影 |

## 字体

| 字体 | 使用范围 | 当前字重 |
| --- | --- | --- |
| JetBrains Mono | 系统UI、软件名、菜单、代码、行号、导航、状态和计算器 | Regular 400；大字widget使用Bold 700；同步小标识也使用700 |
| Inter | 文件名、文件夹名、文件正文 | 主要为Regular 400 |
| 思源黑体 Source Han Sans SC | 中文字形补充 | 当前随项目附带Regular |

JetBrains Mono、Inter为主字体；中文由思源黑体补充。系统不使用字体文件以外的图片构成普通UI。

## 两档主要UI标准

| 档位 | 字号 | 排列行高 / 行距 | 字体与字重 | 典型使用 |
| --- | --- | --- | --- | --- |
| 大字 | 36px | 56px | JetBrains Mono；from软件与widget为Bold 700 | 时间、气温、from常用软件 |
| 小字 | 14px | 56px | 系统文字JetBrains Mono；文件名Inter；Regular 400 | 桌面文件、HOUSE列表、搜索结果、全部软件、from常用文件夹 |

这里的56px是**每一项占据的排列高度 / 相邻行起点间距**。14px小字在56px项目里采用28px文字行高并居中，不意味着字形本身高度56px。

from常用软件采用36px文字、56px行高，对应56px项目。

## 紧凑区域与例外

| 档位 | 字号 | 文字行高 | 字体与字重 | 应用位置 / 说明 |
| --- | --- | --- | --- | --- |
| 紧凑系统文字 | 14px | 28px | JetBrains Mono Regular 400 | 代码文字与行号、Ctrl目录树、Alt快捷导航、计算器运算历史及同样式备注。代码自动折行不新增逻辑行号；行号L8 / L8.5 |
| 紧凑文件文字 | 14px | 28px | Inter Regular 400 | ZIP内部清单、示例文件正文及同样式备注。ZIP每项28px、icon仍24px；正文连续排版 |
| 紧凑小字 | 14px | 28px | JetBrains Mono或Inter Regular 400，按用途区分 | 音量百分比、输出设备、No files found.等普通备注；系统文字JetBrains Mono，文件内容Inter。独立备注不强制占56px |
| 小备注 | 12px | 18px | JetBrains Mono Regular 400 | widget日期 / 天气说明、Owner / Guest身份信息。widget备注每条仍占56px显示区 |
| 两行入口状态 | 14px | 28px | JetBrains Mono Regular 400 | 输入法与时间，两行共56px；底部距离边界不变 |
| 紧凑双行文字 / 符号 | 16px | 18px | JetBrains Mono Regular 400 | 排序A/Z、new/old、often/rare；颜色菜单取消×，其按钮高20px |
| 小标题与字符音量条 | 14px | 28px | JetBrains Mono Regular 400 | h2分区文字改为紧凑小字；音量▓/░，20个字符、每格5%。Setting本身只显示普通小字标题 |
| 排序箭头 | 24px | 28px | JetBrains Mono Regular 400 | 排序按钮的↓文本符号，按钮高度及垂直居中不变 |
| 计算器按键 | 24px | 56px | JetBrains Mono Regular 400 | 计算器按键，每排56px，无额外纵向间距 |
| 大字常规字重 | 36px | 56px | JetBrains Mono Regular 400 | 计算器结果右对齐；窗口内容大标题 |
| 大字加粗 | 36px | 56px | JetBrains Mono Bold 700 | from顶部widget主信息；同“两档主要UI标准”的大字档 |
| 状态大标题 | 36px | 56px | JetBrains Mono Bold 700 | 电源全屏状态标题；设置文字另统一为14px / 28px |
| 小同步符号 | 14px | 28px | JetBrains Mono Regular 400 | 文件夹icon中央的=，颜色L5；按用户回复采用28px行距 |

旧CSS中残留的被覆盖字号不视为当前有效规范。上表区分实际使用的文字尺寸与布局行高，后续可以继续统一整理。

根据修改.xlsx及后续确认，文字字号共5种：12、14、16、24、36px。行距/行高共3种：18、26、56px。SVG icon尺寸不计入文字字号。

## icon及控件尺寸（不是文字字号）

| 用途 | 当前尺寸 |
| --- | --- |
| 文件、文件夹、全部软件icon | 24×24px |
| from大字软件icon | 32×32px |
| 左侧系统icon | 通常28×28px，选择区域56px高 |
| 设备菜单小icon | 20×20px |
| 窗口标题icon | 18×18px |
| 普通窗口控制符号 | 20×20px；按钮42×40px |
| 代码状态窗口控制符号 | 14×14px；按钮42×28px，只避让首行 |
| 快捷方式实心路牌 | 16×14px |
| 禁止拖拽红色线条符号 | 33.6×33.6px，相对28px放大20% |
| icon标准描边 | 1.8px；软件剪影不描边 |
| 已Pin状态底方块 | 以icon为中心，边长等于当前项目行高，通常56px；不在from快捷入口显示 |
| 滚动条 / 进度条 | 宽或高8px；两端留距8px；L3→L4 |

## 相关文件

- 配色基础：CABANON-THEME.md
- 界面约定：HOME-SPEC.md
- 全局铁律：UI-RULES.md
- icon制作与替换：home/icons/README.md
