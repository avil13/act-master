# Act-Master with WebSocket

The WebSocket object provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.

We'll take a look at the simplest way to work through Act-Master.

Examples taken from [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

<br>

To work with WebSocket you will need to create two actions.

- The [first](#message-processing) is for message processing.

- The [second](#working-with-websocket), will handle connecting and catching events when working with WebSocket.

> In the example below, we won't describe all the cases of WebSocket in great detail. You will also need to handle closing the connection.

## Actions for working with WebSocket

### Message processing

```ts{6}
// ws-message-action.ts

import { ActMasterAction, Emit, EmitAction } from 'vue-act-master';

export class WsMessageAction implements ActMasterAction {
  name = 'ws.onMessage'; // we will subscribe to this event

  exec(msg) {
    return msg;
  }
}

```

### Working with WebSocket

```ts{6}
// ws-action.ts

import { ActMasterAction, Emit, EmitAction } from 'vue-act-master';

export class WsAction implements ActMasterAction {
  name = 'ws.make';

  @Emit();
  private emit!: EmitAction;

  // Property is static, so as not to create multiple copies
  static socket: WebSocket;

  exec() {
    if (WsAction.socket) {
      // Connection already exists
      return;
    }

    // Create WebSocket connection.
    WsAction.socket = new WebSocket('ws://localhost:8080');

    // Connection opened
    WsAction.socket.addEventListener('open', (event) => {
        WsAction.socket.send('Hello Server!');
    });

    // Listen for messages
    WsAction.socket.addEventListener('message', (event) => {
      // Call Action
      this.emit('ws.onMessage', event.data)
    });
  }
}
```

### Getting events to display them in the view.

```vue{5-6,13}
<script>
export default {
  mounted() {
    // Subscription first
    this.$act.subscribe(
      'ws.onMessage',
      (data) => {
        // ... Working with and displaying data
      }
    );

    // Enabling WebSocket
    this.$act.exec('ws.make');
  }
}
</script>
```
