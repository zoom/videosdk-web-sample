import { KJUR } from 'jsrsasign';

// eslint-disable-next-line max-params
export function generateVideoToken(
  sdkKey: string,
  sdkSecret: string,
  topic: string,
  sessionKey = '',
  userIdentity = '',
  roleType = 1,
  cloud_recording_option = '',
  cloud_recording_election = '',
  telemetry_tracking_id = ''
) {
  let signature = '';
  try {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;

    // Header
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    // Payload
    const oPayload = {
      app_key: sdkKey,
      iat,
      exp,
      tpc: topic,
      role_type: roleType
    };
    if (cloud_recording_election === '' && cloud_recording_option === '1') {
      Object.assign(oPayload, {
        cloud_recording_option: 1
      });
    } else {
      Object.assign(oPayload, {
        cloud_recording_option: parseInt(cloud_recording_option, 10),
        cloud_recording_election: parseInt(cloud_recording_election, 10)
      });
    }
    if (sessionKey) {
      Object.assign(oPayload, { session_key: sessionKey });
    }
    if (userIdentity) {
      Object.assign(oPayload, { user_identity: userIdentity });
    }

    if (telemetry_tracking_id) {
      Object.assign(oPayload, { telemetry_tracking_id });
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

export function isArrayShallowEqual(arrayA: Array<any>, arrayB: Array<any>) {
  const len = arrayA.length;
  if (arrayB.length !== len) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    if (!isShallowEqual(arrayA[i], arrayB[i])) {
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

export function loadExternalResource(url: string, type: 'script' | 'style') {
  return new Promise((resolve, reject) => {
    let element: HTMLScriptElement | HTMLLinkElement | undefined;
    if (type === 'script') {
      element = document.createElement('script');
      element.src = url;
      element.async = true;
      element.type = 'text/javascript';
    } else if (type === 'style') {
      element = document.createElement('link');
      element.href = url;
      element.rel = 'stylesheet';
    }
    if (element) {
      if ((element as any).readyState) {
        (element as any).onreadystatechange = () => {
          if ((element as any).readyState === 'loaded' || (element as any).readyState === 'complete') {
            (element as any).onreadystatechange = null;
            resolve('');
          }
        };
      } else {
        element.onload = () => {
          resolve('');
        };
        element.onerror = () => {
          reject(new Error(''));
        };
      }
      if (typeof document.body.append === 'function') {
        document.getElementsByTagName('head')[0].append(element);
      } else {
        document.getElementsByTagName('head')[0].appendChild(element);
      }
    } else {
      reject(new Error(''));
    }
  });
}

export function parseJwt(token: string) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}
