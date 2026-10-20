export const cx = (base: string, extra?: string) =>
  extra ? `${base} ${extra}` : base;
