# Act-Master

A way to separate business logic from application view.

The easiest library to create a flexible application architecture.

![npm bundle size](https://img.shields.io/bundlephobia/minzip/act-master)
![npm version](https://img.shields.io/npm/v/act-master)

## To work with Vue, there are now even fewer dependencies. Just use `act-mater`

<div align="center">
  <img  src="https://raw.githubusercontent.com/avil13/act-master/master/assets/act-master-logo.svg" alt="vue-act-master">
</div>

---

## 📗 [Documentation](https://avil13.github.io/act-master/)

## 🧪 [Test writing with "ActTest"](https://github.com/avil13/vue-act-master/blob/master/packages/act-master/src/test-utils/README.md)

---

# Example

## Installation

```bash
npm install act-master
```

# Usage

```ts
// main.ts
import { act } from 'act-master';
import { VueActMaster } from 'act-master/vue';
import { createApp } from 'vue';

import { actions } from '@/act/actions';

act.init({
  actions,
});

VueActMaster.setActMaster(act());

const app = createApp(App);

app.use(VueActMaster); // Installation
```

```ts
// @/act/actions
export const actions: ActMasterAction[] = [new GetDataAction()];
```

```ts
// action-get-data.ts
import { ActMasterAction } from 'vue-act-master';

export class GetDataAction implements ActMasterAction {
  name = 'GetData';

  async exec() {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';

    const response = await fetch(url);
    return response.json();
  }
}
```

The action is now available to you in components and you can easily highlight the business logic.

This will help you test components and change the API more easily.

```html
// App.vue

<script>
  import { act } from 'act-master';

  export default {
    data() {
      return {
        myData1: null,
        myData2: null,
      };
    },

    async mounted() {
      console.log(this.myData1, this.myData2); // null, null

      // Subscribe
      act().on('GetData', (data) => {
        this.myData2 = data;
      });

      this.myData1 = await this.$act.exec('GetData');

      console.log(this.myData1, this.myData2);
      // {
      //   "userId": 1,
      //   "id": 1,
      //   "title": "delectus aut autem",
      //   "completed": false
      // },
      // {
      //   "userId": 1,
      //   "id": 1,
      //   "title": "delectus aut autem",
      //   "completed": false
      // }
    },
  };
</script>
```
