import { useEffect } from 'react';
import { useToast } from './use-toast';

/**
 * Hook для отслеживания обновлений Service Worker
 * Показывает пользователю уведомление о доступном обновлении
 * и позволяет применить его немедленно
 */
export const useServiceWorkerUpdate = () => {
  const { toast } = useToast();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Слушаем события регистрации Service Worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Контроллер изменился - значит новый SW активирован
      // Перезагружаем страницу, чтобы применить новый код
      console.log('[SW Update] New Service Worker activated, reloading...');
      window.location.reload();
    });

    // Проверяем наличие waiting Service Worker
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();

        if (registration && registration.waiting) {
          // Есть ждущий Service Worker - показываем уведомление
          showUpdateNotification(registration.waiting);
        }

        // Слушаем обновления
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                // Проверяем состояние по строке, так как состояние 'installed' означает, что SW готов
                if ((newWorker as ServiceWorker & { state: ServiceWorkerState }).state === 'installed') {
                  // Новый SW установлен и ждёт активации
                  showUpdateNotification(newWorker);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('[SW Update] Error checking for updates:', error);
      }
    };

    const showUpdateNotification = (waitingWorker: ServiceWorker) => {
      toast({
        title: 'Доступно обновление',
        description: 'Новая версия приложения готова. Перезагрузите, чтобы применить изменения.',
      });

      // Автоматически отправляем skipWaiting через некоторое время
      // или пользователь может нажать F5 для перезагрузки
      setTimeout(() => {
        try {
          // Отправляем сообщение через controller
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
          }
          // Также отправляем напрямую ждущему Service Worker'у
          waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        } catch (error) {
          console.error('[SW Update] Error sending SKIP_WAITING message:', error);
        }
      }, 1000); // Даём пользователю время прочитать сообщение
    };

    checkForUpdates();

    // Проверяем обновления при открытии приложения и периодически
    const interval = setInterval(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        await registration?.update();
      } catch (error) {
        console.error('[SW Update] Error updating service worker:', error);
      }
    }, 6 * 60 * 60 * 1000); // каждые 6 часов

    return () => {
      clearInterval(interval);
    };
  }, [toast]);
};

