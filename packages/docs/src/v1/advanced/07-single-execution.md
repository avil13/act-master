# Advanced single execution

## One result with multiple calls

In case several places in your application will call the same request, you could call it once.

For example, you want to check authorization and if successful, display the result in several places (NavBar, Avatar, etc.).

Then, you can make the same call, in several places at once, but the request will be made only once.

To do this, you need to specify the `isSingleExec` property in the action.

```ts
// with-di-action.ts
import { ActMasterAction } from 'vue-act-master';

import { api } from '../you/api';

export class WithDiAction implements ActMasterAction {
  name = 'checkAuth';

  isSingleExec = true; // At runtime, the result will be one

  exec() {
    return api.isAuth();
  }
}
```

Now, until the query is executed, no matter how many times you call the action, only one, the first query will be made and its result will be returned.

Example of a test

```ts
import { ActMasterAction, ActTest } from 'act-master';

describe('SinglePromise', () => {
  it('one call', async () => {
    // test action
    const action: ActMasterAction = {
      isSingleExec: true, // prop for single exec
      name: 'ACT_NAME',
      async exec(val: number) {
        return await new Promise((ok) => setTimeout(() => ok(val), 50));
      },
    };

    const $act = ActTest.getInstance();

    $act.addAction(action);

    const mockFn = jest.fn();

    $act.subscribe('ACT_NAME', mockFn);

    await Promise.all([
      $act.exec('ACT_NAME', 10),
      $act.exec('ACT_NAME', 5),
      $act.exec('ACT_NAME', 1),
    ]);

    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith(10);
  });
});

```
