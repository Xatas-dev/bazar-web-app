"use client"

import * as React from 'react';
import { useEffect } from 'react';
import { pushService } from '@/services/pushService';
import { UserDtoResponse } from '@/types/api';
import { useToast } from './use-toast';
import { ToastAction } from '@/components/ui/toast';

export const useWebPush = (user: UserDtoResponse | null | undefined) => {
  const { toast } = useToast();

  useEffect(() => {
    void pushService.registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      // Try to subscribe normally
      const sub = await pushService.subscribe();
      if (sub) return;

      // If subscription failed, check permission
      try {
        const permission = Notification.permission;
        if (permission === 'denied') {
          // Show toast with action to retry requestPermission
          toast({
            title: 'Уведомления отключены',
            description: 'Чтобы получать push-уведомления, разрешите уведомления для этого сайта.',
            action: React.createElement(ToastAction, {
              altText: 'Повторно запросить разрешение',
              onClick: async () => {
                try {
                  const p = await Notification.requestPermission();
                  console.info('[WebPush] Manual requestPermission result', p);
                  if (p === 'granted') {
                    await pushService.subscribe();
                  } else {
                    // если по-прежнему denied — выводим подсказку
                    console.info('[WebPush] Permission not granted after manual request:', p);
                  }
                } catch (err) {
                  console.warn('[WebPush] requestPermission threw', err);
                }
              }
            }, 'Повторить') as unknown as React.ReactElement,
          });
        }
      } catch (e) {
        // ignore
      }
    })();

  }, [user?.id]);
};
