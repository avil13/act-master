---
title: Installation | Act-Master
description: Install Act-Master and set up your Vue or React project with action-based architecture. Supports Vue 3, Vue 2, React, and Vanilla TypeScript.
head:
  - - meta
    - name: description
      content: Install Act-Master and set up your Vue or React project with action-based architecture. Supports Vue 3, Vue 2, React, and Vanilla TypeScript.
  - - meta
    - name: keywords
      content: act-master installation, vue act-master setup, react act-master, typescript actions setup, npm install act-master
  - - meta
    - property: og:title
      content: Installation | Act-Master
  - - meta
    - property: og:description
      content: Install Act-Master and set up your Vue or React project with action-based architecture. Supports Vue 3, Vue 2, React, and Vanilla TypeScript.
  - - meta
    - property: og:url
      content: https://avil13.github.io/act-master/guide/installation
  - - link
    - rel: canonical
      href: https://avil13.github.io/act-master/guide/installation
---
# Installation

## Install

```sh
npm install act-master
```

When installing, [`act-master-cli`](https://www.npmjs.com/package/act-master-cli) is included as a dependency. It is small and does not participate in runtime — it helps with code generation during development.

## Initialize the project

Run the init command and follow the prompts. It will create a `.act-master.yaml` config file used to find `*.act.ts` files and generate the actions index.

```sh
npx act-master-cli init
```

If you accepted the defaults, you also get an example error-handler action — `OnError.act.ts`.

## Bootstrap

::: code-group
```ts [Vue3 Composition API]
import { createApp } from 'vue';
import App from './App.vue'

import { VueActMaster, type ActMasterOptions } from 'act-master/vue';
import { actions } from '@/act/actions';

const options: ActMasterOptions = {
  actions,
  // If you used the default error file on init:
  errorHandlerEventName: 'OnError',
};

createApp(App)
  .use(VueActMaster, options)
  .mount('#app');
```

```ts [Function Style (React / Vanilla)]
import { act, type ActMasterOptions } from 'act-master';
import { actions } from '@/act/actions';

const options: ActMasterOptions = {
  actions,
  errorHandlerEventName: 'OnError',
};

act.init(options);
```

```ts [Class Style]
import { ActMaster, type ActMasterOptions } from 'act-master';
import { actions } from '../act/actions';

const options: ActMasterOptions = {
  actions,
  errorHandlerEventName: 'OnError',
};

const $act = new ActMaster(options);
```

```ts [Vue2]
import Vue from 'vue';
import App from './App.vue';

import { VueActMaster, type ActMasterOptions } from 'act-master/vue';
import { actions } from '@/act/actions';

const options: ActMasterOptions = {
  actions,
  errorHandlerEventName: 'OnError',
};

Vue.use(VueActMaster, options);

new Vue({
  render: h => h(App),
}).$mount('#app');
```
:::

## ActMasterOptions

| Property | Default | Description |
| --- | --- | --- |
| `actions?: ActMasterAction[]` | `[]` | Array of action instances |
| `errorHandlerEventName?: ActEventName` | `undefined` | Action name to call on uncaught error |
| `di?: DIMap` | `{}` | Dependency injection map |
| `autoUnsubscribeCallback` | `undefined` | Hook for plugin-level auto-unsubscribe |

Now all that's left to do is:

- [Write `ActMasterAction`](act-master-action#actmasteraction)
- [Subscribe to its changes](exec-and-subscribe#subscribe-unsubscribe-on-off) or [Watch for changes](act-master-action#watch)
- [And call the action](exec-and-subscribe#exec)
