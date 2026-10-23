import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@lcars-gui/core";
import {
  barDataAttributes,
  blockDataAttributes,
  colorAttribute,
  panelClassNames as cls,
  type BarProps as CoreBarProps,
  type BlockProps as CoreBlockProps,
  type RomulusColor,
} from "..";

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, "color">;

export type BarProps = CoreBarProps & DivProps;

/** Leuchtlinie, optional mit spitzen Enden oder gestrichelt. */
export function Bar({ color, cap, length, segmented, className, ...rest }: BarProps) {
  return (
    <div
      className={cx(cls.bar, className)}
      {...barDataAttributes({ color, cap, length, segmented })}
      {...rest}
    />
  );
}

export type BlockProps = CoreBlockProps & DivProps;

/** Gefülltes Segment mit abgeschrägten Ecken; Label sitzt unten links. */
export function Block({ color, fill, className, ...rest }: BlockProps) {
  return (
    <div
      className={cx(cls.block, className)}
      {...blockDataAttributes({ color, fill })}
      {...rest}
    />
  );
}

export type TitleProps = { color?: RomulusColor } & Omit<
  HTMLAttributes<HTMLHeadingElement>,
  "color"
>;

/** Gesperrter Titel in der Kopfzeile. */
export function Title({ color, className, ...rest }: TitleProps) {
  return (
    <h1
      className={cx(cls.title, className)}
      {...colorAttribute(color)}
      {...rest}
    />
  );
}

/** Senkrechter Stapel aus Buttons/Blocks mit gleichmäßigen Lücken. */
export function Stack({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(cls.stack, className)} {...rest} />;
}

export interface PanelProps extends Omit<DivProps, "title"> {
  color?: RomulusColor;
  title?: ReactNode;
  /** Kennung im gefüllten Trapez vorn im Kopf, z. B. "R-7734" */
  code?: ReactNode;
  /** Inhalt der Seitenleiste (Buttons/Blocks); wird nach unten aufgefüllt */
  sidebar?: ReactNode;
  /** Ersetzt die Standardlinie im Kopf bzw. Fuß; footer={null} blendet den Fuß aus */
  header?: ReactNode;
  footer?: ReactNode;
}

/** Romulanische Konsole: abgeschrägte Ecken, Krallen-Ecken, Kopf mit Kennung, optionale Seitenleiste. */
export function Panel({
  color,
  title,
  code,
  sidebar,
  header,
  footer,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <section className={cx(cls.panel, className)} {...colorAttribute(color)} {...rest}>
      <div className={cls.header}>
        {code != null && <span className={cls.code}>{code}</span>}
        {title != null && <Title>{title}</Title>}
        {header ?? <Bar cap="right" />}
      </div>
      {sidebar != null && (
        <Stack className={cls.sidebar}>
          {sidebar}
          <Block fill />
        </Stack>
      )}
      <div className={cls.content}>{children}</div>
      {footer !== null && (
        <div className={cls.footer}>
          {footer ?? (
            <>
              <Bar segmented />
              <Bar length="s" cap="right" />
            </>
          )}
        </div>
      )}
    </section>
  );
}
