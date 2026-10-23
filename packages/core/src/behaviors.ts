// packages/core/src/behaviors.ts
// Verhalten für reines HTML/JS, unabhängig vom Design einer Fraktion:
// Toggles, Tabs, Keypads und Bedien-Töne. Die Fraktionen geben nur ihre Selektoren an.
import { createLcarsSound, type LcarsSoundKind, type LcarsSoundOptions } from "./sound";

export interface BehaviorSelectors {
  /** Elemente, die beim Klicken einen Ton spielen (Buttons, Tabs) */
  control: string;
  /** Keypad-Container */
  keypad: string;
  /** Taste innerhalb eines Keypads */
  keypadKey: string;
  /** Anzeige innerhalb eines Keypads */
  keypadDisplay: string;
}

export interface InitBehaviorsOptions {
  /** Bereich, in dem verdrahtet wird (Standard: document) */
  root?: Document | HTMLElement;
  /** Bedien-Töne von Anfang an an (später: setSound) */
  sound?: boolean;
  volume?: number;
  /** Prüft den Code eines Keypads; ohne Angabe wird mit data-code verglichen */
  onKeypadSubmit?: (code: string, keypad: HTMLElement) => boolean | void;
}

export interface LcarsController {
  play(kind?: LcarsSoundKind): void;
  setSound(enabled: boolean): void;
  destroy(): void;
}

/** Event, das ein Toggle nach jedem Umschalten auslöst (detail.pressed). */
export const pressedChangeEvent = "lcar:pressedchange";

/**
 * Macht statisches Markup interaktiv.
 * Der zurückgegebene Controller spielt Töne und entfernt die Listener wieder.
 */
export function initBehaviors(
  selectors: BehaviorSelectors,
  { root = document, sound = false, volume, onKeypadSubmit }: InitBehaviorsOptions = {},
  soundOptions?: LcarsSoundOptions
): LcarsController {
  const player = createLcarsSound(volume, soundOptions);
  let soundOn = sound;
  const play = (kind?: LcarsSoundKind) => soundOn && player.play(kind);

  const onClick = (e: Event) => {
    const target = e.target as HTMLElement;

    const control = target.closest<HTMLElement>(selectors.control);
    if (control && control.dataset.sound !== "none") play((control.dataset.sound as LcarsSoundKind) || "beep");

    const toggle = target.closest<HTMLElement>("[aria-pressed]");
    if (toggle) {
      const pressed = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(pressed));
      toggle.dispatchEvent(new CustomEvent(pressedChangeEvent, { bubbles: true, detail: { pressed } }));
    }

    const tab = target.closest<HTMLElement>('[role="tab"]');
    if (tab) selectTab(tab);

    const key = target.closest(`${selectors.keypad} ${selectors.keypadKey}`);
    if (key) pressKey(key.closest<HTMLElement>(selectors.keypad)!, key.textContent!.trim());
  };

  // Tabs: Pfeiltasten wechseln den aktiven Tab
  const onKeyDown = (e: Event) => {
    const { key, target } = e as KeyboardEvent;
    const step = key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
    const tab = (target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    if (!step || !tab) return;
    const list = tabsOf(tab);
    const next = list[(list.indexOf(tab) + step + list.length) % list.length];
    selectTab(next);
    play("beep");
    next.focus();
  };

  // Keypad: Code sammeln, mit ENT prüfen, mit CLR löschen
  const codes = new WeakMap<HTMLElement, string>();
  const pressKey = (pad: HTMLElement, key: string) => {
    const display = pad.querySelector<HTMLElement>(selectors.keypadDisplay);
    const length = Number(pad.dataset.length) || 6;
    let code = codes.get(pad) ?? "";
    const show = (text: string, state?: "ok" | "error") => {
      if (!display) return;
      display.textContent = text || "–".repeat(length);
      if (state) display.dataset.state = state;
      else delete display.dataset.state;
    };

    if (key === "ENT") {
      const accepted = onKeypadSubmit ? onKeypadSubmit(code, pad) : code === pad.dataset.code;
      codes.set(pad, "");
      if (accepted === undefined) return play("confirm");
      play(accepted ? "confirm" : "deny");
      return show(accepted ? "OK" : "Denied", accepted ? "ok" : "error");
    }
    if (key === "CLR") code = "";
    else if (code.length < length) code += key;
    codes.set(pad, code);
    show(pad.dataset.mask === undefined ? code : "•".repeat(code.length));
  };

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKeyDown);

  return {
    play: (kind) => player.play(kind),
    setSound: (enabled) => (soundOn = enabled),
    destroy() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKeyDown);
    },
  };
}

function tabsOf(tab: HTMLElement) {
  return [...(tab.closest('[role="tablist"]')?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])];
}

function selectTab(tab: HTMLElement) {
  for (const t of tabsOf(tab)) {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute("aria-controls") ?? "");
    if (panel) panel.hidden = !on;
  }
}
