# Pass many results from one action

When running queries, there are situations where you need to change the value of the result several times.

For example, we subscribe to the result of a query. And we expect an array of values.
But during the query process, we have to clear the previous state.


```html
// App.vue

<script>
export default {
  data() {
    return {
      listItems: [
        'First string',
        'Second string',
      ]
    };
  },

  mounted() {
    this.$act.subscribe('GetItems', (items) => {
      // keep track of changes
      this.listItems = items;
    });

    // Send a request
    this.$act.exec('GetItems');
  }
}
</script>
```

Before retrieving the values, we can clear them from the action.

To do this we need to use the function `emit`.
It was discussed [here](../action/04-actions.html#emit-another-action-in-action).


```ts
// with-emit-action.ts
import { ActMasterAction, EmitAction } from 'vue-act-master';

import { api } from '../you/api';

export class WithEmitAction implements ActMasterAction {
  name = 'GetItems';

  private emit: EmitAction;

  exec() {
    this.emit([]); // Show empty array

    return api.getItems(); // Return an array of values
  }

  // set Emitter
  useEmit(emit: EmitAction) {
    this.emit = emit;
  }
}
```
