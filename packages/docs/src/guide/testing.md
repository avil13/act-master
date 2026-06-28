# ActMaster test-utils

## ActTest

`ActTest` - is a class that helps write tests for `act-master`.

ActTest - is a singleton class with static methods.

To write tests, use the method `ActTest.getInstance(options?: ActMasterOptions)`.

It creates an instance of the `act-master` class, which can be easily used afterwards.

Below, instead of an example action, you will be testing your action.

## Testing Act

### Example 1:

```ts
import { ActTest } from 'act-master';

it('Example result', async () => {
  const $act = ActTest.getInstance();

  // Arrange
  const action: ActMasterAction = {
    name: 'SomeName',
    exec() {
      return 42;
    },
  };

  $act.addActions([action]);

  // Act
  await $act.exec('SomeName');

  // Assert
  expect(ActTest.getLastResult()).toBe(42);
});
```

---

## Testing subscription

You can also call some event and check your subscription.

### Example 2:
```ts
import { ActTest } from 'act-master';

it('Example check subscription', async () => {
  // Arrange
  const $act = ActTest.getInstance();

  const action: ActMasterAction = {
    name: 'SomeName',
    exec() {
      return 42;
    },
  };

  $act.addActions([action]);

  const mockFn = jest.fn();

  $act.subscribe('SomeName', mockFn);

  // Act
  await ActTest.exec('SomeName');

  // Assert
  expect(mockFn).toBeCalledTimes(1);
});
```

---

## List of available methods

| Method Name     | Description                                                                       |
| --------------- | --------------------------------------------------------------------------------- |
| getInstance     | Returns the ActMaster instance                                                    |
| resetAll        | Resets the ActMaster settings                                                     |
| getLastResult   | Returns the last value                                                            |
| addActions      | Adds actions                                                                      |
| makeActionStub  | Create empty action for testing                                                   |
| exec            | Execute action                                                                    |
| subscribe       | Subscribes to action                                                              |
| entityCount     | Returns the number of entities ('actions' \| 'waiters' \| 'listeners' \| 'di') \* |
| removeSingleton | Removes singleton ActMaster \*                                                    |

> `*` -Use if you know what it's for

More examples in [repo](https://github.com/avil13/vue-act-master/tree/master/packages/act-master/src/__tests__)
