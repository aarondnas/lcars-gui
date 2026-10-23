import { useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "@lcars-gui/core";
import {
  cascadeGlyphs,
  colorAttribute,
  displayClassNames as cls,
  levelSegments,
  toPercent,
  type AlertLevel,
  type Orientation,
  type RomulusColor,
  type StatusKind,
} from "..";

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, "color">;
type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* #################### DATA CASCADE #################### */

export interface DataCascadeProps extends DivProps {
  columns?: number;
  rows?: number;
  seed?: number;
}

/** Spalten aus Hex-Gruppen, die einzeln aufflackern. */
export function DataCascade({ columns = 6, rows = 6, seed = 1701, className, ...rest }: DataCascadeProps) {
  const data = useMemo(() => cascadeGlyphs(columns, rows, seed), [columns, rows, seed]);
  return (
    <div className={cx(cls.cascade, className)} aria-hidden {...rest}>
      {data.map((col, c) => (
        <div key={c} className={cls.cascadeCol}>
          {col.map((g, r) => (
            <span key={r} style={{ "--i": r * 3 + c } as Vars}>{g}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* #################### READOUT / NUMBER #################### */

export interface ReadoutItem {
  label: ReactNode;
  value: ReactNode;
  color?: RomulusColor;
}

export interface ReadoutProps extends Omit<HTMLAttributes<HTMLDListElement>, "color"> {
  items: ReadoutItem[];
  color?: RomulusColor;
}

/** Wertetabelle: Label, gepunktete Führungslinie, Wert. */
export function Readout({ items, color, className, ...rest }: ReadoutProps) {
  return (
    <dl className={cx(cls.readout, className)} {...colorAttribute(color)} {...rest}>
      {items.map((item, i) => (
        <div key={i}>
          <dt {...colorAttribute(item.color)}>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type NumberCodeProps = { color?: RomulusColor } & Omit<HTMLAttributes<HTMLSpanElement>, "color">;

/** Kennung wie „R-7734“. */
export function NumberCode({ color, className, ...rest }: NumberCodeProps) {
  return <span className={cx(cls.number, className)} {...colorAttribute(color)} {...rest} />;
}

/* #################### DIVIDER / GRID #################### */

/** Linie mit Skalenstrichen und Raute in der Mitte. */
export function Divider({ color, className, ...rest }: { color?: RomulusColor } & DivProps) {
  return <div role="separator" className={cx(cls.divider, className)} {...colorAttribute(color)} {...rest} />;
}

export interface ButtonGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
}

/** Raster aus Buttons. */
export function ButtonGrid({ columns = 4, className, style, ...rest }: ButtonGridProps) {
  return <div className={cx(cls.grid, className)} style={{ "--cols": columns, ...style } as Vars} {...rest} />;
}

/* #################### LEVEL BAR / GAUGE #################### */

export interface LevelBarProps extends DivProps {
  value: number;
  max?: number;
  segments?: number;
  orientation?: Orientation;
  color?: RomulusColor;
}

/** Pegelanzeige aus schrägen Segmenten (senkrecht: Winkel). */
export function LevelBar({ value, max = 100, segments = 12, orientation, color, className, ...rest }: LevelBarProps) {
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cx(cls.level, className)}
      data-orientation={orientation}
      {...colorAttribute(color)}
      {...rest}
    >
      {levelSegments(value, segments, max).map((on, i) => (
        <span key={i} data-on={on ? "" : undefined} />
      ))}
    </div>
  );
}

export interface GaugeProps extends DivProps {
  value: number;
  max?: number;
  segments?: number;
  label?: ReactNode;
  color?: RomulusColor;
}

/** Ringanzeige aus Segmenten, Wert in der Mitte. */
export function Gauge({ value, max = 100, segments = 24, label, color, className, style, ...rest }: GaugeProps) {
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cx(cls.gauge, className)}
      style={{ "--value": toPercent(value, max), "--segments": segments, ...style } as Vars}
      {...colorAttribute(color)}
      {...rest}
    >
      <span>{Math.round(value)}</span>
      {label != null && <small>{label}</small>}
    </div>
  );
}

/* #################### SENSOR #################### */

export interface Blip {
  x: number; // 0–100
  y: number; // 0–100
  color?: RomulusColor;
}

export interface SensorProps extends DivProps {
  blips?: Blip[];
  /** Radar-Sweep um die Mitte */
  scan?: boolean;
  color?: RomulusColor;
}

/** Sensoranzeige mit Dreiecksraster, Fadenkreuz und Kontakten als Rauten. */
export function Sensor({ blips = [], scan, color, className, children, ...rest }: SensorProps) {
  return (
    <div className={cx(cx(cls.sensor, scan ? cls.scan : undefined), className)} {...colorAttribute(color)} {...rest}>
      {blips.map((b, i) => (
        <span key={i} className={cls.blip} style={{ "--x": b.x, "--y": b.y } as Vars} {...colorAttribute(b.color)} />
      ))}
      {children}
    </div>
  );
}

/* #################### STATUS / ALERT #################### */

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusKind;
  blink?: boolean;
}

/** Rautenlampe mit Beschriftung. */
export function StatusIndicator({ status = "ok", blink, className, ...rest }: StatusIndicatorProps) {
  return (
    <span
      role="status"
      className={cx(cls.status, className)}
      data-status={status}
      data-blink={blink ? "" : undefined}
      {...rest}
    />
  );
}

export interface AlertBannerProps extends Omit<DivProps, "title"> {
  level?: AlertLevel;
  title?: ReactNode;
}

/** Sechseckiges, blinkendes Alarm-Banner. */
export function AlertBanner({ level = "red", title = "Alert", children, className, ...rest }: AlertBannerProps) {
  return (
    <div role="alert" className={cx(cls.alert, className)} data-level={level} {...rest}>
      <span className={cls.alertTitle}>{title}</span>
      <span className={cls.alertText}>{children ?? `Condition: ${level}`}</span>
    </div>
  );
}
