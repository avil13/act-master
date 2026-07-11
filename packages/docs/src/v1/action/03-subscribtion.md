# Subscribe / Unsubscribe (on/off), once

[[toc]]

To explain how it works, let's create a simple example of a component in Vue.

```html
<template>
  <div>
    {{ value }} === {{ result }}

    <button @click="action">Run ACTION!!!</button>
  </div>
</template>

<script>
  export default {
    data() {
      value: null,
      result: null,
    },

    methods: {
      async action() {
        // run action
        this.value = await this.$act.exec('get.data');
      }
    },

    mounted() {
      this.$act.subscribe(
        'get.data',
        (data) => {
          this.result = data;
        },
        this // for auto unsubscribe (not working in Vue 3, send hook "onUnmounted")
      );
    },
  }
</script>
```

## For the Composition API, the following helpers are available

```ts
import { act, actSubscribe } from 'act-master';

export default {
  setup() {
    // Alternatives:
    //  act.subscribe === actSubscribe
    //  act.on === actSubscribe
    actSubscribe(
      'get.data',
      (data) => {
        this.result = data;
      },
      this // for auto unsubscribe
    );
  },
};
```


---

## exec

Here's an example of how to get the result of an action in the simplest way.

```ts
this.value = await this.$act.exec('get.data');
```

`this.$act.exec` is always a promise.

## subscribe

Also, you can subscribe to the action.
And the result of the `exec` method call will go into the callback:

```ts
this.$act.subscribe(
  'get.data',
  (data) => {
    this.result = data;
  }
);
```

`Subscribe` method - returns the function to `unsubscribe` from events.

If you pass the instance `Vue` to the **third argument**, the unsubscription will be done automatically at hooks `beforeDestroy`. (Works only in Vue-2)


## on / off

For `subscribe` / `unsubscribe` methods there are also `on` / `off` aliases.

```ts
const handler = (data) => console.log(data);

const unsubscribe = this.$act.subscribe('get.data', handler);
// Same thing.
const off = this.$act.on('get.data', handler);
```

## once

If you need to subscribe to only one event, use the `once` method.

Unsubscribe will be called automatically after the first triggering.

```ts
this.$act.once('get.data', handler);
```

# Advanced

## Vue2 class component and subscribe decorator

If you use vue2 and classes, you can use the decorator to subscribe.

```html
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { ActSubscribe } from 'vue-act-master';

  @Component({})
  export default class MyVueComponent extends Vue {
    @ActSubscribe('GetUserData')
    user: User | null = null;

    @ActSubscribe('GetUserData', 'data.name', null)
    name: string | null = null;

    async mounted() {
      // Making a request.
      // The data in the `this.user` variable will be updated automatically.
      await this.$act.exec('GetUserData');

      console.log(this.user); // => User { data: { name: 'Mike' } }
    }
  }
</script>
```

::: tip
```
user: User | null = null;
```
Don't use `undefined` in init - the property will not be reactive.
:::

This decorator works with the second version because it uses hook events to unsubscribe
