import { useState, useCallback } from 'react';
import { shouldShowOwnerBanner, readDismissedAt, saveDismissedAt } from './ownerBanner';

export function useOwnerBanner(isOwner: boolean) {
  const [dismissedAt, setDismissedAt] = useState<number | null>(readDismissedAt);

  const dismiss = useCallback(() => {
    const now = Date.now();
    saveDismissedAt(now);
    setDismissedAt(now);
  }, []);

  return { visible: shouldShowOwnerBanner(isOwner, dismissedAt), dismiss };
}
