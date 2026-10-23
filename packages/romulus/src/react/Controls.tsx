import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "@lcars-gui/core";
import { useLcarsSound } from "@lcars-gui/core/react";
import {
  colorAttribute,
  controlClassNames as cls,
  type RomulusColor,
} from "..";
import { Button, type ButtonProps } from "./Button";
import { Bar } from "./Panel";

/* #################### TOGGLE #################### */

export interface ToggleProps extends ButtonProps {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

/** Button mit Zustand an/aus (aria-pressed). */
export function Toggle({ pressed, defaultPressed = false, onPressedChange, onClick, ...rest }: ToggleProps) {
  const [inner, setInner] = useState(defaultPressed);
  const isOn = pressed ?? inner;

  return (
    <Button
      aria-pressed={isOn}
      onClick={(e) => {
        setInner(!isOn);
        onPressedChange?.(!isOn);
        onClick?.(e);
      }}
      {...rest}
    />
  );
}

/* #################### SLIDER #################### */

export type SliderProps = { color?: RomulusColor } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "color"
>;

/** Schieberegler (natives input type="range") mit Rautengriff. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { color, className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      type="range"
      className={cx(cls.range, className)}
      {...colorAttribute(color)}
      {...rest}
    />
  );
});

/* #################### INPUT #################### */

export type InputProps = { color?: RomulusColor; label?: ReactNode } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "color"
>;

/** Textfeld mit gefülltem Trapez als Beschriftung. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { color, label, className, ...rest },
  ref
) {
  return (
    <label className={cls.field} {...colorAttribute(color)}>
      {label != null && <span className={cls.fieldLabel}>{label}</span>}
      <input ref={ref} className={cx(cls.input, className)} {...rest} />
    </label>
  );
});

/* #################### TABS #################### */

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  color?: RomulusColor;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  color?: RomulusColor;
}

/** Registerkarten als Parallelogramme über einer Leuchtlinie. */
export function Tabs({ items, value, defaultValue, onValueChange, color, className, ...rest }: TabsProps) {
  const base = useId();
  const play = useLcarsSound();
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? inner;

  const select = (id: string) => {
    setInner(id);
    onValueChange?.(id);
    play("beep");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const index = items.findIndex((item) => item.id === active);
    const next = items[(index + step + items.length) % items.length];
    select(next.id);
    document.getElementById(`${base}-tab-${next.id}`)?.focus();
  };

  return (
    <div className={cx(cls.tabs, className)} {...colorAttribute(color)} {...rest}>
      <div role="tablist" className={cls.tablist} onKeyDown={onKeyDown}>
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={cls.tab}
              {...colorAttribute(item.color)}
              onClick={() => select(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <Bar cap="right" color={color} />
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          className={cls.tabpanel}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

/* #################### KEYPAD #################### */

export interface KeypadProps extends Omit<HTMLAttributes<HTMLDivElement>, "color" | "onSubmit"> {
  color?: RomulusColor;
  /** Maximale Länge des Codes */
  length?: number;
  /** Code als Punkte anzeigen */
  mask?: boolean;
  /** Wird mit dem Code aufgerufen; true = Code akzeptiert, false = abgelehnt */
  onSubmit?: (code: string) => boolean | void;
}

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "ENT"];

/** Ziffernfeld mit Anzeige, z. B. für Zugangscodes. */
export function Keypad({ color = 1, length = 6, mask, onSubmit, className, ...rest }: KeypadProps) {
  const play = useLcarsSound();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"ok" | "error" | undefined>();

  const press = (key: string) => {
    setState(undefined);
    if (key === "CLR") return setCode("");
    if (key === "ENT") {
      const accepted = onSubmit?.(code);
      if (accepted === undefined) return play("confirm");
      setState(accepted ? "ok" : "error");
      play(accepted ? "confirm" : "deny");
      return setCode("");
    }
    if (code.length < length) setCode(code + key);
  };

  const shown = state === "ok" ? "OK" : state === "error" ? "DENIED" : mask ? "•".repeat(code.length) : code;

  return (
    <div className={cx(cls.keypad, className)} {...colorAttribute(color)} {...rest}>
      <output className={cls.keypadDisplay} data-state={state}>
        {shown || "–".repeat(length)}
      </output>
      {keys.map((key) => (
        <Button
          key={key}
          color={key === "CLR" ? 2 : key === "ENT" ? 4 : color}
          variant={key === "ENT" ? "solid" : "outline"}
          sound={key === "ENT" ? false : "beep"}
          onClick={() => press(key)}
        >
          {key}
        </Button>
      ))}
    </div>
  );
}
