# Manage the Meeting
This article will introduce how the host manages the video meeting.

## Host and Manager
The host can share hosting privileges with another user, allowing the manager to manage the administrative side of the meeting, such as managing participants or locking the sharing.

Make other as the host. 
> Notice there is only one host in a video meeting.

```javascript
// make another participant as the host.
await client.makeHost(userId);
```

Make others as manager.
```javascript
await client.makeManager(userId);
```

Withdraw the permission.
```javascript
await client.revokeManager(userId);
```

## Participants List
In the meeting, in addition to audio/video/screen data, there are some other attributes, such as name, isHost, etc. You can get the list of participants through `getAllUser`, or if you just want to get your own information, you can use `getCurrentUserInfo` method.

```javascript
const currentUser = client.getCurrentUserInfo();
let participants = client.getAllUser();
/* new participants join the meeting */
client.on('user-added', payload => {
  payload.forEach((item) => {
    console.log('participant %s joins the meeting', item.displayName);
  });
  // get latest participants list
  participants = client.getAllUser(); 
});
client.on('user-updated', payload => {
  // partipants update, for example rename, raise hand etc.
});
client.on('user-removed', payload => {
  // participants leave the meeting, it may be from the waiting room, or it may be due to failover. Check the `reason` property.
  payload.forEach((item) => {
    console.log(`participant ${item.userId} leave the meeting.`)
  })
})
```

## Rename
When you call the `join` method to join the meeting, you have already set the user name, if you need to modify the name in the meeting, you can use the `changeName` method。

Only the host or manager can rename others, otherwise, only the current user's name can be changed.

```javascript
// make sure the host is allowed the participants to rename themselves.
const changeName = async (newName, userId) => {
  // if userId is undefined, it will change current user's name.
  await client.changeName(newName, userId);
};
```
