import { chunkify } from './chunkify';

export async function asyncMap<T, R>(values: T[], transform: (value: T) => Promise<R>): Promise<R[]> {
  if (values.length === 0) {
    return [];
  }
  const ret: R[] = [];
  for (const value of values) {
    ret.push(await transform(value));
  }
  return ret;
}

export async function asyncMapParallel<T, R>(values: T[], concurrency: number, transform: (value: T) => Promise<R>): Promise<R[]> {
  if (values.length === 0) {
    return [];
  }
  return (await Promise.all(chunkify(values, Math.ceil(values.length / concurrency)).map(async chunk => asyncMap(chunk, transform)))).flat();
}
