---
title: Vue | Act-Master
description: Connect Act-Master to Vue, subscribe to reactive action results, and clean up subscriptions with useRefSubscription and useAutoUnsubscribe.
head:
  - - meta
    - property: og:title
      content: Vue | Act-Master
  - - meta
    - property: og:description
      content: Vue 3 setup, reactive action results, and automatic subscription cleanup with Act-Master.
  - - meta
    - property: og:url
      content: https://avil13.github.io/act-master/guide/vue
  - - link
    - rel: canonical
      href: https://avil13.github.io/act-master/guide/vue
---

# Vue

Import Vue 3 integrations from `act-master/vue`. Use Vue 3.3 or newer for the
Composition API examples on this page. Action execution and general helpers
come from `act-master`.

| Export | Purpose |
| --- | --- |
| `VueActMaster` | Install the plugin and expose the ActMaster instance to Vue. |
| `useRefSubscription` | Keep a ref updated with an action's results. |
| `useAutoUnsubscribe` | Remove a group of subscriptions before unmount. |

The entry point also exports the types `ActMaster`, `ActMasterOptions`, and
`RefSubscriptionFunction`.

## VueActMaster

Install the plugin before mounting the app. Pass the actions created by
[act-master-cli](./cli); their generated declarations provide action names,
arguments, and result types for the examples below.

```ts
// main.ts
import { createApp } from 'vue';
import { VueActMaster, type ActMasterOptions } from 'act-master/vue';
import App from './App.vue';
import { actions } from '@/act/actions';

const options: ActMasterOptions = { actions };

createApp(App)
  .use(VueActMaster, options)
  .mount('#app');
```

The plugin initializes `act()`, exposes the instance as `this.$act` in the
Options API, and registers the ActMaster inspector with Vue DevTools in
development mode.

```ts
// Inside setup()
import { act } from 'act-master';

const result = await act().exec('GetBalance', '2026.01.01');
```

Vue's `this.$act` is the **ActMaster instance**, so use
`this.$act.exec('GetBalance', day)`. The separately imported
[`$act` helper](./helpers#act-proxy) is a proxy with action methods such as
`$act.GetBalance(day)`.

### Use an existing instance

If you already initialize ActMaster during application startup, pass the same
instance to the plugin:

```ts
import { act } from 'act-master';
import { VueActMaster } from 'act-master/vue';

const instance = act.init({ actions });
app.use(new VueActMaster(instance));
```

Alternatively, call `VueActMaster.setActMaster(instance)` before
`app.use(VueActMaster)`. Choose one bootstrap path and configure the actions once:
ActMaster and the plugin retain a shared instance; installing the plugin again
does not create an isolated registry or reapply options.

## useRefSubscription

`useRefSubscription(name)` returns a ref containing the latest result received
from the named action. For `GetBalance(day: string): number`, its generated type
is `Ref<number | null>`.

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { act } from 'act-master';
import { useRefSubscription } from 'act-master/vue';

const balance = useRefSubscription('GetBalance');

onMounted(async () => {
  await act().exec('GetBalance', '2026.01.01');
});
</script>

<template>
  <p>Balance: {{ balance ?? 'Not loaded' }}</p>
</template>
```

Call it synchronously in `setup()` or `<script setup>`. It requires an installed
`VueActMaster` plugin and checks that Vue is at least version 3.3.

- The initial value is `null`; the helper does not execute the action or replay a
  result emitted before subscribing.
- The listener is registered in `onBeforeMount`. Execute in `onMounted` or in a
  later event handler so an early result is not missed.
- Each new result replaces `.value`. Async actions supply their resolved result.
- The listener is removed in `onBeforeUnmount`; `useAutoUnsubscribe` is not
  needed for this ref.

Typed calls require the CLI-generated `ActGenerated.actionList` declaration to
be included in the TypeScript project.

## useAutoUnsubscribe

```ts
useAutoUnsubscribe(key?: string): void
```

This helper selects a subscription group with `subsList.add(key)` and registers
`subsList.clear(key)` in `onBeforeUnmount`. Without a key, it generates one for
the call. It returns no value and does not create a subscription itself.

Call it synchronously inside `setup()` or `<script setup>`, after installing
`VueActMaster`, and register the listeners immediately afterward:

```ts
import { ref } from 'vue';
import { act } from 'act-master';
import { useAutoUnsubscribe } from 'act-master/vue';

const balance = ref<number | null>(null);

useAutoUnsubscribe();

act().on('GetBalance', (value) => {
  balance.value = value;
});
```

The group collects subsequent `on`/`subscribe` calls without an explicit cleanup
hook or group key. It also collects `once` listeners until they fire or the
component unmounts. Subscriptions registered before the helper are not added
retroactively.

### Subscriptions created later

The current group belongs to the shared ActMaster instance. Another component
or `subsList.add(...)` call can change it. For listeners created after an `await`
or inside an event handler, pass a unique key explicitly:

```ts
// Inside setup()
import { getCurrentInstance } from 'vue';
import { act } from 'act-master';
import { useAutoUnsubscribe } from 'act-master/vue';

const key = `balance-panel:${getCurrentInstance()!.uid}`;
useAutoUnsubscribe(key);

let stop: (() => boolean) | undefined;

function startListening() {
  stop?.(); // Avoid duplicate listeners on repeated clicks.
  stop = act().on('GetBalance', (balance) => {
    console.log(balance);
  }, key);
}
```

Use a different key for each mounted component instance: clearing a shared key
removes every subscription in that group. Cleanup removes listeners; it does
not cancel running actions. For a single listener, passing `onBeforeUnmount`
directly to `act().on(name, callback, onBeforeUnmount)` is another option.

## Compatibility exports

`ActSubscribe` and `ActInProgress` remain exported for compatibility with older
projects. Vue 2 is no longer supported; these decorators are not part of the
supported Vue 3 API. Use the composables above in new components.
