import type { ActMasterAction } from '../types';

interface FunctionAction<F extends (...args: any[]) => any> extends ActMasterAction {
  exec: F;
}

export const functionToAction = <F extends (...args: any[]) => any>(
  func: F
): FunctionAction<F> => {
  if (typeof func !== 'function' || !func.name) {
    throw new Error(`Pass not valid function: "${func}"`);
  }
  return {
    name: func.name,
    exec: func,
  };
};

export const fn2act = functionToAction;
