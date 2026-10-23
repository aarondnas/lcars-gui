# @lcars-gui/romulus

UI components in the style of the Romulan Star Empire: glowing lines on dark surfaces,
chamfered corners, talon-shaped panel corners, diamonds instead of circles.

**[▶ Live demo & docs](https://aarondnas.github.io/lcars-gui/#romulus)**

![Romulus](https://raw.githubusercontent.com/aarondnas/lcars-gui/main/docs/romulus.gif)

## Installation

```sh
npm install @lcars-gui/romulus
```

## Usage

```tsx
// React
import "@lcars-gui/romulus/ui.css";
import { Panel, Button, RomulusRoot, SoundProvider } from "@lcars-gui/romulus/react";

<SoundProvider>
  <RomulusRoot theme="warbird">
    <Panel code="R-7734" title="Tactical" sidebar={<Button>Cloak</Button>}>
      …
    </Panel>
  </RomulusRoot>
</SoundProvider>
```

```html
<!-- Plain HTML/JS -->
<link rel="stylesheet" href="https://unpkg.com/@lcars-gui/romulus/dist/ui.css">
<script src="https://unpkg.com/@lcars-gui/romulus/dist/index.global.js"></script>
<script>const ui = LcarsRomulus.initRomulus({ sound: true });</script>
```

## Themes

| Theme        | Style                                 | Extras (`themes/<name>.css`)   |
|--------------|---------------------------------------|--------------------------------|
| `warbird`    | TNG, D'deridex class (default)        | scanlines on panels            |
| `tal-shiar`  | cooler, blue-green                    | flickering titles and ID codes |
| `free-state` | Picard era, with a gold accent        | glow on text and contacts      |

## Font

No font is bundled. [Michroma](https://fonts.google.com/specimen/Michroma) (Google Fonts, free) fits well;
without it Eurostile, Bahnschrift or Arial Narrow are used.

## CSS variables

All variables use the `--rom-` prefix (e.g. `--rom-colors-color1`), so Romulus and other factions
can live on the same page without conflicts.

## License

MIT. Star Trek is a trademark of CBS Studios / Paramount; this is an unofficial fan project.
