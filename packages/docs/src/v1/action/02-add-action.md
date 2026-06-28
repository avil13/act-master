# Add Actions to Vue-act-master

[[toc]]

You can add actions in different ways.

Suppose you have a variable with an array of actions:

```ts
// actions: ActMasterAction[]
import { actions } from '../act/actions';
```

You can pass it to the constructor options:

```ts
import { VueActMaster } from 'vue-act-master';
import { actions } from '../act/actions';

Vue.use(VueActMaster, {
  actions,
});
```

Or add it already in the component.

```vue
// App.vue

<script>
import { actions } from '../act/actions';

export default {
  mounted() {
    this.$act.addActions(actions);
    // OR one action
    this.$act.addAction(actions[0]);
  },
};
</script>
```

## With helpers

```ts
import { act, addActions } from 'act-master';

act.addActions([someAction]);
// OR
addActions([someAction]);
```
