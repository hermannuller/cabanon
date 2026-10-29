# Shared icon references

PC and Phone load the same registry: home/icons/manifest.json → home/icon-assets.js → icon(name) / appIcon(glyph).

- PC FROM software, app search, titles and DOCK resolve appIcon through canonical app identity.
- Phone icon preview and app search resolve the same appIcon. Phone home normally displays text labels.
- File glyphs and system controls resolve icon(name). House uses house; ordinary folders use folder.
- PC power and Phone status battery resolve the same battery.svg (power is an alias). The power action is unchanged.
- Volume uses volume or mute according to prefs.volume; state refresh updates the PC control.
- Both outline and solid keys reference the same imported asset for each new OS icon.
- SVG classes are converted to local inline styles; ink inherits currentColor. No Illustrator global class collisions.
- Delete, burn, signal and the original supplied power.svg are retained as resources. Existing text-only actions do not gain new icon controls.
- Weather icons use home/weather-icons.js, shared by home/info-widgets.js for PC and Phone.

| Icon key | Shared asset |
| --- | --- |
| `river` | `home/icons/river.svg` |
| `blind` | `home/icons/blind-icon.svg` |
| `marathon` | `home/icons/marathon-icon.svg` |
| `wall` | `home/icons/wall-file-icon.svg` |
| `grid` | `home/icons/tsv-file-icon.svg` |
| `ur` | `home/icons/ur-icon.svg` |
| `where` | `home/icons/where-icon.svg` |
| `help-app` | `home/icons/help-animated.svg` |
| `bluetooth` | `home/icons/os/bluetooth.svg` |
| `calculator` | `home/icons/os/calculator.svg` |
| `delete` | `home/icons/os/delete.svg` |
| `burn` | `home/icons/os/burn.svg` |
| `trash` | `home/icons/os/trash.svg` |
| `folder` | `home/icons/os/folder.svg` |
| `house` | `home/icons/os/house.svg` |
| `input` | `home/icons/os/input.svg` |
| `power` | `home/icons/os/battery.svg` |
| `settings` | `home/icons/os/settings.svg` |
| `signal` | `home/icons/os/signal.svg` |
| `volume` | `home/icons/os/volume.svg` |
| `mute` | `home/icons/os/mute.svg` |
| `text` | `home/icons/os/text.svg` |
| `user` | `home/icons/os/user.svg` |
| `network` | `home/icons/os/network.svg` |
| `owner` | `home/icons/os/user.svg` |
| `wifi` | `home/icons/os/network.svg` |
| `keyboard` | `home/icons/os/input.svg` |
| `sound-mute` | `home/icons/os/mute.svg` |
| `dumpster-burn` | `home/icons/os/burn.svg` |
| `dumpster` | `home/icons/os/trash.svg` |
| `battery` | `home/icons/os/battery.svg` |

Original user SVG source: C:/Users/cgwma/Desktop/icons/OS. Runtime never depends on this external directory.

OS icon stroke standard: 2.5 units on the shared 36×36 canvas; filled contours use 1-unit expansion. Former white paper fills are transparent (fill:none), so PC and Phone inherit their actual surrounding surface without black patches.

CALC: shared calculator.svg uses a 2×2 grid of plus, minus, multiply and divide, each centered in equal cells with matched visual size.

Latest override: only the ten FROM system controls (trash, input, network, volume/mute, desktop, house, settings, phone, user, battery/power) use 2-unit strokes on a 36×36 canvas. Network and House use true stroked contours; desktop and phone now resolve through the shared manifest. Other icon groups are unchanged.

## Authored PDF icons

19 vector assets were extracted directly from cbn-p.pdf into home/icons/pdf/. source-map.json records original page, source bounds and path counts. No bitmap tracing or redrawing. All strokes are 1px on a 36px canvas; solid paths and authored fills (including COLORS and OUTDESIGN) remain filled.

applicationPdfIcons in application-names.js maps stable software IDs to these shared manifest keys. Both PC appIcon and Phone resolve the same SVG. Phone groups use pdf-group; cloud weather uses pdf-weather while other weather conditions retain their corresponding weather glyphs. Pause/close and translation are registered as reusable assets; software identifiers and names remain unchanged.

Weather APP icon override: authored eight-point outline with a central large circle, 36px canvas and 1px stroke. The original PDF cloud mark is superseded; actual weather-condition symbols in the information widget remain separate.
