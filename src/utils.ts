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
