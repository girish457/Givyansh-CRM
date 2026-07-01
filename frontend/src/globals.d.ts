// Fallback declarations for standard JavaScript/DOM globals when TS standard library is missing
interface Array<T> {
  length: number;
  slice(start?: number, end?: number): T[];
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
  filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
  filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
  join(separator?: string): string;
  includes(searchElement: T, fromIndex?: number): boolean;
  [Symbol.iterator](): IterableIterator<T>;
}

interface ArrayConstructor {
  new(arrayLength?: number): any[];
  new <T>(arrayLength: number): T[];
  new <T>(...items: T[]): T[];
  (arrayLength?: number): any[];
  <T>(arrayLength: number): T[];
  <T>(...items: T[]): T[];
  isArray(arg: any): arg is any[];
}
declare var Array: ArrayConstructor;

interface Date {
  toString(): string;
  toDateString(): string;
  toTimeString(): string;
  toLocaleString(): string;
  toLocaleDateString(): string;
  toLocaleTimeString(): string;
  valueOf(): number;
  getTime(): number;
}
interface DateConstructor {
  new(): Date;
  new(value: number | string | Date): Date;
  (): string;
}
declare var Date: DateConstructor;

interface JSON {
  parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;
  stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
  stringify(value: any, replacer?: (string | number)[] | null, space?: string | number): string;
}
declare var JSON: JSON;

interface Promise<T> {
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
}
interface PromiseConstructor {
  all<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T[]>;
}
declare var Promise: PromiseConstructor;

interface String {
  length: number;
  trim(): string;
  toLowerCase(): string;
  toUpperCase(): string;
  charAt(pos: number): string;
  includes(searchString: string, position?: number): boolean;
}

declare function alert(message?: any): void;
declare function confirm(message?: string): boolean;

// Symbol definitions
interface SymbolConstructor {
  readonly iterator: unique symbol;
}
declare var Symbol: SymbolConstructor;

interface IterableIterator<T> {
  next(value?: any): IteratorResult<T>;
  [Symbol.iterator](): IterableIterator<T>;
}

interface IteratorResult<T> {
  done: boolean;
  value: T;
}

declare namespace React {
  interface FormEvent<T = Element> {
    preventDefault(): void;
  }
}

// Fallback for global types
interface Boolean {}
interface Number {}
interface Object {}
interface RegExp {}
interface Function {}
interface IArguments {}

declare module 'rollup/parseAst' {
  export function parseAst(code: string, options?: any): any;
  export function parseAstAsync(code: string, options?: any): Promise<any>;
}

