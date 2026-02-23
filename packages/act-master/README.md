# Act-Master

A way to separate business logic from application view.

The easiest library to create a flexible and testable application with type safety architecture.


![npm bundle size](https://img.shields.io/bundlephobia/minzip/act-master)
![npm version](https://img.shields.io/npm/v/act-master)

## To work with Vue, there are now even fewer dependencies. Just use `act-mater`.


<div align="center">
  <img  src="https://raw.githubusercontent.com/avil13/vue-act-master/master/assets/act-master-logo.svg" alt="vue-act-master">
</div>

---

## 📗 [Documentation](https://avil13.github.io/vue-act-master/)

## 🧪 [Test writing with "ActTest"](https://github.com/avil13/vue-act-master/blob/master/packages/act-master/src/test-utils/README.md)


---

# Example

## Installation

```bash
npm install act-master

npx act-master-cli init
```

```ts
// main.ts
import { act } from 'act-master';
import { VueActMaster } from 'act-master/vue';
import { createApp } from 'vue';

import { actions } from '@/act/actions';

const options: ActMasterOptions = {
  actions,
  // errorHandlerEventName: 'OnError', // Act Name for catch errors
};

const app = createApp(App);
// Installation in Vue
app.use(VueActMaster, options);

// Example installation if You not use Vue
act.init(options);
```

```ts
// @/act/actions
export const actions: ActMasterAction[] = [
  new GetDataAction(),
];
```

```ts
// action-get-data.ts
import type { ActMasterAction } from 'vue-act-master';

export class GetDataAction implements ActMasterAction {
  name = 'GetData';

  async exec(): Promise<Record<string, any>> {
    return fetch('https://jsonplaceholder.typicode.com/todos/1').json();
  }
}
```

# Usage

The action is now available to you in components and you can easily highlight the business logic.

This will help you test components and change the API more easily.

```html
// App.vue
<script setup lang="ts">
import { act } from 'act-master';
import { ref } from 'vue';

const myData1 = ref<any>(null);
const myData2 = ref<any>(null);

// subscribe on all GetData events
act().on('GetData', (data) => {
  myData2.value = data;
});

// emulate some logic
setTimeout(() => {
  console.log(myData1.value, myData2.value); // null, null

  myData1.value = await act().exec('GetData');

  //
  console.log(this.myData1, this.myData2);
    // {
    //   "id": 1,
    //   "title": "Hello world with Act-Master!!!",
    // },
    // {
    //   "id": 1,
    //   "title": "Hello world with Act-Master!!!",
    // }
}, 1000)
</script>
```
