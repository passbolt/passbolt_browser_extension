<p align="center">
  <img src="https://raw.githubusercontent.com/haspr-dev/.github/main/assets/haspr-logo.svg" alt="Haspr logo" width="160" height="160" />
</p>

<h1 align="center">haspr-browser-extension</h1>

<p align="center">
  <strong>Browser extension (Firefox, Chrome, Edge) for the Haspr ecosystem, compatible with Passbolt.</strong>
</p>

<p align="center">
  <a href="https://github.com/haspr-dev/haspr-browser-extension/blob/master/LICENSE.txt"><img src="https://img.shields.io/github/license/haspr-dev/haspr-browser-extension" alt="License" /></a>
  <a href="https://github.com/haspr-dev/haspr-api"><img src="https://img.shields.io/badge/API-haspr--api-256af2?style=flat-square" alt="API" /></a>
  <a href="https://github.com/haspr-dev/go-pbolt-cli"><img src="https://img.shields.io/badge/CLI-go--pbolt--cli-0bddec?style=flat-square&logo=go" alt="CLI" /></a>
</p>

---

## ⚡ Overview

The **Haspr browser extension** delivers seamless cryptographic password management, quick access, autofill, and native messaging integration with `go-pbolt-cli` and background credential agents.

---

## ⚖️ Trademark Notice

*Passbolt is a registered trademark of Passbolt SA. **Haspr** is an independent community project and is not affiliated with, endorsed by, or sponsored by Passbolt SA.*

---

## 🛠️ Development & Building

### Prerequisites
- Node.js >= 22.14.0
- npm >= 10.9.2

```bash
git clone git@github.com:haspr-dev/haspr-browser-extension.git
cd haspr-browser-extension
npm ci
```

### Build Commands
```bash
# Build all web-accessible bundles
npm run build

# Run unit tests
npm test
```

### Loading the Unpacked Extension
- **Firefox**: Open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select `build/all/manifest.json`.
- **Chrome / Brave / Edge**: Open `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select `build/all`.

---

## 📄 License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License (AGPL) as published by the Free Software Foundation version 3.

See [LICENSE.txt](LICENSE.txt) for details.
