import { it, expect } from 'vitest';
import { actionFilter } from '..';
import { getSourcesByPath } from '../../01-list-all-files';
import { Project } from 'ts-morph';

it('filter files', () => {
  const listFiles = getSourcesByPath(['../../__fixtures__/**/*.ts'], __dirname);

  const list = listFiles.filter((item) => actionFilter(item));

  expect(list.length).toBe(3);
});

it('preserves discovery of a class even when its file also exports a helper value', () => {
  const project = new Project({ useInMemoryFileSystem: true });
  const file = project.createSourceFile('/balance.act.ts', `
    import { fn2act } from 'act-master';
    export const helper = fn2act(function Helper(): number { return 1; });
    export class Balance {
      readonly name = 'Balance';
      exec(): number { return 1; }
    }
  `);
  expect(actionFilter(file)).toMatchObject({ kind: 'class' });
});

it.each([
  ["import { fn2act } from 'act-master';", 'export const balance = fn2act(function GetBalance(day: string): number { return 1; });'],
  ["import { functionToAction as toAct } from 'act-master';", 'export const balance = toAct(function GetBalance(day: string): number { return 1; });'],
  ["import * as am from 'act-master';", 'export default am.fn2act(function GetBalance(day: string): number { return 1; });'],
  ["import { fn2act } from 'act-master';", 'function GetBalance(day: string): number { return 1; } export const balance = fn2act(GetBalance);'],
  ["import { fn2act } from 'act-master';", 'const GetBalance = (day: string): number => 1; export const balance = fn2act(GetBalance);'],
  ["import { fn2act } from 'act-master';", 'const handler = function GetBalance(day: string): number { return 1; }; export const balance = fn2act(handler);'],
])('discovers an exported function action: %s %s', (imports, declaration) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const file = project.createSourceFile('/balance.act.ts', `${imports}\n${declaration}`);
  const item = actionFilter(file);

  expect(item).toMatchObject({ kind: 'function', actionName: 'GetBalance' });
});

it.each([
  "import { fn2act } from 'another-package'; export const balance = fn2act(function GetBalance(): number { return 1; });",
  "function fn2act(fn: Function) { return fn; } export const balance = fn2act(function GetBalance(): number { return 1; });",
  "import { fn2act } from 'act-master'; const balance = fn2act(function GetBalance(): number { return 1; });",
  "import { fn2act } from 'act-master'; fn2act(function GetBalance(): number { return 1; });",
])('ignores unrelated helpers and actions without an export', (code) => {
  const project = new Project({ useInMemoryFileSystem: true });
  expect(actionFilter(project.createSourceFile('/balance.act.ts', code))).toBe(false);
});
