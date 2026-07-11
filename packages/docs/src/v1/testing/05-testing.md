# ActMaster test-utils

## ActTest

`ActTest` - is a class that helps write tests for `act-master`.

ActTest - is a singleton class with static methods.

To write tests, use the method `ActTest.getInstance(options?: ActMasterOptions)`.

It creates an instance of the `act-master` class, which can be easily used afterwards.

Below, instead of an example action, you will be testing your action.

## Example:


```ts
// ... base settings
import { ActTest } from 'vue-act-master'; // OR 'act-master';

const $act = ActTest.getInstance();

beforeEach(() => {
  ActTest.resetAll();
});

// test

it('Example result', async () => {
  const action: ActMasterAction = {
    name: 'SomeName',
    exec() {
      return 42;
    }
  }

  $act.addActions([action]);

  await $act.exec('SomeName');

  expect(ActTest.getLastResult()).toBe(42);
});
```

---

You can also call some event and check your subscription.

```ts
// ... base settings
import { ActTest } from 'vue-act-master'; // OR 'act-master';

const $act = ActTest.getInstance();

beforeEach(() => {
  ActTest.resetAll();
});

// test

it('Example check subscription', async () => {
  const action: ActMasterAction = {
    name: 'SomeName',
    exec() {
      return 42;
    }
  }

  $act.addActions([action]);

  const mockFn = jest.fn();

  $act.subscribe('SomeName', mockFn);

  await ActTest.exec('SomeName');

  expect(mockFn).toBeCalledTimes(1);
});
```


## List of available methods

| Method Name  |  Description
|---	|---	|
| getInstance      | Returns the ActMaster instance
| resetAll         | Resets the ActMaster settings
| getLastResult    | Returns the last value
| addActions       | Adds actions
| makeActionStub   | Create empty action for testing
| exec             | Execute action
| subscribe        | Subscribes to action
| entityCount      | Returns the number of entities ('actions' \| 'waiters' \| 'listeners' \| 'di') *
| removeSingleton  | Removes singleton ActMaster *


> `*` -Use if you know what it's for








