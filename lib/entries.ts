type ValueOf<T> = T[keyof T];
type Entries<T> = [keyof T, ValueOf<T>][];

function entries<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}

function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

function values<T extends object>(obj: T): ValueOf<T>[] {
  return Object.values(obj) as ValueOf<T>[];
}

export { entries, keys, values };
