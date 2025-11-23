// Edge-safe helpers (no Node-only APIs)
export const cacheHeader = (s: number) =>
  `public, s-maxage=${s}, stale-while-revalidate=600`;

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]) =>
  keys.reduce((acc, k) => ((acc[k] = obj[k]), acc), {} as Pick<T, K>);
