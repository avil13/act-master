import path from 'node:path';
import { expect, it } from 'vitest';
import { ModuleKind, ModuleResolutionKind, Project, ScriptTarget, ts } from 'ts-morph';
import * as actMaster from '../../../../../act-master/src';
import { ActTest } from '../../../../../act-master/src/test-utils';
import { getFilteredSourceFiles } from '../../02-filter-list';
import { validateItem } from '../../03-validete-item';
import { makeIndexContent } from '../make-index-content';

it('generates a mixed registry with strict function names, parameters and results', async () => {
  const root = path.resolve('src/__function_action_checks__');
  const libraryDir = `${root}/library`;
  // Compile the current public declarations first, as a consuming application
  // would see them. Its augmentation must not re-type-check library internals.
  const library = new Project({
    compilerOptions: {
      target: ScriptTarget.ESNext,
      module: ModuleKind.ESNext,
      moduleResolution: ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      experimentalDecorators: true,
      declaration: true,
      emitDeclarationOnly: true,
      rootDir: path.resolve('../act-master/src'),
      outDir: libraryDir,
    },
  });
  library.addSourceFileAtPath(path.resolve('../act-master/src/index.ts'));
  library.resolveSourceFileDependencies();
  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ESNext,
      module: ModuleKind.ESNext,
      moduleResolution: ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      experimentalDecorators: true,
      paths: {
        '@/*': [path.resolve('src/*')],
        'act-master': [`${libraryDir}/index.d.ts`],
      },
    },
  });
  for (const file of library.emitToMemory({ emitOnlyDtsFiles: true }).getFiles()) {
    project.createSourceFile(file.filePath, file.text);
  }
  const sources = [
    project.createSourceFile(`${root}/balance.act.ts`, `
      import { fn2act } from 'act-master';
      export const balance = fn2act(function GetBalance(day: string): number { return 100; });
    `),
    project.createSourceFile(`${root}/async-balance.act.ts`, `
      import { functionToAction as toAct } from 'act-master';
      export default toAct(async function GetAsyncBalance(day: string): Promise<number> { return 200; });
    `),
    project.createSourceFile(`${root}/reference.act.ts`, `
      import { fn2act } from 'act-master';
      function GetLabel(prefix: string, count = 1): string { return prefix.repeat(count); }
      export const label = fn2act(GetLabel);
    `),
    project.createSourceFile(`${root}/class.act.ts`, `
      export class ClassAction {
        readonly name = 'ClassAction';
        exec(value: boolean): boolean { return value; }
      }
    `),
  ];
  const items = getFilteredSourceFiles(sources).filter(validateItem);
  expect(items).toHaveLength(4);
  const content = await makeIndexContent(`${root}/actions.ts`, items);
  project.createSourceFile(`${root}/actions.ts`, content);
  project.createSourceFile(`${root}/consumer.ts`, `
    import { act, $act, type ActMasterAction } from 'act-master';
    import { actions } from './actions';
    import { balance } from './balance.act';

    act.init({ actions });
    const result: Promise<number | null> = act().exec('GetBalance', '2026.01.01');
    const asyncResult: Promise<number | null> = act().exec('GetAsyncBalance', '2026.01.01');
    const label: Promise<string | null> = act().exec('GetLabel', 'day');
    const repeated: Promise<string | null> = act().exec('GetLabel', 'day', 2);
    const classResult: Promise<boolean | null> = act().exec('ClassAction', true);
    const proxyResult: Promise<number | null> = $act.GetBalance('2026.01.01');
    act().on('GetBalance', (value: number) => {});
    const direct: number = balance.exec('2026.01.01');
    const compatible: ActMasterAction = balance;
    balance.$isSingleton = true;

    type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
      (<T>() => T extends B ? 1 : 2) ? true : false;
    function check<T extends true>() {}
    const inferred = act().exec('GetBalance', '2026.01.01');
    const inferredAsync = act().exec('GetAsyncBalance', '2026.01.01');
    check<Equal<typeof inferred, Promise<number | null>>>();
    check<Equal<typeof inferredAsync, Promise<number | null>>>();

    // @ts-expect-error Partial names must be rejected.
    act().exec('GetBal');
    // @ts-expect-error The export variable is not the event name.
    act().exec('balance', '2026.01.01');
    // @ts-expect-error Required argument is missing.
    act().exec('GetBalance');
    // @ts-expect-error Wrong argument type.
    act().exec('GetBalance', 2026);
    // @ts-expect-error Extra argument.
    act().exec('GetBalance', '2026.01.01', true);
    // @ts-expect-error The async function still expects a string.
    act().exec('GetAsyncBalance', false);
    // @ts-expect-error Existing class actions retain their argument types.
    act().exec('ClassAction', 'true');
    // @ts-expect-error The result is a number, not a string.
    const wrongResult: Promise<string | null> = act().exec('GetBalance', '2026.01.01');
    // @ts-expect-error The helper itself preserves the function parameters.
    balance.exec(2026);
    // @ts-expect-error The helper itself preserves the function result.
    const wrongDirect: string = balance.exec('2026.01.01');
    // @ts-expect-error Proxy calls retain argument types.
    $act.GetBalance(2026);
    // @ts-expect-error Subscribers receive the function result type.
    act().on('GetBalance', (value: string) => {});
  `);

  const diagnostics = project.getPreEmitDiagnostics();
  expect(project.formatDiagnosticsWithColorAndContext(diagnostics)).toBe('');

  // Execute the generated imports/initializers too: functions are instances,
  // while the existing class form still needs construction.
  const load = (filePath: string): { actions?: actMaster.ActMasterAction[] } => {
    const source = project.getSourceFileOrThrow(filePath).getFullText();
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ESNext },
    });
    const module = { exports: {} };
    const require = (specifier: string) => specifier === 'act-master'
      ? actMaster
      : load(path.resolve('src', `${specifier.slice(2)}.ts`));
    new Function('require', 'module', 'exports', outputText)(require, module, module.exports);
    return module.exports;
  };
  const { actions } = load(`${root}/actions.ts`);
  const dispatcher = ActTest.getInstance({ actions });
  expect(await dispatcher.exec('GetBalance', '2026.01.01')).toBe(100);
  expect(await dispatcher.exec('GetAsyncBalance', '2026.01.01')).toBe(200);
  expect(await dispatcher.exec('GetLabel', 'day', 2)).toBe('dayday');
  expect(await dispatcher.exec('ClassAction', true)).toBe(true);
});
