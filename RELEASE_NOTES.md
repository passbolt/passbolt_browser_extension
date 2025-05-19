Song: https://www.youtube.com/watch?v=Nbav4oWMqEY

Passbolt v5.1.1 is a security release that upgrades the OpenPGP.js library to address a recently discovered vulnerability. While the impact of this issue is minimal, OpenPGP.js is a cornerstone of the extension, so the update is essential.

The release also includes fixes for several bugs reported by the community after the major v5 redesign.

As always, thank you to everyone who provided bug reports and feedback, and a special thanks to the OpenPGP.js team for the timely heads-up and patch.


### Added
- PB-41365 Support options for ECC Key generation


### Fixed
- PB-41760 On some conditions, scrollbars can appear and break the design
- PB-42561 The folder tree caret when scrolling appeared in the wrong orientation

### Security
- PB-42613 Upgrade browser extension OpenPGP.js to the latest version
