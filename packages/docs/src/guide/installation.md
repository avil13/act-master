---
title: Install Vue-Act-Master | Guide
---
# Installation


To install, simply type the command

```sh
npm install act-master
```

If you use Vue and optional syntax, you will be comfortable installing the wrapper and taking advantage of it.

```sh
npm install vue-act-master
```

Now you need to initialize the library.

You can use two options, one is more suitable in your application prevails functional style, for example "Composition API" in Vue or functional components in React.
If you use classes more often, like in Angular, you can use constructor initialization.


::: code-group
```ts [Function Style]
import { act, ActMasterOptions } from 'act-master';
import { actions } from '@/act/generated/actions';

const options: ActMasterOptions = {
  actions,
};

act.init(options);
```
```ts [Class Style]
import { ActMaster, ActMasterOptions } from 'act-master';
import { actions } from '../act/actions';

const options: ActMasterOptions = {
  actions,
};

const $act = new ActMaster(options);
```
```ts [Vue3 Composition API]
import { createApp } from 'vue';

import { act, ActMasterOptions } from 'act-master';
import { actions } from '../act/actions';

const options: ActMasterOptions = {
  actions,
};

act.init(options);

createApp(App).mount('#app');
```
```ts [Vue2]
import Vue from 'vue';
import App from './App.vue';

import { VueActMaster, ActMasterOptions } from 'vue-act-master';
import { actions } from '../act/actions';

const options: ActMasterOptions = {
  actions,
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
| actions?: ActMasterAction[];          | []        | An array of action items
| errorHandlerEventName?: ActEventName; | undefined | Action call on error (can be used in actions too)
| di?: DIMap;                           | {}        | DI entities
| autoUnsubscribeCallback               | undefined | Method for calling auto unsubscribe


Now all that's left to do is:

- [Write `ActMasterAction`](act-master-action#actmasteraction)
- [Subscribe to its changes](exec-and-subscribe#subscribe-unsubscribe-on-off) or [Watch for changes](act-master-action#watch)
- [And call the action](exec-and-subscribe#exec)
