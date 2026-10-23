# @lcars-gui/federation

LCARS UI components in the style of the Federation – for React and plain HTML/CSS/JS.

**[▶ Live demo & docs](https://aarondnas.github.io/lcars-gui/#federation)**

![Federation](https://raw.githubusercontent.com/aarondnas/lcars-gui/main/docs/federation.gif)

## Installation

```sh
npm install @lcars-gui/federation
```

## Usage

```tsx
// React
import "@lcars-gui/federation/ui.css";
import { Frame, Button, LcarsRoot, SoundProvider } from "@lcars-gui/federation/react";

<SoundProvider>
  <LcarsRoot theme="tng">
    <Frame title="Bridge" topLabel="47-1138" sidebar={<Button shape="rect" align="bottom-right">Tactical</Button>}>
      …
    </Frame>
  </LcarsRoot>
</SoundProvider>
```

```html
<!-- Plain HTML/JS, no bundler -->
<link rel="stylesheet" href="https://unpkg.com/@lcars-gui/federation/dist/ui.css">
<button class="lcar-btn-std" data-color="2" data-shape="rect">Warp</button>

<script src="https://unpkg.com/@lcars-gui/federation/dist/index.global.js"></script>
<script>const ui = LcarsFederation.initLcars({ sound: true });</script>
```

`initLcars()` makes toggles, tabs, keypads, data cascades and interface sounds in static markup interactive.

## Themes & alert

`data-theme` (or `<LcarsRoot theme>`) switches the color palette; `data-alert="red" | "yellow"` recolors everything
below and makes the bars pulse.

| Theme    | Style                      | Extras                                    |
|----------|----------------------------|-------------------------------------------|
| `tng`    | Enterprise-D (default)     | `@lcars-gui/federation/themes/tng.css`    |
| `ds9`    | Deep Space Nine station    | `@lcars-gui/federation/themes/ds9.css`    |
| `picard` | 25th century               | `@lcars-gui/federation/themes/picard.css` |

## Font

The package bundles [Antonio](https://github.com/googlefonts/antonioFont) (SIL Open Font License 1.1, see `dist/fonts/Antonio/OFL.txt`).

## License

MIT. Star Trek and LCARS are trademarks of CBS Studios / Paramount; this is an unofficial fan project.
