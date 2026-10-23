# Cabanon

Cabanon is a mobile/desktop operating system prototype built with Electron. The main interface, application, and interaction code are located in `home/`。

It includes features such as folder and virtual file management, a TXT plain text editor, the BERLIN wallpaper editor, a HELP documentation app, as well as prototype functionality for RIVER, rive, CANAL, and MARATHON. Incomplete applications retain placeholder entry points.

## Getting Started
After installing Node.js, run the following commands in the project directory:

```sh
cd home
npm install
npm start
```

The application uses PowerShell to help handle the Windows key.

## index

- `home/`: Electron app, user interface, fonts, and icons.
- `docs/`: Feature specifications, interaction conventions, and UI references.
- Markdown files in the root directory: Design plans and specifications.
- `paragraph-explorer/`: An early standalone paragraph file manager prototype.

## DATA

Virtual files, account settings, and drafts are saved in local application storage, separate from the source code repository. Uploading code will not back up this personal data. The default data directory on Windows is `%APPDATA%\Cabanon OS Prototype`。

Interactions such as RIVER and rive are currently local prototypes and do not represent connections to live online services. The project is actively under development.
