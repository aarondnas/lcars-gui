import { useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import {
  cascadeNumbers,
  colorAttribute,
  displayClassNames as cls,
  levelSegments,
  toPercent,
  type AlertLevel,
  type LcarsColor,
  type Orientation,
  type StatusKind,
} from "..";
import { cx } from "@lcars-gui/core";

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, "color">;
type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* #################### DATA CASCADE #################### */

export interface DataCascadeProps extends DivProps {
  columns?: number;
  rows?: number;
  seed?: number;
}

/** Durchlaufende Zahlenspalten – der „Computer arbeitet“-Effekt. */
export function DataCascade({ columns = 8, rows = 6, seed = 47, className, ...rest }: DataCascadeProps) {
  const data = useMemo(() => cascadeNumbers(columns, rows, seed), [columns, rows, seed]);
  return (
    <div className={cx(cls.cascade, className)} aria-hidden {...rest}>
      {data.map((col, c) => (
        <div key={c} className={cls.cascadeCol}>
          {col.map((n, r) => (
            <span key={r} style={{ "--i": r * 2 + c } as Vars}>{n}</span>
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
  color?: LcarsColor;
}

export interface ReadoutProps extends Omit<HTMLAttributes<HTMLDListElement>, "color"> {
  items: ReadoutItem[];
  color?: LcarsColor;
}

/** Wertetabelle: Label links, Wert rechtsbündig. */
export function Readout({ items, color, className, ...rest }: ReadoutProps) {
  return (
    <dl className={cx(cls.readout, className)} {...colorAttribute(color)} {...rest}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "contents" }}>
          <dt {...colorAttribute(item.color)}>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type NumberCodeProps = { color?: LcarsColor } & Omit<HTMLAttributes<HTMLSpanElement>, "color">;

/** Kennnummer wie „47-1138“. */
export function NumberCode({ color, className, ...rest }: NumberCodeProps) {
  return <span className={cx(cls.number, className)} {...colorAttribute(color)} {...rest} />;
}

/* #################### DIVIDER / GRID #################### */

export function Divider({ color, className, ...rest }: { color?: LcarsColor } & DivProps) {
  return <div role="separator" className={cx(cls.divider, className)} {...colorAttribute(color)} {...rest} />;
}

export interface ButtonGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
}

/** Raster aus Buttons wie eine Brückenkonsole. */
export function ButtonGrid({ columns = 4, className, style, ...rest }: ButtonGridProps) {
  return <div className={cx(cls.grid, className)} style={{ "--cols": columns, ...style } as Vars} {...rest} />;
}

/* #################### LEVEL BAR / GAUGE #################### */

export interface LevelBarProps extends DivProps {
  value: number;
  max?: number;
  segments?: number;
  orientation?: Orientation;
  color?: LcarsColor;
}

/** Segmentierte Pegelanzeige. */
export function LevelBar({ value, max = 100, segments = 10, orientation, color, className, ...rest }: LevelBarProps) {
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
  color?: LcarsColor;
}

/** Halbrunde Anzeige aus Bogensegmenten. */
export function Gauge({ value, max = 100, segments = 12, label, color, className, style, ...rest }: GaugeProps) {
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
  color?: LcarsColor;
}

export interface SensorProps extends DivProps {
  blips?: Blip[];
  scan?: boolean;
  color?: LcarsColor;
}

/** Sensoranzeige mit Raster, Fadenkreuz, Kontakten und optionalem Scan. */
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

/** Lämpchen mit Beschriftung. */
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

/** Großes, blinkendes Alarm-Banner. */
export function AlertBanner({ level = "red", title = "Alert", children, className, ...rest }: AlertBannerProps) {
  return (
    <div role="alert" className={cx(cls.alert, className)} data-level={level} {...rest}>
      <span className={cls.alertTitle}>{title}</span>
      <span className={cls.alertText}>{children ?? `Condition: ${level}`}</span>
    </div>
  );
}
