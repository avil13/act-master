# Act-Master: TypeScript Action/Event Library for Vue and JavaScript Apps

Act-Master is a lightweight TypeScript library that separates business logic from the application view using a simple action/event pattern. It helps you build flexible, testable, type-safe applications in Vue 3 or plain JavaScript/TypeScript — without extra state-management boilerplate.

[![npm version](https://img.shields.io/npm/v/act-master)](https://www.npmjs.com/package/act-master)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/act-master)](https://bundlephobia.com/package/act-master)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/avil13/act-master/blob/master/LICENSE)

<div align="center">
  <img src="https://raw.githubusercontent.com/avil13/act-master/master/assets/act-master-logo.svg" alt="Act-Master logo — TypeScript action and event library for Vue" width="200">
</div>

To work with Vue, there are now even fewer dependencies — just use `act-master`.

## Table of contents

- [Why Act-Master](#why-act-master)
- [Documentation](#documentation)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#-test-writing-with-acttest)
- [License](#license)

## Why Act-Master

- **Separates business logic from views** so components stay thin and easy to test.
- **Type-safe** action and event definitions powered by TypeScript.
- **Framework-agnostic core** with a first-class Vue 3 plugin (`act-master/vue`).
- **Small bundle size** and zero required runtime dependencies for the core package.
- **CLI scaffolding** via `act-master-cli` to generate actions quickly.

## 📗 Documentation

Full API reference and guides: [avil13.github.io/act-master](https://avil13.github.io/act-master/)

## 🧪 Test writing with "ActTest"

Learn how to write tests for actions with the ActTest utility: [ActTest test-writing guide](https://github.com/avil13/act-master/blob/master/packages/act-master/src/test-utils/README.md)

---

# Example

## Installation

Install the package and scaffold your first action with the CLI:

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
export const actions: ActMasterAction[] = [new GetDataAction()];
```

```ts
// action-get-data.ts
import type { ActMasterAction } from 'act-master';

export class GetDataAction implements ActMasterAction {
  name = 'GetData';

  async exec(): Promise<Record<string, any>> {
    return fetch('https://jsonplaceholder.typicode.com/todos/1').then((res) => res.json());
  }
}
```

# Usage

Once registered, an action is available in any component, letting you isolate business logic away from the view layer. This makes components easier to unit test and makes it simple to swap or update the underlying API without touching your UI code.

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
  }, 1000);
</script>
```

## License

Act-Master is released under the [MIT License](https://github.com/avil13/act-master/blob/master/LICENSE).
