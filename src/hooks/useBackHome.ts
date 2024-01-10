import { useCallback } from 'react';
export function useBackHome(history: any) {
  const backToHome = useCallback(() => {
    history.goBack();
  }, [history]);
  return backToHome;
}
