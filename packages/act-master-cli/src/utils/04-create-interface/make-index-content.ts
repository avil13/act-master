import { ConfigManager } from '../../lib/config-manager';
import { ActCliConfig } from '../../types';
import {
  ImportDeclarationStructure,
  OptionalKind,
  Project,
  VariableDeclarationKind,
} from 'ts-morph';
import { IFilteredItem } from '../02-filter-list/index';
import { normalizePathAlias } from '../alias-helper';

const configManager = new ConfigManager();

const getImportName = (item: IFilteredItem): string => {
  if (item.kind === 'function') return item.exportName;

  const classDeclaration = item.classDeclaration;

  const name = classDeclaration.getName();

  if (!name) {
    throw new Error(`Empty name ${item.classDeclaration}`);
  }

  return name;
};

const getInitializer = (item: IFilteredItem): string => {
  const importName = getImportName(item);
  if (item.kind === 'function') {
    // TypeScript widens Function.name to string. Preserve the source name both
    // in the generated types and in the registered instance.
    return `Object.assign(${importName}, { name: ${JSON.stringify(item.actionName)} as const })`;
  }
  return `new ${importName}()`;
};

const getInitializerList = (items: IFilteredItem[]) => {
  const str = items.map((item) => getInitializer(item)).join(',\n ');
  return `[\n ${str}\n]`;
};

export const getImportDeclarations = (
  items: IFilteredItem[],
  config: ActCliConfig
): OptionalKind<ImportDeclarationStructure>[] => {
  return items.map((item) => {
    const importName = getImportName(item);
    const moduleSpecifier = normalizePathAlias(
      item.sourceFile.getFilePath(),
      config
    );

    return item.kind === 'function' && item.isDefaultExport
      ? { defaultImport: importName, moduleSpecifier }
      : { namedImports: [{ name: importName }], moduleSpecifier };
  });
};

/**
 * Создаем файл со списком подключаемых экшенов
 *
 * @param filePath
 * @param items
 * @param isWrite
 */
export const makeIndexContent = async (
  filePath: string,
  items: IFilteredItem[],
  isWrite = false,
  prefix = ''
) => {
  const project = new Project();

  const sourceFile = project.createSourceFile(filePath);

  const importDeclaration = sourceFile.addImportDeclaration({
    moduleSpecifier: 'act-master',
  });

  if (prefix) {
    sourceFile.insertStatements(0, prefix);
  }

  // importDeclaration.addNamedImport('ActMasterAction');
  importDeclaration.addNamedImports([
    { name: 'Acts', isTypeOnly: true },
    { name: 'MapAct', isTypeOnly: true },
    { name: 'Names', isTypeOnly: true },
    { name: 'Subs', isTypeOnly: true },
  ]);

  sourceFile.insertStatements(1, '');

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: 'actions',
        // type: 'ActMasterAction[]',
        initializer: getInitializerList(items),
      },
    ],
  });

  const config = await configManager.getConfig();

  sourceFile.addImportDeclarations(getImportDeclarations(items, config));

  // Add Types
  const typeDeclarations = `
declare module 'act-master' {
  export interface ActGenerated {
    acts: Acts<typeof actions>;
    map: MapAct<typeof actions>;
    subs: Subs<typeof actions>;
    names: Names<typeof actions>;
    readonly actionList: typeof actions;
  }

  export interface ActMaster {
    exec: Acts<typeof actions>;
  }
}`;

  sourceFile.addStatements(typeDeclarations);

  sourceFile.formatText({
    ensureNewLineAtEndOfFile: true,
    indentSize: 2,
  });

  if (isWrite) {
    await sourceFile.save();
  }

  return sourceFile.getFullText();
};
