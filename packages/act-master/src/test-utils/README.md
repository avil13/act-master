# ActMaster test-utils

`ActTest` - is a class that helps write tests for `act-master`.

ActTest - is a singleton class with static methods.

To write tests, use the method `ActTest.getInstance(options?: ActMasterOptions)`.

It creates an instance of the `act-master` class, which can be easily used afterwards.

## Example:


###### default configuration for examples

```ts
// Basic part, same for all examples

import { ActTest } from 'act-master/test';

// $act - is ActMaster instance with additional props for testing in `$act.t`
const $act = ActTest.getInstance();

// ...
```

```ts
// ... base settings

it('Example result', async () => {
  const $act = ActTest.getInstance();

  const action: ActMasterAction = {
    name: 'SomeName',
    exec() {
      return 42;
    }
  }

  $act.addActions([action]);

  const result = await $act.exec('SomeName');

  expect(result).toBe(42);
});
```

---

You can also call some event and check your subscription.

```ts
// ... base settings

it('Example check subscription', async () => {
  const $act = ActTest.getInstance();

  const action: ActMasterAction = {
    name: 'SomeName',
    exec() {
      return 42;
    }
  }

  $act.addActions([action]);

  const mockFn = vi.fn();

  $act.subscribe('SomeName', mockFn);

  await $act$.exec('SomeName');

  expect(mockFn).toBeCalledTimes(1);

  expect($act.t.entityCount('actions')).toBe(1)
  expect($act.t.entityCount('watchers')).toBe(0)
  expect($act.t.entityCount('listeners')).toBe(1)
});
```


## List of available methods

| Method Name  |  Description
|---	|---	|
| getInstance      | Returns the ActMaster instance
| entityCount      | Returns the number of entities (`actions` \| `watchers` \| `listeners` \| `di`) *


> `*` -Use if you know what it's for








