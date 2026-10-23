# lcars-gui

Star-Trek-UI-Komponenten für **React** und **reines HTML/CSS/JS** – eine Bibliothek pro Fraktion,
jede mit eigenem Design, eigenen Themes und eigenen Bedien-Tönen.

**[▶ Live-Demo](https://aarondnas.github.io/lcars-gui/)**

| Föderation (LCARS) | Romulus |
|---|---|
| [![Föderation](docs/federation.gif)](https://aarondnas.github.io/lcars-gui/federation.html) | [![Romulus](docs/romulus.gif)](https://aarondnas.github.io/lcars-gui/romulus.html) |
| `npm install @lcars-gui/federation` | `npm install @lcars-gui/romulus` |
| Themes: TNG, DS9, Picard | Themes: Warbird, Tal Shiar, Free State |

## Pakete

| Paket | Inhalt |
|---|---|
| [`@lcars-gui/federation`](packages/federation) | LCARS: Elbows, Kapsel-Buttons, Data Cascade, Keypad, Sensoren … |
| [`@lcars-gui/romulus`](packages/romulus) | Romulanisch: abgeschrägte Ecken, Leuchtlinien, Rauten, Radar-Sweep … |
| [`@lcars-gui/core`](packages/core) | Gemeinsame Basis: Sound-Engine, HTML/JS-Verhalten, CSS-Build |

In Planung: `cardassia`, `qonos`.

## Schnellstart

```tsx
// React
import "@lcars-gui/federation/ui.css";
import { Frame, Button, LcarsRoot } from "@lcars-gui/federation/react";
```

```html
<!-- Reines HTML/JS -->
<link rel="stylesheet" href="https://unpkg.com/@lcars-gui/federation/dist/ui.css">
<script src="https://unpkg.com/@lcars-gui/federation/dist/index.global.js"></script>
<script>LcarsFederation.initLcars({ sound: true });</script>
```

Details stehen in den READMEs der einzelnen Pakete.

## Entwicklung

```sh
npm install
npm run build        # alle Pakete bauen
npm run dev          # Next.js-Beispiel starten
npm run typecheck
npm run previews     # docs/*.gif neu aufnehmen (braucht Edge oder Chrome)
```

Die HTML-Demos liegen in [`apps/examples/web`](apps/examples/web) und werden bei jedem Push auf `main`
per GitHub Actions auf GitHub Pages veröffentlicht.

## Lizenz

[MIT](LICENSE). Star Trek und LCARS sind Marken von CBS Studios / Paramount; dies ist ein inoffizielles Fan-Projekt.
Die mitgelieferte Schrift [Antonio](https://github.com/googlefonts/antonioFont) steht unter der SIL Open Font License 1.1.
