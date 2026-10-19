# Cabanon icon 制作与替换

## 格式

- 使用SVG矢量文件，不用PNG/JPG。
- 统一画板 `viewBox="0 0 32 32"`，图形放在约2至30的安全范围内。不要带画板背景。
- icon实际显示24px或32px；小状态icon可为14/20px，保持小尺寸可辨认。
- 勾线版本：`fill="none" stroke="currentColor" stroke-width="1.8"`，直角与现有风格一致。
- 剪影版本：`fill="currentColor" stroke="none"`。内部孔洞可用 `fill-rule="evenodd"`。
- 所有颜色使用currentColor，不写死RGB色值。主题、标记、悬停及未选中状态由OS控制。
- 不包含文字、字体依赖、位图、外链、脚本、动画或背景矩形。文字标志请转矢量轮廓。
- SVG根元素不用设置class、固定width/height；OS统一控制显示尺寸。

## 两套图形

- `outline/名称.svg`：文件、文件夹及系统操作的勾线版本。
- `solid/名称.svg`：软件的剪影版本；文件夹和ZIP作为拖拽目标时也使用此版本。
- 同一种含义两套版本应保持相同位置、比例与视觉中心。

## 现有icon名称

核心：folder、text、grid、mail、chat、headphones、radio、calculator、music、leaf、globe、user、zip。

系统及状态：network、volume、desktop、settings、phone、power、dots、ethernet、wired、bluetooth、lock、sleep、restart、owner、help、trash、input、offline、update。

先优先制作folder、zip的outline/solid对照，以及上述13个核心软件icon的solid版。其余系统icon通常只需outline版。

快捷方式路牌、同步↔、排序文字、窗口控制符号由OS另行绘制，本目录当前不替换这些附加标识。

## 替换步骤

1. 把SVG放进相应outline或solid目录。
2. 修改本目录manifest.json，例如：

```json
{
  "folder.outline": "outline/folder.svg",
  "folder.solid": "solid/folder.svg",
  "zip.outline": "outline/zip.svg",
  "zip.solid": "solid/zip.svg",
  "music.solid": "solid/music.svg"
}
```

3. 完全关闭HOME，再重新启动。未登记或缺失的图形沿用内置icon。

项目启动时通过icon-assets.js读取manifest，无需修改每个界面。manifest中的名称必须使用上述内部ID；例如CALC使用calculator，COLORS使用music，BLIND使用globe。
