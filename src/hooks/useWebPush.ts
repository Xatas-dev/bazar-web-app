import { useEffect } from 'react';
import { pushService } from '@/services/pushService';
import { UserDtoResponse } from '@/types/api';

export const useWebPush = (user: UserDtoResponse | null | undefined) => {
  useEffect(() => {
    void pushService.registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void pushService.subscribe();
  }, [user?.id]);
};

