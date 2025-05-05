export function reactive<T>(
  initial: T,
): [() => T, (v: T) => void, (cb: () => void) => void] {
  let value = initial;
  const listeners: (() => void)[] = [];

  const get = () => value;
  const set = (v: T) => {
    value = v;
    listeners.forEach(cb => cb());
  };
  const subscribe = (cb: () => void) => {
    listeners.push(cb);
  };

  return [get, set, subscribe];
}
