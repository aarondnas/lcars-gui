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

/** Glowing line, optionally with pointed ends or dashed. */
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

/** Filled segment with chamfered corners; the label sits bottom left. */
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

/** Letter-spaced title in the header. */
export function Title({ color, className, ...rest }: TitleProps) {
  return (
    <h1
      className={cx(cls.title, className)}
      {...colorAttribute(color)}
      {...rest}
    />
  );
}

/** Vertical stack of buttons/blocks with even gaps. */
export function Stack({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(cls.stack, className)} {...rest} />;
}

export interface PanelProps extends Omit<DivProps, "title"> {
  color?: RomulusColor;
  title?: ReactNode;
  /** ID code in the filled trapezoid at the start of the header, e.g. "R-7734" */
  code?: ReactNode;
  /** Sidebar content (buttons/blocks); filled up to the bottom */
  sidebar?: ReactNode;
  /** Replaces the default line in the header or footer; footer={null} hides the footer */
  header?: ReactNode;
  footer?: ReactNode;
}

/** Romulan console: chamfered corners, talon corners, header with ID code, optional sidebar. */
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
