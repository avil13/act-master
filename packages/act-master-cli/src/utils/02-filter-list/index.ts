import {
  type ArrowFunction,
  type CallExpression,
  type ClassDeclaration,
  type FunctionDeclaration,
  type FunctionExpression,
  Node,
  type SourceFile,
} from 'ts-morph';

interface ClassAction {
  kind: 'class';
  sourceFile: SourceFile;
  classDeclaration: ClassDeclaration;
}

interface FunctionAction {
  kind: 'function';
  sourceFile: SourceFile;
  exportName: string;
  isDefaultExport: boolean;
  actionName?: string;
  functionDeclaration?: FunctionDeclaration | FunctionExpression | ArrowFunction;
}

export type IFilteredItem = ClassAction | FunctionAction;

const filterActionClasses = (clsDeclItem: ClassDeclaration): boolean => {
  const name = clsDeclItem.getProperty('name');
  const execSrc = clsDeclItem.getInstanceMethod('exec');
  return (name && execSrc && true) || false;
};

/**
 * Если item не экшен, то возвращет false
 *
 * @param sourceFile {SourceFile}
 */
export const actionFilter = (sourceFile: SourceFile): false | IFilteredItem => {
  const classes: ClassAction[] = sourceFile.getClasses()
    .filter(filterActionClasses)
    .map((classDeclaration) => ({ kind: 'class', sourceFile, classDeclaration }));

  // Keep existing class discovery unchanged, including files with helper values.
  if (classes.length) return classes.length === 1 ? classes[0] : false;

  const items: FunctionAction[] = [];

  const helperNames = new Set<string>();
  const namespaces = new Set<string>();
  const helpers = new Set(['fn2act', 'functionToAction']);

  for (const declaration of sourceFile.getImportDeclarations()) {
    if (declaration.getModuleSpecifierValue() !== 'act-master') continue;
    for (const specifier of declaration.getNamedImports()) {
      if (helpers.has(specifier.getName())) {
        helperNames.add(specifier.getAliasNode()?.getText() ?? specifier.getName());
      }
    }
    const namespace = declaration.getNamespaceImport();
    if (namespace) namespaces.add(namespace.getText());
  }

  const isHelperCall = (node: Node | undefined): node is CallExpression => {
    if (!node || !Node.isCallExpression(node)) return false;
    const expression = node.getExpression();
    return (Node.isIdentifier(expression) && helperNames.has(expression.getText()))
      || (Node.isPropertyAccessExpression(expression)
        && namespaces.has(expression.getExpression().getText())
        && helpers.has(expression.getName()));
  };

  for (const statement of sourceFile.getVariableStatements()) {
    if (!statement.isExported()) continue;
    for (const declaration of statement.getDeclarations()) {
      const initializer = declaration.getInitializer();
      if (Node.isIdentifier(declaration.getNameNode()) && isHelperCall(initializer)) {
        items.push(getFunctionAction(sourceFile, initializer, declaration.getName(), false));
      }
    }
  }

  for (const assignment of sourceFile.getExportAssignments()) {
    const expression = assignment.getExpression();
    if (!assignment.isExportEquals() && isHelperCall(expression)) {
      const item = getFunctionAction(sourceFile, expression, '', true);
      item.exportName = item.actionName || 'default';
      items.push(item);
    }
  }

  // Preserve the existing convention: one action per source file.
  return items.length === 1 ? items[0] : false;
};

function getFunctionAction(
  sourceFile: SourceFile,
  call: CallExpression,
  exportName: string,
  isDefaultExport: boolean
): FunctionAction {
  const item: FunctionAction = { kind: 'function', sourceFile, exportName, isDefaultExport };
  const argument = call.getArguments()[0];

  if (argument && Node.isFunctionExpression(argument)) {
    item.functionDeclaration = argument;
    item.actionName = argument.getName();
  } else if (argument && Node.isIdentifier(argument)) {
    const name = argument.getText();
    const declaration = sourceFile.getFunction(name);
    if (declaration) {
      item.functionDeclaration = declaration;
      item.actionName = name;
    } else {
      const initializer = sourceFile.getVariableDeclaration(name)?.getInitializer();
      if (initializer && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
        item.functionDeclaration = initializer;
        item.actionName = Node.isFunctionExpression(initializer)
          ? initializer.getName() || name
          : name;
      }
    }
  }

  return item;
}

export const getFilteredSourceFiles = (
  listFiles: SourceFile[]
): IFilteredItem[] => {
  return listFiles
    .map((item) => actionFilter(item))
    .filter((item) => item) as IFilteredItem[];
};
