import { KJUR } from 'jsrsasign';

// eslint-disable-next-line max-params
export function generateVideoToken(
  sdkKey: string,
  sdkSecret: string,
  topic: string,
  passWord = '',
  sessionKey = '',
  userIdentity = '',
  roleType = 1,
  cloud_recording_option = '',
  cloud_recording_election = ''
) {
  let signature = '';
  try {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    // Header
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    // Payload
    let oPayload = {
      app_key: sdkKey,
      iat,
      exp,
      tpc: topic,
      pwd: passWord,
      role_type: roleType
    };
    if (cloud_recording_option === '1') {
      Object.assign(oPayload, { cloud_recording_option: 1 });
    } else {
      Object.assign(oPayload, { cloud_recording_option: 0 });
    }

    if (cloud_recording_election === '1') {
      Object.assign(oPayload, { cloud_recording_election: 1 });
    } else {
      Object.assign(oPayload, { cloud_recording_election: 0 });
    }

    if (sessionKey || sessionKey === '') {
      Object.assign(oPayload, { session_key: sessionKey });
    }
    if (userIdentity || userIdentity === '') {
      Object.assign(oPayload, { user_identity: userIdentity });
    }
    // Sign JWT
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

    if (objA[key] !== objB[key] || !Object.hasOwn(objB, key)) {
      return false;
    }
  }

  return true;
}

export function b64EncodeUnicode(str: any) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(('0x' + p1) as any);
    })
  );
}

export function b64DecodeUnicode(str: any) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}
