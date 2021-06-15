# Join Session 

## Authentication
Generate video token. This should
```javascript
import { KJUR } from 'jsrsasign';

function generateVideoToken(appKey, apiSecret, topic, passWord = '') {
  let signature = '';
  // try {
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 60 * 60 * 2;

    // Header
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    // Payload
    const oPayload = {
      app_key: appKey,
      iat,
      exp,
      tpc: topic,
      pwd: passWord,
    };
    // Sign JWT
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, apiSecret);
  return signature;
}

```

## init && join
```javascript
const client = ZoomVideo.createClient();
client.init();
client.join(
  topic,
  signature,
  userName,
  password,
).then(() => {
  console.log('Join meeting success');
}).catch((error) => {
  console.error(error);
});

```

When the SDK will reconnect the server. Listen the `connection-change` event to get the detail.

```javascript
client.on('connection-change', (payload) => {
    if (payload.state === 'Connected') {
    } else {
    }
  });
```

## Leave the session

```javascript
client.leave();
```

## End the session

```javascript
if(client.isHost()){
  client.leave(true);
}
```
