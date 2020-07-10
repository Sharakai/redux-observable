import { Action } from 'redux';
import { Observable } from 'rxjs';
import { StateObservable } from './StateObservable';

export type ExtractEpicGeneric<
  E extends Epic,
  K extends 'input' | 'output' | 'state' | 'dependencies'
  > = E extends Epic<infer I, infer O, infer S, infer D>
  ? { input: I; output: O; state: S; dependencies: D }[K]
  : never;

export declare interface Epic<
  Input extends Action = any,
  Output extends Input = Input,
  State = any,
  Dependencies = any
> {
  (
    action$: Observable<Input>,
    state$: StateObservable<State>,
    dependencies: Dependencies
  ): Observable<Output>;
}
