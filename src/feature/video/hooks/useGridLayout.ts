import { useMemo } from 'react';
import { useScreenOrientation } from './useScreenOrientation';

interface UseGridLayoutProps {
  isRecieveSharing: boolean;
  spotlightUsers: number[];
  pageSize: number;
  currentPageParticipants: any[];
}

interface GridLayout {
  gridColumns: number;
  gridRows: number;
}

export const useGridLayout = ({
  isRecieveSharing,
  spotlightUsers,
  pageSize,
  currentPageParticipants
}: UseGridLayoutProps): GridLayout => {
  const { isMobilePortrait } = useScreenOrientation();

  const gridColumns = useMemo(() => {
    if (isRecieveSharing) return 1;
    if (spotlightUsers.length) {
      const spotlightCount = spotlightUsers.length;
      if (spotlightCount === 1) return 1;
      if (spotlightCount === 2) return 2;
      if (spotlightCount <= 4) return 2;
      if (spotlightCount <= 9) return 3;
      if (spotlightCount <= 16) return 4;
      return Math.ceil(Math.sqrt(spotlightCount));
    }

    const userCount = currentPageParticipants.length;

    // Mobile portrait mode: limit to 2 columns max
    if (isMobilePortrait) {
      if (userCount === 1) return 1;
      return 2;
    }

    // Desktop/landscape mode: original logic
    if (userCount === 2) return 2;
    if (userCount <= 4) return 2;
    if (userCount <= 9) return 3;
    if (userCount <= 16) return 4;
    if (userCount <= 25) return 5;
    return Math.ceil(Math.sqrt(userCount));
  }, [spotlightUsers, isRecieveSharing, currentPageParticipants.length, isMobilePortrait]);

  const gridRows = useMemo(() => {
    if (isRecieveSharing) {
      return pageSize;
    }
    if (spotlightUsers.length) {
      const spotlightCount = spotlightUsers.length;
      return Math.ceil(spotlightCount / gridColumns);
    }

    const userCount = currentPageParticipants.length;

    // Mobile portrait mode: calculate rows based on 2 columns max
    if (isMobilePortrait) {
      if (userCount === 1) return 1;
      return Math.ceil(userCount / 2);
    }

    // Desktop/landscape mode: original logic
    if (userCount === 2) return 1;
    if (userCount <= 4) return 2;
    if (userCount <= 9) return 3;
    if (userCount <= 16) return 4;
    if (userCount <= 25) return 5;
    return Math.ceil(userCount / gridColumns);
  }, [spotlightUsers, isRecieveSharing, pageSize, currentPageParticipants.length, gridColumns, isMobilePortrait]);

  return {
    gridColumns,
    gridRows
  };
};
