---
title: ActMasterAction | Act-Master
description: Learn how to write ActMasterAction — the core building block of Act-Master. Covers class, object, and function styles, DI, emit, watch, error handling, and validation.
head:
  - - meta
    - name: description
      content: Learn how to write ActMasterAction — the core building block of Act-Master. Covers class, object, and function styles, DI, emit, watch, error handling, and validation.
  - - meta
    - name: keywords
      content: ActMasterAction, act-master action, dependency injection, emit action, watch action, cancel action, validate action, typescript action class
  - - meta
    - property: og:title
      content: ActMasterAction | Act-Master
  - - meta
    - property: og:description
      content: Learn how to write ActMasterAction — the core building block of Act-Master. Covers class, object, and function styles, DI, emit, watch, error handling, and validation.
  - - meta
    - property: og:url
      content: https://avil13.github.io/act-master/guide/act-master-action
  - - link
    - rel: canonical
      href: https://avil13.github.io/act-master/guide/act-master-action
---

# ActMasterAction


An action is the basic logical unit of an action. In this manual it will be referred to as `act`. Unless otherwise specified, it will be referred to as an action.

You can store business logic in it. Call the API. Call other actions. Subscribe to it. Perform validations. Use Dependency Injection (DI).

## Code style

The following will show how code generation can be used to aggregate all acts, so it is recommended to stick to the code style in naming files.
The files must be located in the `act` folder and have the extension `*.act.ts`.

If an act relates only to a certain business logic of a module, you can also place the `act` folder in it.

```sh
src/act
├── auth
│   ├── check.act.ts
│   ├── login.act.ts
│   └── logout.act.ts
└── actions.ts  # file will be generated with "act-master-cli", but you can create it manually
```

```ts
// src/act/actions.ts
import { GetData } from './get-data.act';

export const actions = [
  new GetData(),
];
```

## Adding actions

You can add `act` in different ways.

Suppose you have a variable with an array of actions:

```ts
// actions: ActMasterAction[]
import { actions } from '../act/actions';
```

You can pass it to the options:

```ts
act.init({ actions });
```

Or use helper for in

```ts
act().addActions(actions);
// OR one action
act().addAction(actions[0]);
```


## Action writing

An act is a simple object that corresponds to the `ActMasterAction` interface.

It must necessarily have the `name` property and the `exec` method.

For automatic [code generation](cli#act-master-cli), use a named exported class or an exported `fn2act` / `functionToAction` call wrapping a named function. Keep one action per `*.act.ts` file.

Example of the same act in different styles.

::: code-group
```ts [Class Style (Recommended)]
// get-data.act.ts
import { ActMasterAction } from 'act-master';

export class GetData implements ActMasterAction {
  name = 'GetData';

  async exec(usr: string): Promise<unknown> {
    const response = await fetch(url);
    return response.json();
  }
}
```
```ts [Object style]
// get-data.act.ts
import { ActMasterAction } from 'act-master';

export const getData: ActMasterAction = {
  name: 'GetData',

  async exec(usr: string): Promise<unknown> {
    const response = await fetch(url);
    return response.json();
  }
}
```
```ts [Function style with helper]
// get-data.act.ts
import { fn2act } from 'act-master';

export const getData = fn2act(GetData);

async function GetData(usr: string): Promise<unknown> {
    const response = await fetch(url);
    return response.json();
}
```
:::

### Typed function actions

The helper preserves the function's parameters and return type. The CLI reads its
name from the source and adds the literal event name to the generated registry:

```ts
// src/act/get-balance.act.ts
import { fn2act } from 'act-master';

export const getBalance = fn2act(function GetBalance(day: string): number {
  return day === '2026.01.01' ? 100 : 0;
});
```

Run `npx act-master-cli g` and initialize Act-Master with the generated `actions`.
Calls then use the **function name**, not the exported variable name:

```ts
import { act } from 'act-master';

const balance = act().exec('GetBalance', '2026.01.01'); // Promise<number | null>
act().exec('GetBal'); // TypeScript error: unknown action
act().exec('GetBalance', 2026); // TypeScript error: expected a string
```

`export default fn2act(function GetBalance(...) { ... })` is also supported, as is
`fn2act(GetBalance)` when the named function is declared in the same file. Import
the helper from `act-master`; `functionToAction` and import aliases work too.
Declare parameter and return types just as you would for a class action. Async
functions keep their resolved result type, e.g. `Promise<number | null>`.

TypeScript alone cannot infer a literal name from `Function.name`: use the
generated registry to obtain typed names. A bare, unexported `fn2act(...)` call is
not collected. Inline anonymous functions are rejected by the helper. When
minifying, preserve function names (for example, `keepNames: true` in esbuild),
because the helper checks the function's name before the generated registry runs.

Class actions remain supported. Keep their names literal (`readonly name = 'Name'`)
and retain the generated array's inferred type: widening an action name to string
or annotating the registry as `ActMasterAction[]` weakens name checking.


---

## API of act's

act - has additional features to help simplify the code.


## Emit another Action in Action

If you need to call another action inside the current one, you can do it using the `emit` handler.

It can be connected via the decorator or via the helper.

This way you can build chains of actions that can be stopped by `CancelledAct`.

::: code-group
```ts [With decorator]
// login.act.ts
import { ActMasterAction, Emit, EmitAction } from 'act-master';

export class Login implements ActMasterAction {
  name = 'Login';

  @Emit()
  $emit!: EmitAction;

  async exec(loginData: any): Promise<void> {
    await api.login(loginData);
    this.$emit('SetAuthorized', true);
  }
}
```
```ts [Direct $emit]
// login.act.ts
import { ActMasterAction, EmitAction } from 'act-master';

export class Login implements ActMasterAction {
  name = 'Login';

  $emit!: EmitAction; // injected by act-master

  async exec(loginData: any): Promise<void> {
    await api.login(loginData);
    this.$emit('SetAuthorized', true);
  }
}
```
:::


## DI in Actions

To make the act more independent, a simple Dependency injection (DI) implementation has been added.

It consists of storing entities that we access from act into an internal container.

For example, we have an API. And no matter what we use (REST,GraphQL,gRPC), this interface will not change.

And we just use the implementation of this entity through an interface.

In the code it looks like this:


::: code-group
```ts [add DI with config]
import { SuperAPI } from 'path/to/api';

act.init({
  actions,
  di: {
    api: SuperAPI, // your API class
  }
})
```
```ts [add DI with method]
import { SuperAPI } from 'path/to/api';

act().setDI('api', SuperAPI);
```
:::

Using DI

::: code-group
```ts [With decorator]
// login.act.ts
import { ActMasterAction, UseDI } from 'act-master';

export class Login implements ActMasterAction {
  name = 'Login';

  @UseDI('api')
  private api!: SuperAPI;

  async exec(loginData: any): Promise<void> {
    await this.api.login(loginData);
  }
}
```
```ts [Direct $di]
// login.act.ts
import { ActMasterAction } from 'act-master';

export class Login implements ActMasterAction {
  name = 'Login';

  $di!: <T>(key: string) => T; // injected by act-master

  async exec(loginData: any): Promise<void> {
    const api = this.$di<SuperAPI>('api');
    await api.login(loginData);
  }
}
```
:::


## $onError

If an act completes with an error, errors can be handled with `$onError`.

`$onError` is the `name` of the act that will receive the error if one occurs.

It can be set globally in the config (`errorHandlerEventName`), or per action via `$onError`.

::: warning
If error handling is configured, the result of `act().exec(...)` will be `null` in case of an error.
:::

```ts
act().init({
  // ...
  errorHandlerEventName: 'OnError',
})
```
```ts
// login.act.ts
import { ActMasterAction } from 'act-master';

export class Login implements ActMasterAction {
  name = 'Login';

  // In case of an error, 'OnError' act will catch it
  $onError = 'OnError';

  async exec(loginData: any): Promise<void> {
    await api.login(loginData);
  }
}
```


## Watch

You can launch the action after another one through the `$watch` property.

Any of the actions listed in `$watch`, after execution, will call the current action.

::: warning
Be careful. The action should not follow itself.
Otherwise it will start an endless loop.
:::

```ts
// Action queue
import { ActMasterAction } from 'act-master';

export class FirstAction implements ActMasterAction {
  name = 'FirstAction';
  exec() {
    return 'Leo';
  }
};

export class SecondAction implements ActMasterAction {
  // Names of events after which this action automatically starts.
  $watch = ['FirstAction'];

  name = 'SecondAction';

  exec(data) {
    console.log(data); // "Leo"
    return 'Mike';
  }
};
```


## Cancel Action

An action can be interrupted by returning a special object `CancelledAct`. This will stop the chain of events if you build it using [watch](#watch) or [emit](#emit-another-action-in-action).

```ts
// get-data.act.ts
import { ActMasterAction, CancelledAct } from 'act-master';

export class GetData implements ActMasterAction {
  name = 'GetData';

  exec() {
    // ...
    return new CancelledAct('Some reason to stop action...');
  },
}
```


## Validate before call

Before calling the [exec](exec-and-subscribe#exec) method, you can validate the arguments that are sent to it.

Add a `$validate` method — it receives all arguments intended for `exec`.

Return `true` if valid, or a `CancelledAct` with an error message otherwise.

```ts
// validate-action.ts

import { ActMasterAction, CancelledAct } from 'act-master';

export class GetData implements ActMasterAction {
  name = 'GetData',

  $validate(arg?: any): true | CancelledAct {
    if (typeof arg !== 'number') {
      return new CancelledAct('Validation error', { id: 'Must be a number' });
    }

    return true; // If everything is correct
  }

  async exec(id: number): Promise<any> {
    const url = `https://jsonplaceholder.typicode.com/todos/${id}`;
    const response = await fetch(url);
    return response.json();
  },
};
```

And try to exec

```ts
const result = await act().exec('GetData', '101');

if (CancelledAct.is(result)) {
  // ... Handling the error
  return;
}
```



## ADVANCED: single execution

### One result with multiple calls


In case several places in your application will call the same request, you could call it once.

For example, you want to check authorization and if successful, display the result in several places (NavBar, Avatar, etc.).

Then, you can make the same call, in several places at once, but the request will be made only once.

To do this, set the `$isSingleton` property on the action.

```ts
// check-auth.act.ts
import { ActMasterAction } from 'act-master';
// ...
export class CheckAuth implements ActMasterAction {
  name = 'CheckAuth';

  // At runtime, the result will be one for many parallel requests
  $isSingleton = true;

  exec() {
    return api.isAuth();
  }
}
```

Now, until the query is executed, no matter how many times you call the action, only one, the first query will be made and its result will be returned.

Example of a testing with [ActTest](testing#actmaster-test-utils)

```ts
// check-auth.spec.ts
import { ActMasterAction, ActTest } from 'act-master';

it('SinglePromise one call', async () => {
  // Arrange
  const actionMock: ActMasterAction = {
    $isSingleton: true, // prop for single exec
    name: 'ACT_NAME',
    async exec(val: number) {
      return await new Promise((ok) => setTimeout(() => ok(val), 50));
    },
  };

  const $act = ActTest.getInstance({
    actions: [actionMock],
  });

  const mockFn = jest.fn();

  $act.subscribe('ACT_NAME', mockFn);

  // Act
  await Promise.all([
    $act.exec('ACT_NAME', 10),
    $act.exec('ACT_NAME', 5),
    $act.exec('ACT_NAME', 1),
  ]);

  // Assert
  expect(mockFn).toBeCalledTimes(1);
  expect(mockFn).toBeCalledWith(10);
});

```
