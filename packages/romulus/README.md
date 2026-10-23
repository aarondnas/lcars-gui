# @lcars-gui/romulus

UI-Komponenten im Stil des Romulanischen Sternenimperiums: leuchtende Linien auf dunklem Grund,
abgeschrägte Ecken, Krallen-Ecken an Panels, Rauten statt Kreisen.

**[Live-Demo](https://aarondnas.github.io/lcars-gui/romulus.html)**

![Romulus](https://raw.githubusercontent.com/aarondnas/lcars-gui/main/docs/romulus.gif)

## Installation

```sh
npm install @lcars-gui/romulus
```

## Verwendung

```ts
// React
import "@lcars-gui/romulus/ui.css";
import { Panel, Button, RomulusRoot, SoundProvider } from "@lcars-gui/romulus/react";

<SoundProvider>
  <RomulusRoot theme="warbird">
    <Panel code="R-7734" title="Taktisch" sidebar={<Button>Tarnung</Button>}>
      …
    </Panel>
  </RomulusRoot>
</SoundProvider>
```

```html
<!-- Reines HTML/JS -->
<link rel="stylesheet" href="https://unpkg.com/@lcars-gui/romulus/dist/ui.css">
<script src="https://unpkg.com/@lcars-gui/romulus/dist/index.global.js"></script>
<script>const ui = LcarsRomulus.initRomulus({ sound: true });</script>
```

## Themes

| Theme        | Stil                                    | Extras (`themes/<name>.css`)  |
|--------------|-----------------------------------------|-------------------------------|
| `warbird`    | TNG, D'deridex-Klasse (Standard)        | Scanlines auf Panels          |
| `tal-shiar`  | kühler, blaugrün                        | flackernde Titel und Kennungen |
| `free-state` | Picard-Ära, mit Goldakzent              | Leuchten auf Schrift/Kontakten |

## Schrift

Es wird keine Schrift mitgeliefert. Gut passt [Michroma](https://fonts.google.com/specimen/Michroma)
(Google Fonts, frei); ohne sie greifen Eurostile, Bahnschrift oder Arial Narrow.

## CSS-Variablen

Alle Variablen tragen das Präfix `--rom-` (z. B. `--rom-colors-color1`), damit sich Romulus
und andere Fraktionen auf einer Seite nicht in die Quere kommen.

## Lizenz

MIT. Star Trek ist eine Marke von CBS Studios / Paramount; dies ist ein inoffizielles Fan-Projekt.
