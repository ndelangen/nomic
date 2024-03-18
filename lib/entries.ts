type ValueOf<T> = T[keyof T];
type Entries<T> = [keyof T, ValueOf<T>][];

export function entries<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}

// export function keys<T extends object>(obj: T): (keyof T)[] {
//   return Object.keys(obj) as (keyof T)[];
// }

export function values<T extends object>(obj: T): ValueOf<T>[] {
  return Object.values(obj) as ValueOf<T>[];
}
