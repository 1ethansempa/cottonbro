export * from "./edge";
export * from "./node";

export const isProd = () => process.env.NODE_ENV === "production";

export const assert = (
  cond: unknown,
  msg = "Assertion failed"
): asserts cond => {
  if (!cond) throw new Error(msg);
};
