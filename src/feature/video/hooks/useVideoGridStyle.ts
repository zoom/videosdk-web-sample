import { useCallback } from 'react';
import { useScreenOrientation } from './useScreenOrientation';

interface UseVideoGridStyleProps {
  currentPageParticipants: any[];
}

export const useVideoGridStyle = ({ currentPageParticipants }: UseVideoGridStyleProps) => {
  const { isMobilePortrait } = useScreenOrientation();

  const getVideoGridStyle = useCallback(
    (index: number) => {
      const userCount = currentPageParticipants.length;

      // Mobile portrait mode: only handle 2-column centering
      if (isMobilePortrait) {
        // For odd number of users, center the last video
        if (userCount % 2 === 1 && index === userCount - 1) {
          return { gridColumn: '1 / -1', justifySelf: 'center' };
        }
        return {};
      }

      // Desktop/landscape mode: original logic
      // Calculate grid centering for incomplete rows
      if (userCount === 3 && index === 2) {
        // 3 videos: [XX] [X] -> center the last one
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 5 && index >= 3) {
        // 5 videos: [XXX] [XX] -> center the last two
        const positionInLastRow = index - 3;
        return {
          gridColumn: positionInLastRow === 0 ? '1 / 2' : '2 / 3',
          justifySelf: 'center',
          gridRow: '2'
        };
      }

      if (userCount === 6 && index >= 3) {
        // 6 videos: [XXX] [XXX] -> normal grid, no centering needed
        return {};
      }

      if (userCount === 7 && index === 6) {
        // 7 videos: [XXX] [XXX] [X] -> center the last one
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 8 && index >= 6) {
        // 8 videos: [XXX] [XXX] [XX] -> center the last two
        const positionInLastRow = index - 6;
        return {
          gridColumn: positionInLastRow === 0 ? '1 / 2' : '2 / 3',
          justifySelf: 'center',
          gridRow: '3'
        };
      }

      if (userCount === 10 && index === 9) {
        // 10 videos: [XXXX] [XXXX] [XX] -> center the last one
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 11 && index >= 8) {
        // 11 videos: [XXXX] [XXXX] [XXX] -> center the last three
        const positionInLastRow = index - 8;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '3'
        };
      }

      if (userCount === 13 && index === 12) {
        // 13 videos: [XXXX] [XXXX] [XXXX] [X] -> center the last one
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 14 && index >= 12) {
        // 14 videos: [XXXX] [XXXX] [XXXX] [XX] -> center the last two
        const positionInLastRow = index - 12;
        return {
          gridColumn: positionInLastRow === 0 ? '1 / 3' : '3 / 5',
          justifySelf: 'center',
          gridRow: '4'
        };
      }

      if (userCount === 15 && index >= 12) {
        // 15 videos: [XXXX] [XXXX] [XXXX] [XXX] -> center the last three
        const positionInLastRow = index - 12;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '4'
        };
      }

      if (userCount === 17 && index === 16) {
        // 17 videos: [XXXXX] [XXXXX] [XXXXX] [XX] -> center the last one
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 18 && index >= 15) {
        // 18 videos: [XXXXX] [XXXXX] [XXXXX] [XXX] -> center the last three
        const positionInLastRow = index - 15;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '4'
        };
      }

      if (userCount === 19 && index >= 15) {
        // 19 videos: [XXXXX] [XXXXX] [XXXXX] [XXXX] -> center the last four
        const positionInLastRow = index - 15;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '4'
        };
      }

      if (userCount === 21 && index === 20) {
        // 21 videos: [XXXXX] [XXXXX] [XXXXX] [XXXXX] [X] -> center the last one
        return { gridColumn: '1 / -1', justifySelf: 'center' };
      }

      if (userCount === 22 && index >= 20) {
        // 22 videos: [XXXXX] [XXXXX] [XXXXX] [XXXXX] [XX] -> center the last two
        const positionInLastRow = index - 20;
        return {
          gridColumn: positionInLastRow === 0 ? '1 / 3' : '3 / 5',
          justifySelf: 'center',
          gridRow: '5'
        };
      }

      if (userCount === 23 && index >= 20) {
        // 23 videos: [XXXXX] [XXXXX] [XXXXX] [XXXXX] [XXX] -> center the last three
        const positionInLastRow = index - 20;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '5'
        };
      }

      if (userCount === 24 && index >= 20) {
        // 24 videos: [XXXXX] [XXXXX] [XXXXX] [XXXXX] [XXXX] -> center the last four
        const positionInLastRow = index - 20;
        return {
          gridColumn: `${positionInLastRow + 1} / ${positionInLastRow + 2}`,
          justifySelf: 'center',
          gridRow: '5'
        };
      }

      return {};
    },
    [currentPageParticipants.length, isMobilePortrait]
  );

  return { getVideoGridStyle };
};
