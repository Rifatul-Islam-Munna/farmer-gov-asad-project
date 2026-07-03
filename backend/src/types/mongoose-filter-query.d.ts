import 'mongoose';

declare module 'mongoose' {
  export type FilterQuery<T> = Record<string, any>;
}
