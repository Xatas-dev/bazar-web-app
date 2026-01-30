# Реализация контекстного меню для удаления сообщений

## Что было реализовано

### 1. Mock API
- **server-middleware.cjs**: Добавлен атрибут `canDelete` в ответ GET `/chats/{chatId}/messages`
  - `canDelete = true` для сообщений текущего пользователя (userId === "1")
- **server-middleware.cjs**: Реализован метод DELETE `/chats/{chatId}/messages`
  - Принимает тело: `{ "messageIds": [number[]] }`
  - Удаляет сообщения из db.json

### 2. Типы TypeScript
- **src/types/chat.ts**:
  - Добавлен атрибут `canDelete?: boolean` в `MessageResponse`
  - Добавлен интерфейс `DeleteMessagesRequest`

### 3. API хуки
- **src/hooks/useChat.ts**: Добавлен хук `useDeleteMessages()`
  - Вызывает DELETE `/chats/{chatId}/messages`
  - Инвалидирует кэш сообщений после успешного удаления

### 4. UI компоненты
- **src/components/ui/dropdown-menu.tsx**: Создан компонент dropdown menu на основе Radix UI
- **src/components/chat/MessageContextMenu.tsx**: Создан компонент контекстного меню для сообщений
  - Показывается только для сообщений с `canDelete = true`
  - Содержит опцию "Удалить" с иконкой корзины
  - Вызывает callback `onDelete` при клике

### 5. Интеграция
- **src/components/chat/MessageItem.tsx**:
  - Добавлен проп `onDelete`
  - Обернут контент сообщения в `MessageContextMenu`
  - Контекстное меню открывается по ПКМ
- **src/components/chat/MessageList.tsx**:
  - Добавлен хук `useDeleteMessages`
  - Реализован обработчик `handleDeleteMessage`
  - Добавлены toast-уведомления об успехе/ошибке
  - Передан `onDelete` в `MessageItem`

## Как использовать

1. Запустите mock сервер: `npm run mock`
2. Запустите приложение: `npm run dev`
3. Откройте чат
4. Нажмите ПКМ на своем сообщении (userId = "1")
5. Выберите "Удалить" в контекстном меню
6. Сообщение будет удалено

## Примечания

- Контекстное меню показывается только для сообщений с `canDelete = true`
- В mock API это сообщения текущего пользователя (userId === "1")
- После удаления список сообщений автоматически обновляется
- Показываются toast-уведомления об успехе или ошибке
