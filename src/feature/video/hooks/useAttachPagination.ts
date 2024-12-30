import { useState } from 'react';
import type { ZoomClient } from '../../../index-types';
import { isAndroidOrIOSBrowser, isIPad } from '../../../utils/platform';
import { useParticipantsChange } from './useParticipantsChange';

export function usePagination(zmClient: ZoomClient, preferVideoCount: number) {
  let pageSize = preferVideoCount;
  if (isAndroidOrIOSBrowser()) {
    pageSize = Math.min(preferVideoCount, 4);
  }
  if (isIPad()) {
    pageSize = Math.min(preferVideoCount, 9);
  }
  const [page, setPage] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  useParticipantsChange(zmClient, (allParticipants) => {
    setTotalSize(allParticipants.length - 1);
  });

  return {
    page,
    totalPage: Math.ceil(totalSize / pageSize),
    pageSize,
    totalSize,
    setPage
  };
}
