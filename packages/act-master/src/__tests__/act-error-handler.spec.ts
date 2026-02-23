import { expect, it, vi } from 'vitest';
import { ActTest } from '../test-utils';

it('ErrorHandler app', async () => {
  // Arrange
  const errMock = vi.fn();

  const $act = ActTest.getInstance({
    errorHandlerEventName: 'OnError',
    actions: [
      {
        name: 'OnError',
        exec: errMock,
      },
      {
        name: 'SomeName',
        exec() {
          throw new Error('Bad time');
        },
      },
    ],
  });

  // Act
  await $act.exec('SomeName');

  // Assert
  expect(errMock).lastCalledWith(new Error('Bad time'));
});

it('ErrorHandler exec', async () => {
  // Arrange
  const errMock = vi.fn();
  const errMethodMock = vi.fn();

  const $act = ActTest.getInstance({
    errorHandlerEventName: 'OnError',
    actions: [
      {
        name: 'OnError',
        exec: errMock,
      },
      {
        name: 'OnErrorMethod',
        exec: errMethodMock,
      },
      {
        errorHandlerEventName: 'OnErrorMethod',
        name: 'SomeName',
        exec() {
          throw new Error('Bad time 2');
        },
      },
    ],
  });

  // Act
  await $act.exec('SomeName');

  // Assert
  expect(errMock).not.toBeCalled();
  expect(errMethodMock).lastCalledWith(new Error('Bad time 2'));
});
