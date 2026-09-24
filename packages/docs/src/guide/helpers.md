---
title: Helpers | Act-Master
description: Create typed actions with fn2act, access ActMaster with act(), execute through the $act proxy, and manage subscriptions with actSubscribe.
head:
  - - meta
    - property: og:title
      content: Helpers | Act-Master
  - - meta
    - property: og:description
      content: Practical examples of fn2act, act(), $act, and actSubscribe.
  - - meta
    - property: og:url
      content: https://avil13.github.io/act-master/guide/helpers
  - - link
    - rel: canonical
      href: https://avil13.github.io/act-master/guide/helpers
---

# Helpers

Import these helpers from `act-master`. They work with the same initialized
ActMaster instance in Vue 3, React, or plain TypeScript.

| Helper | Purpose |
| --- | --- |
| `act()` | Access the instance, execute actions, and manage subscriptions. |
| `$act` | Execute an action as a method, e.g. `$act.GetBalance(day)`. |
| `actSubscribe` | Subscribe with an optional cleanup hook or group key. |
| `fn2act` / `functionToAction` | Wrap a named function as an action. |

## act() {#act}

`act()` returns the shared ActMaster instance. Initialize it once with
`act.init(options)` or through `VueActMaster`. Calling it before initialization
throws an error.

```ts
import { act } from 'act-master';

const result = await act().exec('GetBalance', '2026.01.01');

const off = act().on('GetBalance', (balance) => {
  console.log(balance);
});

off();
```

`act.$act` provides the stored instance without the initialization check; prefer
`act()` for application code.

To clear a named subscription group, use `act.subListClear(key)` or the equivalent
`act().subsList.clear(key)`.

## $act: execute through a proxy {#act-proxy}

`$act` is a proxy that forwards property calls to `act().exec`:

```ts
import { act, $act } from 'act-master';

// Two ways to execute the same action:
await act().exec('GetBalance', '2026.01.01');
await $act.GetBalance('2026.01.01');
```

The generated registry provides method names, argument checking, and return
types. Both calls return `Promise<number | null>` for the example action. They
run through the same validation, error handlers, and result subscriptions.

Bracket notation works for names that contain punctuation, e.g.
`$act['balance.get'](day)` when an action with that name is registered.

Use `act()` for instance methods such as `on`, `off`, and `addAction`: every
property accessed on the `$act` proxy is treated as an **action name**. For
example, `$act.exec(...)` would try to run an action named `exec`.

::: tip Vue component access
The imported `$act` proxy and Vue's `this.$act` have different APIs.
`this.$act` is the plugin-provided instance: call `this.$act.exec(name, ...args)`.
:::

### Handle results and errors

With both `act().exec(...)` and `$act.Action(...)`, await the Promise and handle
the possible `null` result. An exception routed to a configured `$onError` or
global error action resolves to `null`; an unhandled exception rejects.
An unknown action also rejects. See [action error handling](./act-master-action).

```ts
try {
  const balance = await $act.GetBalance('2026.01.01');
  if (balance !== null) {
    console.log(balance);
  }
} catch (error) {
  console.error('Could not load balance', error);
}
```

## actSubscribe

`actSubscribe(name, callback, destroyHookOrKey?)` subscribes to action results
through `act()` and returns an unsubscribe function. It does not execute the
action or replay previous results.

In Vue 3, register cleanup during `setup()`:

```ts
import { onBeforeUnmount } from 'vue';
import { actSubscribe } from 'act-master';

const off = actSubscribe('GetBalance', (balance) => {
  console.log(balance);
}, onBeforeUnmount);

// Optional: stop before the component unmounts.
// off();
```

A function passed as the third argument receives `off` and can register it with
the framework's lifecycle. A truthy non-function value is used as a subscription
group key:

```ts
import { act, actSubscribe } from 'act-master';

const key = Symbol('balance-feature');
const off = actSubscribe('GetBalance', (balance) => {
  console.log(balance);
}, key);

// When the feature is disposed:
act.subListClear(key);
```

Without a third argument, keep the returned function and call it when the owner
is disposed. In Vue, [useAutoUnsubscribe](./vue#useautounsubscribe) manages a
group, while [useRefSubscription](./vue#userefsubscription) manages a reactive
result and its subscription together.

## fn2act

`fn2act(fn)` returns an action with `name: fn.name` and `exec: fn`. It preserves
the function's argument and return types. `functionToAction` is the same helper
under its full name.

```ts
// src/act/get-balance.act.ts
import { fn2act } from 'act-master';

export const getBalance = fn2act(function GetBalance(day: string): number {
  return day === '2026.01.01' ? 100 : 0;
});
```

The event name is `GetBalance`, taken from the function, not `getBalance`, the
exported variable. The helper only creates the action object; register it before
execution.

### Generate and register actions

Place the file in a directory scanned by your `.act-master.yaml`, then run:

```sh
npx act-master-cli g
```

Initialize the application with the generated array. Adjust the import path to
match the output configured in your project:

```ts
import { act } from 'act-master';
import { actions } from '@/act/actions';

act.init({ actions });
```

In Vue 3, pass `{ actions }` to [VueActMaster](./vue#vueactmaster) at startup.
Once the generated declarations are included in the TypeScript project:

```ts
import { act, $act } from 'act-master';

const balance = act().exec('GetBalance', '2026.01.01'); // Promise<number | null>
const same = $act.GetBalance('2026.01.01'); // Promise<number | null>

act().exec('GetBal'); // TypeScript error: unknown action name
act().exec('GetBalance', 2026); // TypeScript error: expected string
```

The CLI needs an exported helper result and a named function it can read in the
same source file. It also supports `export default fn2act(function GetBalance
...)`, `fn2act(GetBalance)` with a local function declaration, and helper import
aliases. Keep one action per file, annotate its return type, and give parameters
types or default values. Async functions are supported:

```ts
// src/act/double-balance.act.ts
import { act, fn2act } from 'act-master';

export const doubleBalance = fn2act(async function DoubleBalance(day: string): Promise<number | null> {
  const balance = await act().exec('GetBalance', day);
  return balance === null ? null : balance * 2;
});
```

Use a named function: inline anonymous functions are rejected. When minifying,
preserve function names, for example with esbuild's `keepNames: true`. TypeScript
alone sees `Function.name` as `string`; the generated registry supplies the
literal action names used for strict checking. Avoid widening that registry to
`ActMasterAction[]`.

You can register the wrapper manually with `act().addAction(getBalance)`, but
runtime registration alone does not generate TypeScript action declarations.
