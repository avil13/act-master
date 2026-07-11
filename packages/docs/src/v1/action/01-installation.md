# Installation

[[toc]]

Start by creating a project.

## Vanilla installation

Then add a act-master.

```bash
yarn add act-master
```

Create instance

```ts
import { ActMaster } from 'act-master';

// Actions
import { actions } from '../act/actions';

const $act = new ActMaster({
  actions
});
```

## Vue installation

Then add a vue-act-master.

```bash
yarn add vue-act-master
```

```ts
// main.ts

import Vue from 'vue';
import App from './App.vue';

import { VueActMaster } from 'vue-act-master';

// Actions
import { actions } from '../act/actions';

Vue.use(VueActMaster, {
  actions,
});

new Vue({
  el: '#app',
  render: (h) => h(App),
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    ...
    "types": [
      // Add the types in typescript
      "vue-act-master",
    ],
  }
}
```

It is also possible to transfer other options.
You can use the `ActMasterOptions` type.

```ts
import { VueActMaster, ActMasterOptions } from 'vue-act-master';
//...
```


## Constructor properties (ActMasterOptions)

| Property                              | Default   | Description
| ------------------------------------- | --------- | ------------------------------------------------- |
| actions?: ActMasterAction[];          | []        | An array of action items
| di?: DIMap;                           | {}        | DI entities
| errorHandlerEventName?: ActEventName; | undefined | Action call on error (can be used in actions too)




## Nuxt.JS

Install dependencies:

```bash
yarn add vue-act-master
```

Add `vue-act-master/nuxt` to modules section of `nuxt.config.js`

```js
// nuxt.config.js
export default {
  modules: ['vue-act-master/nuxt'];
}
```

Parameters can be passed to the "actMaster" property.

```js
// nuxt.config.js
export default {
  ...
  modules: ['vue-act-master/nuxt'],
  actMaster: { // config for Vue-Act-Master
    actions: require.resolve('./act/index.ts'), //    resolve path to the actions file
    di: require.resolve('./act/di.ts'), // [optional] resolve path to the DI file
  },
}
```
You can use the file with the default export of the array of actions.
Or with exporting the `actions` variable

Same with file "di", you can export the default variable with the object, or the variable `di`


