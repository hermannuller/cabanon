# Phone local Web App

## Open on iPhone

1. Keep this PC and iPhone on the same Wi-Fi.
2. Double-click `start-phone-web.cmd` in the repository root. The local server runs in the background and prints the current Wi-Fi address.
3. Open the printed `http://192.168.…:8787/phone/` address in Safari. Do not enter localhost on the iPhone: localhost would refer to the iPhone itself.
4. Safari → Share → Add to Home Screen. Enable Open as Web App if shown. Name it Cabanon and add.
5. Launch Cabanon from its Home Screen icon.

Keep the PC awake and the service running while testing. This LAN HTTP edition is not an offline app. No Internet hosting or public tunnel is configured. If the PC Wi-Fi address changes, use the new printed address and recreate the Home Screen shortcut if needed.

The Phone route always starts in Phone mode, even if a saved desktop mode was present. The existing Electron start remains unchanged. Browser-local preferences and files belong to the iPhone/browser origin; they do not automatically sync to the desktop profile.

## Controls and updates

- The server reads the current source files without a build. Reload to see source changes; if a Home Screen window is retained by iOS, close and reopen it.
- Safe areas and the visual viewport are respected. Search keeps the existing on-screen Phone keyboard; name-edit inputs can use the iOS keyboard.
- To stop: double-click `stop-phone-web.cmd`.
- Terminal equivalents: `node serve-phone.cjs --background` and `node serve-phone.cjs --stop`. Foreground mode is `node serve-phone.cjs` and stops with Ctrl+C.
- Optional port: set `CABANON_PHONE_PORT` before launch. Default 8787.
- If Safari cannot connect, verify the same non-guest Wi-Fi and PC wake state. If Windows asks about Node.js network access, allow the private/home network. Router client isolation or a VPN may prevent devices from reaching each other.

## Implementation and validation

- `serve-phone.cjs` serves only the `home` static asset directory. It rejects native helpers (.cjs/.ps1), dot directories, dependencies, package files and path traversal. No profile/filesystem mutation API is exposed.
- `/phone/` adds the install manifest, existing app icon, standalone Apple metadata and Phone-only startup adapter. Electron's index/launch are not changed into a web-only build.
- `home/phone-web.js`/`.css`: Phone-only startup, iOS safe-area and visual viewport sizing, search keyboard compatibility.
- `home/phone.webmanifest`: standalone app identity and icon. Local HTTP cannot register a service worker on an iPhone LAN origin, so no offline behavior is claimed.
- `tmp/phone-web-check.cjs`: loopback/LAN HTTP, private-path rejection, iPhone-size touch opening, manifest, saved state after reload, font/static resource responses and JavaScript errors. This is a mobile browser simulation; physical iPhone Safari gestures need device verification.

### Optional Windows access helper

This session could start the server but Windows denied creating a firewall rule without administrator rights. If the LAN address cannot be reached from the iPhone, double-click `allow-phone-lan.cmd` and accept the Windows administrator prompt. It creates only the `Cabanon Phone LAN 8787` inbound TCP rule for the private-network profile and local subnet, not for public networks or Internet hosting. If Windows marks your home Wi-Fi as Public, select Private for the trusted home network in Windows network settings first. This helper is optional and has not been run with administrator privileges by the agent.
