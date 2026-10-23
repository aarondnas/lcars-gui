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

/** Columns of hex groups that flicker one by one. */
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

/** Value table: label, dotted leader line, value. */
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

/** ID code like "R-7734". */
export function NumberCode({ color, className, ...rest }: NumberCodeProps) {
  return <span className={cx(cls.number, className)} {...colorAttribute(color)} {...rest} />;
}

/* #################### DIVIDER / GRID #################### */

/** Line with tick marks and a diamond in the middle. */
export function Divider({ color, className, ...rest }: { color?: RomulusColor } & DivProps) {
  return <div role="separator" className={cx(cls.divider, className)} {...colorAttribute(color)} {...rest} />;
}

export interface ButtonGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
}

/** Grid of buttons. */
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

/** Level bar of slanted segments (vertical: chevrons). */
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

/** Ring gauge made of segments, value in the center. */
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
  /** Radar sweep around the center */
  scan?: boolean;
  color?: RomulusColor;
}

/** Sensor display with a triangular grid, crosshair and diamond contacts. */
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

/** Diamond indicator light with label. */
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

/** Hexagonal, blinking alert banner. */
export function AlertBanner({ level = "red", title = "Alert", children, className, ...rest }: AlertBannerProps) {
  return (
    <div role="alert" className={cx(cls.alert, className)} data-level={level} {...rest}>
      <span className={cls.alertTitle}>{title}</span>
      <span className={cls.alertText}>{children ?? `Condition: ${level}`}</span>
    </div>
  );
}
