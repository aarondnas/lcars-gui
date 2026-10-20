import type { HTMLAttributes, ReactNode } from "react";
import {
  barDataAttributes,
  blockDataAttributes,
  colorAttribute,
  elbowDataAttributes,
  frameClassNames as cls,
  type BarProps as CoreBarProps,
  type BlockProps as CoreBlockProps,
  type ElbowProps as CoreElbowProps,
  type LcarsColor,
} from "@lcars/core";
import { cx } from "./cx";

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, "color">;

export type ElbowProps = CoreElbowProps & DivProps;

/** L-förmige Ecke, die Seitenleiste und Balken verbindet. */
export function Elbow({ corner, color, className, ...rest }: ElbowProps) {
  return (
    <div
      className={cx(cls.elbow, className)}
      {...elbowDataAttributes({ corner, color })}
      {...rest}
    />
  );
}

export type BarProps = CoreBarProps & DivProps;

/** Waagrechter Balken, optional mit abgerundetem Ende (End Cap). */
export function Bar({ color, cap, length, className, ...rest }: BarProps) {
  return (
    <div
      className={cx(cls.bar, className)}
      {...barDataAttributes({ color, cap, length })}
      {...rest}
    />
  );
}

export type BlockProps = CoreBlockProps & DivProps;

/** Rechteckiges Segment, z. B. in der Seitenleiste; Label sitzt unten rechts. */
export function Block({ color, fill, className, ...rest }: BlockProps) {
  return (
    <div
      className={cx(cls.block, className)}
      {...blockDataAttributes({ color, fill })}
      {...rest}
    />
  );
}

export type TitleProps = { color?: LcarsColor } & Omit<
  HTMLAttributes<HTMLHeadingElement>,
  "color"
>;

/** Titel in der Balkenzeile. */
export function Title({ color, className, ...rest }: TitleProps) {
  return (
    <h1
      className={cx(cls.title, className)}
      {...colorAttribute(color)}
      {...rest}
    />
  );
}

/** Senkrechter Stapel aus Segmenten mit gleichmäßigen Lücken. */
export function Stack({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(cls.stack, className)} {...rest} />;
}

export interface FrameProps extends Omit<DivProps, "title"> {
  color?: LcarsColor;
  title?: ReactNode;
  /** Label im oberen/unteren Elbow, z. B. eine Nummer wie "47-1138" */
  topLabel?: ReactNode;
  bottomLabel?: ReactNode;
  /** Inhalt der Seitenleiste (Buttons/Blocks); wird nach unten aufgefüllt */
  sidebar?: ReactNode;
  /** Ersetzt den Standardbalken oben bzw. unten */
  top?: ReactNode;
  bottom?: ReactNode;
}

/** Klassisches LCARS-Panel: Seitenleiste, zwei Elbows, Balken und Inhaltsbereich. */
export function Frame({
  color,
  title,
  topLabel,
  bottomLabel,
  sidebar,
  top,
  bottom,
  className,
  children,
  ...rest
}: FrameProps) {
  return (
    <div className={cx(cls.frame, className)} {...rest}>
      <div className={cls.frameTop}>
        <Elbow corner="tl" color={color}>{topLabel}</Elbow>
        {top ?? <Bar color={color} />}
        {title != null && (
          <>
            <Title color={color}>{title}</Title>
            <Bar color={color} cap="right" length="xs" />
          </>
        )}
      </div>
      <Stack>
        {sidebar}
        <Block color={color} fill />
      </Stack>
      <div className={cls.frameContent}>{children}</div>
      <div className={cls.frameBottom}>
        <Elbow corner="bl" color={color}>{bottomLabel}</Elbow>
        {bottom ?? <Bar color={color} cap="right" />}
      </div>
    </div>
  );
}

export interface SplitFrameProps extends Omit<DivProps, "title"> {
  color?: LcarsColor;
  title?: ReactNode;
  /** Inhalt des oberen Bereichs (z. B. DataCascade, Readout) */
  header?: ReactNode;
  /** Seitenleiste oben bzw. unten (Buttons/Blocks); wird jeweils aufgefüllt */
  headerSidebar?: ReactNode;
  sidebar?: ReactNode;
  /** Labels in den beiden mittleren Elbows */
  upperLabel?: ReactNode;
  lowerLabel?: ReactNode;
  /** Ersetzt die Balken neben den mittleren Elbows */
  upperBar?: ReactNode;
  lowerBar?: ReactNode;
}

/** TNG-Hauptlayout: oberer Bereich und unterer Bereich, getrennt durch zwei Elbows. */
export function SplitFrame({
  color,
  title,
  header,
  headerSidebar,
  sidebar,
  upperLabel,
  lowerLabel,
  upperBar,
  lowerBar,
  className,
  children,
  ...rest
}: SplitFrameProps) {
  return (
    <div className={cx(cls.frame, className)} data-layout="split" {...rest}>
      <Stack>
        {headerSidebar}
        <Block color={color} fill />
      </Stack>
      <div className={cx(cls.frameContent, cls.frameHeader)}>
        {header}
        {title != null && <Title color={color}>{title}</Title>}
      </div>
      <div className={cls.frameBottom}>
        <Elbow corner="bl" color={color}>{upperLabel}</Elbow>
        {upperBar ?? <Bar color={color} cap="right" />}
      </div>
      <div className={cls.frameTop}>
        <Elbow corner="tl" color={color}>{lowerLabel}</Elbow>
        {lowerBar ?? <Bar color={color} cap="right" />}
      </div>
      <Stack>
        {sidebar}
        <Block color={color} fill />
      </Stack>
      <div className={cls.frameContent}>{children}</div>
    </div>
  );
}
