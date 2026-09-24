import { CancelledAct } from './cancelled';

/**
 * @deprecated use ListenerFunction
 */
export type listenerFunction = (arg: any) => any;
export type ListenerFunction = (arg: any) => any;

export type ValidateInputFn = (
  ...args: any[]
) => true | CancelledAct | any | Promise<true | CancelledAct | any>;

export type autoUnsubscribeArgs = {
  eventName: string;
  listener: ListenerFunction;
  context?: any;
};

export interface DIMap {
  [key: string]: any;
}

export interface IActMaster {
  /*#__PURE__*/ exec: ActExec;
}

export interface ActMasterOptions {
  actions?: ActMasterAction[];
  di?: DIMap;
  // method for calling auto unsubscribe
  autoUnsubscribeCallback?: (args: autoUnsubscribeArgs) => void;
  errorHandlerEventName?: ActEventName;
}

export type devActMasterConfig = {
  autoUnsubscribeCallback: ActMasterOptions['autoUnsubscribeCallback'];
  errorHandlerEventName?: ActEventName;
};

export interface ActMasterAction {
  /**
   * Name of the action
   */
  readonly name: string;
  /**
   * Function executor
   */
  exec: (...args: any[]) => Promise<any> | any;
  /**
   * List of emitNames to be called after
   * TODO: change to ActEventName
   */
  $watch?: string[];
  /**
   * @deprecated
   * Use $watch
   */
  watch?: string[];

  /**
   * An action can have only one result if several calls are made
   */
  $isSingleton?: boolean;
  /**
   * @deprecated
   *  Use $isSingleton
   */
  isSingleExec?: boolean;

  /**
   * Validating arguments before passing them to exec
   */
  $validate?: ValidateInputFn;
  /**
   * @deprecated
   *  Use $validate
   */
  validateInput?: ValidateInputFn;

  /**
   * Pass Dependency to action
   */
  $di?: <T = any>(key: string) => T;
  /**
   * @deprecated
   *  Use $di to inherit from the BaseActMasterAction class
   */
  useDI?: (contexts: { [key: string]: any }) => void;

  /**
   * Pass Emitter to action
   */
  $emit?: EmitAction;
  /**
   * @deprecated
   *  Use $emit inherited from the BaseActMasterAction class
   */
  useEmit?: (emit: EmitAction) => void;

  /**
   * Name of the action that catches the error
   * Use ActName<name> type if you want to check the available name through types
   * @example
   *  $onError: ActName<'OnError'> = 'OnError';
   */
  $onError?: string;
  /**
   * @deprecated
   *  Use $onError
   */
  errorHandlerEventName?: string;

  [key: string]: any;
}

export interface ActMaster {
  exec: ActExec;
}

/**
 * Type to check the name of Act
 */
export type ActName<N extends ActEventName> = N;

export interface ActMasterActionDevDI extends ActMasterAction {
  _DI_CONTAINER_?: {
    readonly [DIName: string]: any;
  };
  // Mapping for decorator {[action.prop]: di.key}
  _DI_MAP_?: {
    [key: string]: string;
  };
}

export interface ActGenerated {
  default: (name: string, ...args: any) => Promise<any>;
  defaultSubs: (
    name: string,
    cb: (data: any) => any,
    ctx?: any
  ) => () => boolean;
  defaultActionList: ActMasterAction[];
  // acts?: any
  // subs?: any
  // map?: any
  // names?: string
}

type _ExecType<K = 'acts'> = K extends keyof ActGenerated
  ? ActGenerated[K]
  : ActGenerated['default'];

type _MapType<K = 'map'> = K extends keyof ActGenerated
  ? ActGenerated[K]
  : Record<ActEventName, ActGenerated['default']>;

type _SubsType<K = 'subs'> = K extends keyof ActGenerated
  ? ActGenerated[K]
  : ActGenerated['defaultSubs'];

type _NameType<K = 'names'> = K extends keyof ActGenerated
  ? ActGenerated[K]
  : string;

// Это нужно только для Vue поэтому код вынесен туда
// type _SubFnFromAct<K = 'subFnFromAct'> = K extends keyof ActGenerated
//   ? ActGenerated[K]
//   : (n: ActEventName) => any;

// #region [ helpers ]
// List of functions for obtaining action types via generation
type Fn = (...args: any) => any;
type IsFn<T> = T extends (...args: any) => any ? T : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
type UnPromise<T> = T extends Promise<infer U> ? U : T;
type UnsubscribeFnType = () => boolean;
type PromiseResult<T> = Promise<Awaited<T>>;
// #endregion

// #region [ for generation ]
type FuncFromAct<T extends { name: string; exec: Fn }> = T extends {
  readonly name: infer N;
  readonly exec: infer F;
}
  ? (
      name: N,
      ...args: Parameters<IsFn<F>>
    ) => PromiseResult<ReturnType<IsFn<F>> | null>
  : never;

type MapFromAct<T extends { name: string; exec: Fn }> = T extends {
  readonly name: infer N;
  readonly exec: infer F;
}
  ? Record<
      N & string,
      (
        ...args: Parameters<IsFn<F>>
      ) => PromiseResult<ReturnType<IsFn<F>> | null>
    >
  : never;
//
type SubsFromAct<T extends { name: string; exec: Fn }> = T extends {
  readonly name: infer N;
  readonly exec: infer F;
}
  ? (
      name: N,
      cb: (data: UnPromise<ReturnType<IsFn<F>>>) => any,
      ctx?: any
    ) => UnsubscribeFnType
  : never;
//
type NamesFromAct<T extends { name: string; exec: Fn }> = T extends {
  readonly name: infer N;
  readonly exec: Fn;
}
  ? N
  : never;

// For generator
/**
 * @example
 * declare module 'act-master' {
 *    export interface ActGenerated {
 *      acts: Acts<typeof actions>;
 *      subs: Subs<typeof actions>;
 *      map: MapAct<typeof actions>;
 *      names: Names<typeof actions>;
 *      subFnFromAct: SubFnFromAct<typeof actions>;
 *    }
 *  }
 */
export type Acts<LS extends ActMasterAction[]> = LS extends (infer A)[]
  ? UnionToIntersection<FuncFromAct<A extends ActMasterAction ? A : never>>
  : never;
//
export type MapAct<LS extends ActMasterAction[]> = LS extends (infer A)[]
  ? UnionToIntersection<MapFromAct<A extends ActMasterAction ? A : never>>
  : never;
//
export type Subs<LS extends ActMasterAction[]> = LS extends (infer A)[]
  ? UnionToIntersection<SubsFromAct<A extends ActMasterAction ? A : never>>
  : never;
//
export type Names<LS extends ActMasterAction[]> = LS extends (infer A)[]
  ? NamesFromAct<A extends ActMasterAction ? A : never>
  : never;
// #endregion

// Execs
export type ActExec = _ExecType;
// Subscriptions

export type ActSubscribeType = _SubsType;
// Names
export type ActEventName = _NameType;
//
export type EmitAction = ActExec;

//
export type ActProxy = _MapType;
