# Installation

[[toc]]

Start by creating a project.

::: code-group

```sh [npm]
$ npm add act-master
```

:::

When installing, the package will be installed as a dependency [act-master-cli](https://www.npmjs.com/package/act-master-cli). It is very small and does not participate in runtime.
But it helps when working with application code.

Let's use it to configure the project by adding a config file.
It will help in assembling act files for typing during calls.

I will tell you more about it now.

Enter the command in the console and follow the instructions.

::: code-group

```sh [npm]
$ npx act-master-cli init
```

:::

If you agreed to everything, you received the `.act-master.yaml` file - for searching for `*.act.ts` files and generating action files.

And an example of an act file for error handling - `OnError.act.ts`.


::: code-group

```ts [Vue3 Composition API]
import { createApp } from 'vue';
import App from './App.vue'

import { VueActMaster, type ActMasterOptions } from 'act-master/vue';
import { actions } from '@/act/actions';

const options: ActMasterOptions = {
  actions,
  // If you used the default error file on init
  errorHandlerEventName: 'OnError',
};

createApp(App)
  .use(VueActMaster, options)
  .mount('#app');
```

```ts [Function Style (React/Vanilla)]
import { act, ActMasterOptions } from 'act-master';
import { actions } from '@/act/generated/actions';

const options: ActMasterOptions = {
  actions,
  // If you used the default error file on init
  errorHandlerEventName: 'OnError',
};

act.init(options);
```
```ts [Class Style]
import { ActMaster, ActMasterOptions } from 'act-master';
import { actions } from '../act/actions';

const options: ActMasterOptions = {
  actions,
  // If you used the default error file on init
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
  // If you used the default error file on init
  errorHandlerEventName: 'OnError',
};

Vue.use(VueActMaster, options);

new Vue({
  render: h => h(App),
}).$mount('#app');
```
:::


# ActMasterOptions

Description of configure parameters


| Property                              | Default   | Description
| --- | --- | --- |
| actions?: ActMasterAction[];          | `[]`        | An array of action items
| errorHandlerEventName?: ActEventName; | `undefined` | Action call on error (can be used in actions too)
| di?: DIMap;                           | `{}`        | DI entities
| autoUnsubscribeCallback               | `undefined` | Method for calling auto unsubscribe (Need if You write plugin)


Now all that's left to do is:

- [Write `ActMasterAction`](act-master-action#actmasteraction)
- [Subscribe to its changes](exec-and-subscribe#subscribe-unsubscribe-on-off) or [Watch for changes](act-master-action#watch)
- [And call the action](exec-and-subscribe#exec)

