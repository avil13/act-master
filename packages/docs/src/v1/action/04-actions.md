# ActMasterAction

[[toc]]

Action is the place to store your business logic.

This is essentially an implementation of the Commander pattern.

Action is an object with the required `name` property and the `exec` method.

## Simple action

```ts
// simplest-action.ts

import { ActMasterAction } from 'vue-act-master';

export const dataAction: ActMasterAction = {
  name: 'get.data',

  async exec(id = 1) {
    const url = `https://jsonplaceholder.typicode.com/todos/${ id }`;

    const response = await fetch(url);
    return response.json();
    // => {
    //       userId: 1,
    //       id: 1,
    //       title: "delectus aut autem",
    //       completed: false
    //    }
  },
};
```

Having [added this action](./02-add-action), we can now call it and [get the result](./03-subscribtion).

Now we can call `exec` using the action name.

```ts
this.value = await this.$act.exec('get.data');
```

You can also pass arguments to the `exec` method.

```ts
this.value = await this.$act.exec('get.data', 101);
```


## Class Styled Action

You can use classes to create actions.

Along with classes, it will be possible to use decorators helper.

> We recommend using classes. They are more desirable, especially if you are using TypeScript.

```ts
// class-action.ts

import { ActMasterAction } from 'vue-act-master';

export class ClassAction implements ActMasterAction {
  name = 'get.data';

  async exec() {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';

    const response = await fetch(url);
    return response.json();
  }
}
```

```ts
// ../act/actions

export const actions: ActMasterAction[] = [
  new ClassAction(),
]
```

## Cancel Action

Action can be interrupted by returning a special object "CancelledAct".
This will stop the chain of events if you build it using `watch` or `emit`.

```ts
// cancel-action.ts

import { ActMasterAction, CancelledAct } from 'vue-act-master';

export class DataAction implements ActMasterAction {
  name = 'get.data',

  exec() {
    // ...
    return new CancelledAct('Some reason to stop action...');
  },
};
```


## Validate arguments

Before calling the `exec` method, you can validate the arguments that are sent to it.

We add a method `validateInput` to which all arguments intended for `exec` get.

If they are valid we return `true`.

Otherwise an error message of your choice.

```ts
// validate-action.ts

import { ActMasterAction, CancelledAct } from 'vue-act-master';

export class DataAction implements ActMasterAction {
  name = 'get.data',

  validateInput(arg?: any): true | CancelledAct {
    if (typeof arg !== 'number') {
      const errorData = {
        id: 'Must be a number'
      };
      return new CancelledAct('Validation error', errorData);
    }
    return true; // If everything is correct
  }

  async exec(id: number) {
    const url = `https://jsonplaceholder.typicode.com/todos/${id}`;
    const response = await fetch(url);
    return response.json();
  },
};
```

And try to exec

```ts
const result = await this.$act.exec('get.data', '101');

if (result instaceof CancelledAct) {
  // ... Handling the error
  return;
}
```

## With transformation

It often happens that the result of a call needs to be changed.

This can easily be done through the `transform` method.

The argument will be the result of the `exec` method.

```ts
// transformed-action.ts

import { ActMasterAction } from 'vue-act-master';

export class TransformedAction implements ActMasterAction {

  name = 'get.data.transformed',

  async exec() {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';

    const response = await fetch(url);
    return response.json();
    // Output
    // {
    //  userId: 1,
    //  id: 1,
    //  title: "delectus aut autem",
    //  completed: false
    // }
  }

  transform(data) {
    // Modifies the data after receiving
    return {
      todoItem: data.title,
      done: data.completed,
    };
  }
};
```

And try to exec

```ts
const result = await this.$act.exec('get.data.transformed');
console.log(result); // => { todoItem: "delectus aut autem", done: false }
```

## Watch

You can launch the action after another one through the "watch" property.

Any of the actions in `watch`, after execution, will call the current action.

::: warning
Be careful. The action should not follow itself.
Otherwise it will start an endless loop.
:::

```ts
// Action queue
import { ActMasterAction } from 'vue-act-master';

export class FirstAction implements ActMasterAction {
  name = 'FirstAction';
  exec() {
    return {
      name: 'Leo',
    };
  }
};

export class SecondAction implements ActMasterAction {
  // Names of events, after any and which action automatically starts.
  watch: ['FirstAction'],
  name = 'SecondAction';
  exec(data) {
    console.log(data); // { "Name": "Leo" }
    return {
      name: 'Mike',
    };
  }
};
```

## inProgress

If you need to show the progress bar on the desired command, you can use the inProgress method.

It takes a function which will be called when the state of the action changes.

```ts
// App.vue

<script>
export default {
  data() {
    return {
      // status of process
      isLoading: false,
      // There will be an unsubscribe function to avoid memory leaks
      off: () => null,
    };
  },

  mounted() {
    this.off = this.inProgress('GetData', (status: boolean) => {
      this.isLoading = status;
    });

    // Call action
    this.$act.exec('GetData');
  },

  beforeDestroy() {
    this.off(); // unsubscribe
  }
}
</script>
```

If you use classes and decorators, you can write it down shorter.

```ts
// App.vue - with decorators

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { ActInProgress } from 'vue-act-master';

  @Component
  export default class MyVueComponent extends Vue {
    @ActInProgress('GetData')
    isLoading = false;

    mounted() {
      this.$act.exec('GetData');
    }
  }
</script>
```


## DI in Actions

To make the actions more independent, a simple Dependency injection (DI) implementation has been added.

It consists of storing entities that we access from actions into an internal container.

For example, we have an API. And no matter what we use (REST,GraphQL,gRPC), this interface will not change.

And we just use the implementation of this entity through an interface.

In the code it looks like this:

### Adding an entity

```ts
// main.ts
// ...
import { VueActMaster } from 'vue-act-master';

import { actions } from '../act/actions';
import { SuperAPI } from '../you/api';

const di = {
  // key, value
  'api': SuperAPI
};

Vue.use(VueActMaster, {
  actions,
  di, // map of entities
});
```

or in vue component

```html
// App.vue

<script>
import { SuperAPI } from '../you/api';

export default {
  data() {
    return {};
  },

  mounted() {
    // Adding DI scope
    this.$act.setDI('api', SuperAPI);
  }
}
</script>
```

### Using entities

There are two ways to get DI entities:

- Through decorators, if you use them in typescript.
- Through the `useDI` method.

```ts
// with-di-action.ts
// with decorator

import { UseDI, ActMasterAction } from 'vue-act-master';

import { SuperAPI } from '../you/api';

export class WithDiAction implements ActMasterAction {
  name = 'login';

  @UseDI('api')
  private api!: SuperAPI; // SuperAPI as interface

  exec(loginData) {
    return this.api.login(loginData);
  }
}
```

OR

```ts
// with-di-action.ts
// without decorator

import { ActMasterAction } from 'vue-act-master';
import { SuperAPI } from '../you/api';

export class WithDiAction implements ActMasterAction {
  name = 'login';

  private api: SuperAPI; // SuperAPI as interface

  exec(loginData) {
    return this.api.login(loginData);
  }

  // get DI scope
  useDI({ api }) {
    this.api = api;
  }
}
```


## Emit another Action in Action

If you need to call another action inside the current one, you can do it using the `emit` handler.

It can be connected via the decorator or via the helper.

This way you can build chains of actions that can be stopped by `CancelledAct`.

You can use this to [return different values](../advanced/08-emit-many-results.html) to subscribers.

```ts
// with-emit-action.ts

import { ActMasterAction, EmitAction } from 'vue-act-master';

export class WithEmitAction implements ActMasterAction {
  name = 'login';

  private emit: EmitAction;

  exec(loginData) {
    const result = api.login(loginData);

    // use another action
    this.emit('set.authorized', true);
  }

  // set Emitter
  useEmit(emit: EmitAction) {
    this.emit = emit;
  }
}
```

OR

```ts
// with-emit-action.ts
// with decorator

import { ActMasterAction, Emit, EmitAction } from 'vue-act-master';

export class WithEmitAction implements ActMasterAction {
  name = 'login';

  @Emit()
  private emit!: EmitAction;

  exec(loginData) {
    const result = api.login(loginData);

    // use another action
    this.emit('set.authorized', true)
  }
};
```

