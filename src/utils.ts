import { CODE_BLOCK } from "./const";

export const countLines = (value: string) => {
  if (!value) {
    return 0;
  }
  return value.split(/\r\n|\r|\n/).length;
};

export const noop = (): void => {};

type Deferred<T> = {
  resolve: (data: T) => void;
  reject: (err: unknown) => void;
  promise: Promise<T>;
};

export const makeDeferred = <T = any>() => {
  const d: Partial<Deferred<T>> = { resolve: noop, reject: noop };

  d.promise = new Promise<T>((resolve, reject) => {
    d.resolve = resolve;
    d.reject = reject;
  });

  return d as Deferred<T>;
};

export const extractFromCodeBlock = (str: string) => {
  if (!str) {
    return "";
  }
  const start = str.indexOf(CODE_BLOCK);
  const end = str.lastIndexOf(CODE_BLOCK);

  if (start === -1 || end === -1 || end <= start) {
    return "";
  }

  return str.substring(start + 3, end).trim();
};
