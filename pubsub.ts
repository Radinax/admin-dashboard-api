export default function pubsub<T extends { [key: string]: any[] }>() {
  const map = new Map<keyof T, Set<Function>>();

  const pub = <K extends keyof T>(channel: K, ...args: T[K]) => {
    map.get(channel)?.forEach((fn) => fn(...args));
  };

  const sub = <K extends keyof T>(
    channel: K,
    callback: (...args: T[K]) => any,
  ) => {
    const listeners = map.get(channel) ?? new Set();
    listeners.add(callback);
    map.set(channel, listeners);
    return () => {
      listeners.delete(callback);
    };
  };

  return [pub, sub] as const;
}
