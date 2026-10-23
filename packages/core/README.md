# @lcars-gui/core

Gemeinsame Basis der lcars-gui-Fraktionspakete. Normalerweise brauchst du dieses Paket nicht direkt –
es wird von [`@lcars-gui/federation`](https://www.npmjs.com/package/@lcars-gui/federation) und
[`@lcars-gui/romulus`](https://www.npmjs.com/package/@lcars-gui/romulus) mitinstalliert.

## Inhalt

| Export                      | Zweck                                                                     |
|-----------------------------|---------------------------------------------------------------------------|
| `createLcarsSound()`        | Synthetisierte Bedien-Töne über die Web Audio API (keine Audiodateien)    |
| `initBehaviors()`           | Verhalten für reines HTML/JS: Toggles, Tabs, Keypads, Töne                |
| `seededRandom()`, `cx()`    | Kleine Hilfsfunktionen                                                    |
| `@lcars-gui/core/react`     | `SoundProvider`, `useLcarsSound` – ein Sound-Kontext für alle Fraktionen  |
| `@lcars-gui/core/build`     | `buildCss()` – erzeugt das CSS einer Fraktion aus Tokens und Komponenten-CSS |

## Lizenz

MIT
