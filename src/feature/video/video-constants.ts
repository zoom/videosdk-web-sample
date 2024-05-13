import { CRCReturnCode, DialoutState } from '@zoom/videosdk';
export const SELF_VIDEO_ID = 'ZOOM_WEB_SDK_SELF_VIDEO';
const statusDescription: any = {
  [DialoutState.Calling]: { text: 'Calling', type: 'pending' },
  [DialoutState.Ringing]: { text: 'Ringing', type: 'pending' },
  [DialoutState.Accepted]: { text: 'Accepted', type: 'pending' },
  [DialoutState.Canceling]: { text: 'Cencelling', type: 'pending' },
  [DialoutState.Busy]: { text: 'Busy', type: 'fail' },
  [DialoutState.Fail]: { text: 'Fail', type: 'fail' },
  [DialoutState.CancelFailed]: { text: 'Cancel failed', type: 'fail' },
  [DialoutState.NotAvailable]: { text: 'NotAvailable', type: 'fail' },
  [DialoutState.Success]: { text: 'Success', type: 'success' },
  [DialoutState.Canceled]: { text: 'Canceled', type: 'success' }
};
const crcStatusDescription: any = {
  [CRCReturnCode.Ringing]: { text: 'Ringing', type: 'pending' },
  [CRCReturnCode.Busy]: { text: 'Busy', type: 'fail' },
  [CRCReturnCode.Fail]: { text: 'Fail', type: 'fail' },
  [CRCReturnCode.Success]: { text: 'Success', type: 'success' },
  [CRCReturnCode.Timeout]: { text: 'Timeout', type: 'fail' }
};
export const getPhoneCallStatusDescription = (status?: DialoutState) => {
  if (status !== undefined) {
    return statusDescription[status];
  }
  return undefined;
};

export const getCRCCallStatus = (status: CRCReturnCode) => {
  if (status !== undefined) {
    return crcStatusDescription[status];
  }
  return undefined;
};

export const SHARE_CANVAS_ID = 'ZOOM_WEB_SDK_SHARER_CANVAS';

export enum ShareViewType {
  FitWindow = 'fit',
  OriginalSize = 'original'
}
