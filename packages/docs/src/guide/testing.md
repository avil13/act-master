---
title: Testing | Act-Master
description: Test your Act-Master actions with ActTest utilities. Isolated test instances, result assertions, subscription testing, and a full list of available test methods.
head:
  - - meta
    - name: description
      content: Test your Act-Master actions with ActTest utilities. Isolated test instances, result assertions, subscription testing, and a full list of available test methods.
  - - meta
    - name: keywords
      content: act-master testing, ActTest, action unit tests, jest act-master, subscription testing, test actions typescript
  - - meta
    - property: og:title
      content: Testing | Act-Master
  - - meta
    - property: og:description
      content: Test your Act-Master actions with ActTest utilities. Isolated test instances, result assertions, subscription testing, and a full list of available test methods.
  - - meta
    - property: og:url
      content: https://avil13.github.io/act-master/guide/testing
  - - link
    - rel: canonical
      href: https://avil13.github.io/act-master/guide/testing
---

# ActMaster test-utils

## ActTest

`ActTest` - is a class that helps write tests for `act-master`.

Use the static method to create a new `ActMaster` instance for writing tests.

```ts
const $act = ActTest.getInstance(options?: ActMasterOptions);
```

It will have an additional property `t` that helps with testing. (`$act.t`)

```ts
// Create a new test act
const testAct = $act.t.makeActionStub({ name: 'HelloTest1' })
$act.addAction(testAct);

// Create a new test act and add it immediately
$act.t.makeAndAddActionStub({ name: 'HelloTest2' })

// testing
$act.exec('HelloTest1');
$act.exec('HelloTest2');

// Get the count of entities of a specific type
$act.t.entityCount('actions')
$act.t.entityCount('watchers')
$act.t.entityCount('listeners')
$act.t.entityCount('di')
```

Below, instead of an example action, you will be testing your action.

## Testing Act

### Example 1:

```ts
import { ActTest } from 'act-master';

it('Example result', async () => {
  const $act = ActTest.getInstance();

  // Arrange - import your action that you want to test
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

  // Arrange - import your action that you want to test
  const action: ActMasterAction = {
    name: 'SomeName',
    exec() {
      return 42;
    },
  };

  $act.addActions([action]);

  const mockFn = vi.fn();

  $act.subscribe('SomeName', mockFn);

  // Act
  await ActTest.exec('SomeName');

  // Assert
  expect(mockFn).toBeCalledTimes(1);
});
```

---

## List of available methods

| Method Name          | Description                                                                       |
|----------------------|-----------------------------------------------------------------------------------|
| getInstance          | Returns the ActMaster instance                                                    |
| makeActionStub | Creates a stub action without adding it to the instance |
| makeAndAddActionStub | Creates a stub action and immediately adds it to the instance |
| entityCount          | Returns the number of entities ('actions' \| 'waiters' \| 'listeners' \| 'di') \* |

More examples in [repo](https://github.com/avil13/act-master/tree/master/packages/act-master/src/__tests__)
