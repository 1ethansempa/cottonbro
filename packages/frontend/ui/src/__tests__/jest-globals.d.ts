declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;
declare const jest: {
  fn: <T extends (...args: any[]) => any>(implementation?: T) => T;
};
