import { formatErrorMessage } from '../../lib/log-messages/log-result';
import { IFilteredItem } from './../02-filter-list';

export enum ActValidationError {
  noExecMethod = 'NO EXEC METHOD',
  emptyArgumentsType = 'EMPTY ARGUMENTS TYPE',
  wrongNameType = 'WRONG NAME TYPE',
  noReturnTypeExec = 'NO RETURN TYPE EXEC',
  noReturnTypeTransform = 'NO RETURN TYPE TRANSFORM',
  invalidFunctionAction = 'INVALID FUNCTION ACTION',
}

export class ValidateError extends Error {
  readonly filePath: string;
  readonly className?: string;
  readonly type: ActValidationError;

  constructor(item: IFilteredItem, type: ActValidationError) {
    super();
    this.filePath = item.sourceFile.getFilePath();
    this.className = item.kind === 'class'
      ? item.classDeclaration.getName() || ''
      : item.actionName || item.exportName;
    this.type = type;

    this.message = formatErrorMessage(this.className, this.type, this.filePath);
  }
}

export const validateItem = (item: IFilteredItem): ValidateError | true => {
  if (item.kind === 'function' && (!item.functionDeclaration || !item.actionName)) {
    throw new ValidateError(item, ActValidationError.invalidFunctionAction);
  }

  const classDeclaration = item.kind === 'class' ? item.classDeclaration : undefined;
  const execDeclaration = item.kind === 'class'
    ? item.classDeclaration.getInstanceMethod('exec')
    : item.functionDeclaration;

  if (!execDeclaration) {
    throw new ValidateError(item, ActValidationError.noExecMethod);
  }

  // no arg types
  execDeclaration.getParameters().forEach((parameter) => {
    if (!parameter.getTypeNode() && !parameter.getInitializer()) {
      throw new ValidateError(item, ActValidationError.emptyArgumentsType);
    }
  });

  // name === string
  const nameProp = classDeclaration?.getProperty('name');
  const isStringLiteral = nameProp
    ?.getInitializer()
    ?.getType()
    .isStringLiteral();

  if (item.kind === 'class' && !isStringLiteral) {
    throw new ValidateError(item, ActValidationError.wrongNameType);
  }

  // return type exec !== undefined
  if (!execDeclaration.getReturnTypeNode()) {
    throw new ValidateError(item, ActValidationError.noReturnTypeExec);
  }

  // return type transform is undefined or any
  const transformMethodDecl = classDeclaration?.getMethod('transform');
  if (transformMethodDecl) {
    const transformReturnType = transformMethodDecl?.getStructure().returnType;

    if (transformReturnType === undefined || transformReturnType === 'any') {
      throw new ValidateError(item, ActValidationError.noReturnTypeTransform);
    }
  }

  return true;
};
