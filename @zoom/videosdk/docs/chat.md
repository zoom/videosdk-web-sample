# Chat

## summary 

Chat feature is used in the Zoom Video meeting, it provides the methods and events define the chat behavior as following

## quick start

After joining meeting success, Chat interface is available now

```js
const chat = client.getChatClient();
if (chat) {
    chat.sendToAll('send text'); // chat methods is available now
}
client.on('chat-on-message', (v) => {
    console.log(v);
    // do something
})
```

### Send message

User can use the method `send` to send chat message to other,

```js
chat.send('test', userId)
.then(v => {
    console.log(v); // new message
})
.catch(v => {
    console.log(v); // error message
})
```

Or, use the method `sendToAll` to send message to everyone.

```js
chat.sendToAll('test')
.then(v => {
    console.log(v); // new message
})
.catch(v => {
    console.log(v); // error message
})
```

You can receive the message sent from the other by listening the event of `chat-on-message`, also you will get the message sent by yourself from this event

```js
client.on('chat-on-message', v => {
    console.log(v); // new message
})
```

### Chat privilege

Chat privilege defines the chat permissions, there are the different privilege as following.

|         | privilege value | describe                                          |
| ------- | --------------- | ------------------------------------------------- |
| meeting | 1               | attendee can talk to EVERY_ONE                    |
|         | 4               | attendee can talk to no one                       |
|         | 5               | attendee can talk to EVERY_ONE or a specific user |

Host or manager can use `setPrivilege` to change the privilege

```js
const MEETING_PRIVILEGE_ALL = 1;
chat.setPrivilege(MEETING_PRIVILEGE_ALL)
.then((v) => {
    const { chatPrivilege } = v;
    // success
})
.catch(v => {
    // fail
    console.log(v)
})
```

user can get the current privilege by invoking the method `getPrivilege`

```js
const privilege = chat.getPrivilege();
console.log(privilege);
```

Or, get the real-time change of privilege by listen the `chat-privilege-change` event

```js
client.on('chat-privilege-change', data => {
    console.log(data);
    // do something
})
```
