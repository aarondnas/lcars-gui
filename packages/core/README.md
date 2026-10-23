# @lcars-gui/core

Shared foundation of the lcars-gui faction packages. You usually don't need this package directly –
it is installed along with [`@lcars-gui/federation`](https://www.npmjs.com/package/@lcars-gui/federation) and
[`@lcars-gui/romulus`](https://www.npmjs.com/package/@lcars-gui/romulus).

## Contents

| Export                      | Purpose                                                                 |
|-----------------------------|-------------------------------------------------------------------------|
| `createLcarsSound()`        | Synthesized interface sounds via the Web Audio API (no audio files)     |
| `initBehaviors()`           | Behavior for plain HTML/JS: toggles, tabs, keypads, sounds              |
| `seededRandom()`, `cx()`    | Small helpers                                                           |
| `@lcars-gui/core/react`     | `SoundProvider`, `useLcarsSound` – one sound context for all factions   |
| `@lcars-gui/core/build`     | `buildCss()` – generates a faction's CSS from tokens and component CSS  |

## License

MIT
