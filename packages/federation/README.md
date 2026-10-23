# @lcars-gui/federation

LCARS-UI-Komponenten im Stil der Föderation – für React und reines HTML/CSS/JS.

**[Live-Demo](https://aarondnas.github.io/lcars-gui/federation.html)**

![Föderation](https://raw.githubusercontent.com/aarondnas/lcars-gui/main/docs/federation.gif)

## Installation

```sh
npm install @lcars-gui/federation
```

## Verwendung

```tsx
// React
import "@lcars-gui/federation/ui.css";
import { Frame, Button, LcarsRoot, SoundProvider } from "@lcars-gui/federation/react";

<SoundProvider>
  <LcarsRoot theme="tng">
    <Frame title="Brücke" topLabel="47-1138" sidebar={<Button shape="rect" align="bottom-right">Taktik</Button>}>
      …
    </Frame>
  </LcarsRoot>
</SoundProvider>
```

```html
<!-- Reines HTML/JS, ohne Bundler -->
<link rel="stylesheet" href="https://unpkg.com/@lcars-gui/federation/dist/ui.css">
<button class="lcar-btn-std" data-color="2" data-shape="rect">Warp</button>

<script src="https://unpkg.com/@lcars-gui/federation/dist/index.global.js"></script>
<script>const ui = LcarsFederation.initLcars({ sound: true });</script>
```

`initLcars()` macht Toggles, Tabs, Keypads, Data Cascades und Bedien-Töne im statischen Markup interaktiv.

## Themes & Alarm

`data-theme` (bzw. `<LcarsRoot theme>`) wechselt die Farbpalette, `data-alert="red" | "yellow"` färbt alles darunter um und lässt die Balken pulsieren.

| Theme    | Stil                          | Extras                                  |
|----------|-------------------------------|-----------------------------------------|
| `tng`    | Enterprise-D (Standard)       | `@lcars-gui/federation/themes/tng.css`  |
| `ds9`    | Raumstation Deep Space Nine   | `@lcars-gui/federation/themes/ds9.css`  |
| `picard` | 25. Jahrhundert               | `@lcars-gui/federation/themes/picard.css` |

## Schrift

Mitgeliefert wird [Antonio](https://github.com/googlefonts/antonioFont) (SIL Open Font License 1.1, siehe `dist/fonts/Antonio/OFL.txt`).

## Lizenz

MIT. Star Trek und LCARS sind Marken von CBS Studios / Paramount; dies ist ein inoffizielles Fan-Projekt.
