import { merge } from 'rxjs';
import { Epic, ExtractEpicGeneric } from './epic';

/**
 * Infers the array element type
 *
 * @example
 * ElementType<number[]> === number
 * ElementType<(string | number)[]> === string | number
 */
type ElementType<A> = A extends Iterable<infer I> ? I : never;

/**
 * Converts a type-union to intersection
 *
 * @example
 * UnionToIntersection<A | B | C> === A & B & B
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Merges all epics into a single one.
 */
export function combineEpics<Epics extends Epic[]>(...epics: Epic[]): Epic<
  ExtractEpicGeneric<ElementType<Epics>, 'input' | 'output'>,
  ExtractEpicGeneric<ElementType<Epics>, 'output'>,
  UnionToIntersection<ExtractEpicGeneric<ElementType<Epics>, 'state'>>,
  UnionToIntersection<ExtractEpicGeneric<ElementType<Epics>, 'dependencies'>>
> {
  const merger = (...args: Parameters<Epic>) => merge(
    ...epics.map(epic => {
      const output$ = epic(...args);
      if (!output$) {
        throw new TypeError(`combineEpics: one of the provided Epics "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
      }
      return output$;
    })
  );

  // Technically the `name` property on Function's are supposed to be read-only.
  // While some JS runtimes allow it anyway (so this is useful in debugging)
  // some actually throw an exception when you attempt to do so.
  try {
    Object.defineProperty(merger, 'name', {
      value: `combineEpics(${epics.map(epic => epic.name || '<anonymous>').join(', ')})`,
    });
  } catch (e) {}

  return merger;
};
