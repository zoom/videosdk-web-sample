import { KJUR } from 'jsrsasign';

export function generateVideoToken(
  sdkKey: string,
  sdkSecret: string,
  topic: string,
  passWord = '',
  sessionKey = '',
  userIdentity = '',
  roleType = 1,
) {
  let signature = '';
  try {
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 60 * 60 * 2;

    // Header
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    // Payload
    const oPayload = {
      app_key: sdkKey,
      iat,
      exp,
      tpc: topic,
      pwd: passWord,
      user_identity: userIdentity,
      session_key: sessionKey,
      role_type: roleType, // role=1, host, role=0 is attendee, only role=1 can start session when session not start
    };
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);
  } catch (e) {
    console.error(e);
  }
  return signature;
}

export function isShallowEqual(objA: any, objB: any) {
  if (objA === objB) {
    return true;
  }

  if (!objA || !objB) {
    return false;
  }

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if (
      objA[key] !== objB[key] ||
      !Object.prototype.hasOwnProperty.call(objB, key)
    ) {
      return false;
    }
  }

  return true;
}


export function b64EncodeUnicode(str: any) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode(("0x" + p1) as any);
  }));
};

export function b64DecodeUnicode(str: any) {
// Going backwards: from bytestream, to percent-encoding, to original string.
return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}).join(''));
}