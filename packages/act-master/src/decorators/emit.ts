import { ActMasterAction, ActMasterActionDevDI } from '../types';

/** @deprecated use $emit?: EmitAction property*/
export function Emit() {
  /** @deprecated use $emit?: EmitAction property*/
  return (target: ActMasterAction, propertyKey: string) => {
    Object.defineProperty(target as ActMasterActionDevDI, 'useEmit', {
      value: function (emitter: any) {
        this[propertyKey] = emitter;
      },
    });
  };
}
