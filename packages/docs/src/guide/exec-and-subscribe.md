---
title: Exec and Subscribe | Act-Master
description: Execute actions and subscribe to results with Act-Master. Learn exec, subscribe, on/off, once, unsubscribe patterns, and advanced subsList bulk management.
head:
  - - meta
    - name: description
      content: Execute actions and subscribe to results with Act-Master. Learn exec, subscribe, on/off, once, unsubscribe patterns, and advanced subsList bulk management.
  - - meta
    - name: keywords
      content: act-master exec, subscribe action, unsubscribe, pub/sub, action events, once, subsList, act-master reactive
  - - meta
    - property: og:title
      content: Exec and Subscribe | Act-Master
  - - meta
    - property: og:description
      content: Execute actions and subscribe to results with Act-Master. Learn exec, subscribe, on/off, once, unsubscribe patterns, and advanced subsList bulk management.
  - - meta
    - property: og:url
      content: https://avil13.github.io/act-master/guide/exec-and-subscribe
  - - link
    - rel: canonical
      href: https://avil13.github.io/act-master/guide/exec-and-subscribe
---

# Exec and Subscribe

## exec

In order to start the act, you must call the exec method of the `ActMaster` instance.

The `exec` method always returns Promise. The first argument is the `name` field property of the act you want to call. Then all the arguments the act needs to execute are passed.

For the example, we have an act of the following form:

```ts
// login.act.ts
import { ActMasterAction } from 'act-master';
import { api } from '.../path/to/api';

export class Login implements ActMasterAction {
  name = 'Login';

  async exec(loginData: any): Promise<any> {
    return await api.login(loginData);
  }
}
```

Let's call him:

::: code-group
```ts [Function Style / Vue3 Composition API]
import { act } from 'act-master';

const loginData = { /* ... */ };

const result = await act().exec('Login', loginData);
```
```ts [Class Style (Vanilla)]
import { ActMaster } from 'act-master';

const loginData = { /* ... */ };

const $act = ActMaster.getInstance();

const result = await $act.exec('Login', loginData);
```
```ts [Vue2/3 - optional style]
<script>
export default {
  // ...
  methods: {
    async login() {
      const result = await this.$act.exec('Login', this.loginData);
    }
  }
}
</script>
```
:::


## subscribe/unsubscribe on/off

In order to get the result of the `exec` method, you can subscribe to the desired `act`.

Then every time in successful execution, you will get the result in the callback.

> The `subscribe` and `on` methods are synonymous, as are `unsubscribe` and `off`.

::: code-group
```ts [subscribe(...)]
act().subscribe('Login', (loginData: LoginData) => {
  // ...
});
```
```ts [on(...)]
act().on('Login', (loginData: LoginData) => {
  // ...
});
```
:::

If you subscribe to an act, you will need to unsubscribe if you no longer need it.
For example when the component that made it is removed. Otherwise you might have problems with memory leaks.

There are several ways to unsubscribe:

## Unsubscribe with the function subscribe returns

::: code-group
```ts [subscribe(...)]
const unsubscribe = act().subscribe('Login', loginCallback);

unsubscribe();
```
```ts [on(...)]
const off = act().on('Login', loginCallback);

off();
```
:::

## Unsubscribe with  method

::: code-group
```ts [subscribe(...)/unsubscribe(...)]
act().subscribe('Login', loginCallback);

act().unsubscribe('Login', loginCallback);
```
```ts [on(...)/off(...)]
act().on('Login', loginCallback);

act().off('Login', loginCallback);
```
:::

## once method

If you need only one execution result and immediately unsubscribe, you can use the `once` method

```ts
act().once('Login', loginCallback);
```

## ADVANCED: Unsubscribe with subsList

You can mark subscriptions with a `key` and then delete them all together.

::: code-group
```ts [subscribe(...)]
const SUBSCRIBE_KEY = '...';

act().subscribe('Login', loginCallback, SUBSCRIBE_KEY);
act().subscribe('Login2', loginCallback, SUBSCRIBE_KEY);

// unsubscribe
act().subsList.clear(SUBSCRIBE_KEY);
```
```ts [on(...)]
const SUBSCRIBE_KEY = '...';

act().on('Login', loginCallback, SUBSCRIBE_KEY);
act().on('Login2', loginCallback, SUBSCRIBE_KEY);

// unsubscribe
act().subsList.clear(SUBSCRIBE_KEY);
```
:::

Or indicate the key by which to unsubscribe further.

::: code-group
```ts [subscribe(...)]
const SUBSCRIBE_KEY = '...';
act().subsList.add(SUBSCRIBE_KEY);

act().subscribe('Login', loginCallback);
act().subscribe('Login2', loginCallback);

// unsubscribe
act().subsList.clear(SUBSCRIBE_KEY);
```
```ts [on(...)]
const SUBSCRIBE_KEY = '...';
act().subsList.add(SUBSCRIBE_KEY);

act().on('Login', loginCallback);
act().on('Login2', loginCallback);

// unsubscribe
act().subsList.clear(SUBSCRIBE_KEY);
```
:::

