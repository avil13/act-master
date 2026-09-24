import { describe, expect, it } from 'vitest';
import { ActValidationError, ValidateError, validateItem } from '..';
import { getSourcesByPath } from '../../01-list-all-files';
import { actionFilter, IFilteredItem } from '../../02-filter-list';
import { Project } from 'ts-morph';

// метод для получения отфильтрованной сущности
const getItem = (actionPath: string): IFilteredItem => {
  const sourceFileList = getSourcesByPath(actionPath, __dirname);
  const res = actionFilter(sourceFileList[0]);

  if (!res) {
    throw new Error('wrong Action');
  }
  return res;
};

describe('validateItem', () => {
  it('OK: no arg', () => {
    const item = getItem('./mocks/action-no-arg.ts');

    expect(validateItem(item)).toBe(true);
  });

  it('ERR: has arg, no type', () => {
    const item = getItem('./mocks/empty-arguments-type.ts');

    expect(() => validateItem(item)).toThrow(
      new ValidateError(item, ActValidationError.emptyArgumentsType)
    );
  });

  it('OK: has arg, default arg type', () => {
    const item = getItem('./mocks/default-arguments-type.ts');

    expect(validateItem(item)).toBe(true);
  });

  it('ERR: name is string', () => {
    const item = getItem('./mocks/wrong-name-type.ts');

    expect(() => validateItem(item)).toThrow(
      new ValidateError(item, ActValidationError.wrongNameType)
    );
  });

  it('ERR: exec return type', () => {
    const item = getItem('./mocks/no-exec-return-type.ts');

    //
    expect(() => validateItem(item)).toThrow(
      new ValidateError(item, ActValidationError.noReturnTypeExec)
    );
  });

  it('ERR: transform return type', () => {
    const item = getItem('./mocks/no-transform-return-type.ts');

    expect(() => validateItem(item)).toThrow(
      new ValidateError(item, ActValidationError.noReturnTypeTransform)
    );
  });

  it('OK: transform return type', () => {
    const item = getItem('./mocks/good-transform-return-type.ts');

    expect(validateItem(item)).toBe(true);
  });
});

describe('validate function actions', () => {
  it.each([
    ['function GetBalance(day: string): number { return 1; }', null],
    ['async function GetBalance(day = "today"): Promise<number> { return 1; }', null],
    ['function GetBalance(day): number { return 1; }', ActValidationError.emptyArgumentsType],
    ['function GetBalance(day: string) { return 1; }', ActValidationError.noReturnTypeExec],
    ['function (day: string): number { return 1; }', ActValidationError.invalidFunctionAction],
    ['(day: string): number => 1', ActValidationError.invalidFunctionAction],
    ['missingFunction', ActValidationError.invalidFunctionAction],
  ])('validates %s', (expression, error) => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('/balance.act.ts', `
      import { fn2act } from 'act-master';
      export const balance = fn2act(${expression});
    `);
    const item = actionFilter(sourceFile);
    if (!item) throw new Error('Function action was not discovered');

    if (error) {
      expect(() => validateItem(item)).toThrow(new ValidateError(item, error));
    } else {
      expect(validateItem(item)).toBe(true);
    }
  });
});
