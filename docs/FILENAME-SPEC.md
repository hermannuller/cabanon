# Cabanon 文件名规范

**版本：** 建议稿 v0.1  
**原则：** 以 Windows 常规文件名限制为基础，兼顾 macOS / Linux 文件交换；采用 Unicode NFC 规范化与大小写不敏感的重名检查。

## 1. 禁止字符

| 字符或范围 | 说明 |
|---|---|
| `\` | 反斜杠，Windows 路径分隔符 |
| `/` | 正斜杠，Unix 路径分隔符 |
| `:` | 冒号 |
| `*` | 星号，常用通配符 |
| `?` | 半角问号，常用通配符 |
| `"` | 半角双引号 |
| `<` | 小于号 |
| `>` | 大于号 |
| `|` | 竖线 |
| U+0000–U+001F | ASCII 控制字符（包含换行、制表符等） |

其他常见标点（如 `! @ # $ % ^ & ( ) - _ + = [ ] { } ; ' , . ~`）允许；中文全角标点（如 `？！：、《》“”`）允许。

## 2. 特殊名称及首尾规则

- 禁止名称为 `.` 或 `..`。
- 首尾空格自动删除，保留名称中间的空格；末尾句点 `.` 仍禁止，提示并阻止提交。
- 禁止 Windows 设备保留名（不区分大小写），包括：
  - `CON`、`PRN`、`AUX`、`NUL`；
  - `COM1`–`COM9`、`LPT1`–`LPT9`；
  - `CONIN$`、`CONOUT$`；
  - `COM¹`、`COM²`、`COM³` 与 `LPT¹`、`LPT²`、`LPT³`。
- 带扩展名仍视为保留名，例如 `CON.txt` 不允许。

## 3. 编码与长度

| 项目 | 规则 |
|---|---|
| 字符集 | Unicode；存储或交换使用 UTF-8 |
| 规范化 | NFC |
| 单个文件名上限 | **255 UTF-8 字节**（包括扩展名；Cabanon 主动设置的保守上限） |
| 文件夹名 | 与文件名相同规则 |
| 大小写 | 显示时保留原样；重名时不区分大小写 |
| 完整路径 | 内部支持长路径，不主动采用旧式 `MAX_PATH` 260 字符限制；实际文件系统/API 限制仍须处理 |

## 4. 重名检查

同一文件夹内，先将名称规范化为 **NFC**，再以 Unicode **case folding** 生成比较键。比较键相同则认为重名。不同文件夹可有同名文件。

| 已存在 | 拟创建 | 结果 |
|---|---|---|
| `Book.txt` | `book.txt` | 冲突 |
| `Hello.txt` | `HELLO.TXT` | 冲突 |
| `café.txt`（组合形式） | `café.txt`（分解形式） | 冲突 |
| `Book.txt` | `Book (2).txt` | 允许 |
| `Book.txt` | `Book.pdf` | 允许 |

> 实现注意：Unicode case folding 不完全等同于 Windows、APFS 或 Linux 各文件系统原生的大小写比较规则。Cabanon 应使用固定版本的 Unicode 算法保持自身行为一致，并在实际写盘或导出时额外处理目标文件系统的冲突。

## 5. 新建、重命名与外部导入

- **新建 / 重命名：** 禁止非法字符与保留名称；遇到冲突时明确提示。
- **Unicode 规范化：** 可以自动转为 NFC，但显示名称应尽可能保持用户预期。
- **外部导入：** 尽可能读取原文件；若名称无法在 Cabanon 规则下直接使用，应提示改名或采用明确的替代名称，而非静默丢弃内容。
- **批量导入：** 可在冲突时追加 ` (2)`、` (3)`……，每次仍需重新验证字节长度、设备保留名和重名。
- **扩展名：** 保留 `.txt`、`.zip`、`.pdf` 等标准扩展名，不另造命名规则。

## 6. 示例

| 名称 | 是否允许 |
|---|---|
| `Hello World!.txt` | 允许 |
| `What Happened？.txt` | 允许（全角问号） |
| `What Happened?.txt` | 禁止（半角问号） |
| `Moby Dick (1851).txt` | 允许 |
| `设计稿—最终版.pdf` | 允许 |
| `A:B.txt` | 禁止 |
| `CON.txt` | 禁止 |
| `report.` | 禁止（句点结尾） |

## 7. 参考

- [Microsoft — Naming Files, Paths, and Namespaces](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file)
- [Unicode Standard Annex #15 — Unicode Normalization Forms](https://www.unicode.org/reports/tr15/)
- [Unicode Standard — Default Case Folding](https://www.unicode.org/versions/latest/core-spec/chapter-3/)

---

*状态：设计建议稿，供 Cabanon 原型实现与后续修订。*


## Implemented overrides and current storage boundary

- User-confirmed override: generated collision suffixes are `_1`, `_2`, etc.; parentheses typed by the user remain valid characters. Existing names are not migrated or deleted.
- User-confirmed override: empty/whitespace, pure dots and extension-only names are rejected with `please name it.` in the L9 popup. Left/right clicking anywhere dismisses it.
- Validation is shared by folder New, normal/linked rename, paragraph rename, WALL Save As and generated local/shared collision names. Invalid names leave existing content intact. NFC conversion and automatic leading/trailing space removal are applied before validation; interior spaces remain unchanged. Trailing dots are rejected. Tab, CR, LF, NEL and U+2028/U+2029 separators are rejected anywhere, including the edges, instead of being trimmed away.
- Unicode comparison is pinned to Unicode 15.0.0 default case folding. The 1530 mappings are generated from the matching Python Unicode database and checked into filename-rules.js. This is not a locale-dependent lowercasing approximation.
- Collision numbering preserves recognized compound extensions and rechecks the 255-byte limit; generated stems are shortened by Unicode code point if a suffix needs space.
- Cross-directory identical file names are supported. entry.name is a qualified location path; entry.id is the stable content owner. Content is persisted under IDs. Names collide only within the same parent directory using NFC/default case folding. Moving or renaming retains the ID; copying creates a new ID. Legacy content and references are migrated without changing visible leaf names, with a recoverable local snapshot before migration. See FILE-STORAGE.md.
- There is no general OS-file import endpoint in this prototype. Existing entries remain readable. Copy/move of an invalid legacy name prompts for correction and leaves source entries/content intact. This does not claim real ZIP import/export support.

Checks: tmp/filename-spec-check.cjs, tmp/file-base-name-check.cjs, tmp/underscore-copy-names-check.cjs and tmp/filename-storage-boundaries-check.cjs.

Storage regression checks: tmp/scoped-files-check.cjs, tmp/scoped-file-migration-check.cjs and tmp/scoped-file-editors-check.cjs.

Storage checks passed for distinct same-name files, ID retention on move/rename, independent copies, reload, delete/restore, legacy profile migration, recursive folder operations, editor links, tree navigation and account switching. The former global leaf-name restriction is removed.

User-confirmed whitespace rule: leading/trailing spaces (ASCII and Unicode space characters) are removed automatically. Tab U+0009, LF U+000A, CR U+000D, NEL U+0085, line separator U+2028 and paragraph separator U+2029 are never valid inside file/folder names. Check: tmp/filename-whitespace-check.cjs.
