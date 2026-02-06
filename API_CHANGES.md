# API Changes - Message Author Structure

## Дата изменений
Обновлено: 2024

## Описание изменений

### Эндпоинт `/chats/{chatId}/messages`

**Было:**
```json
{
  "id": 1,
  "chatId": 1,
  "userId": "1",
  "content": "Hello!",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

**Стало:**
```json
{
  "id": 1,
  "chatId": 1,
  "author": {
    "userId": "1",
    "firstName": "Test",
    "lastName": "User",
    "status": "RESOLVED"
  },
  "content": "Hello!",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

### Структура Author

```typescript
enum AuthorStatus {
  RESOLVED = 'RESOLVED',  // Пользователь найден, данные доступны
  UNKNOWN = 'UNKNOWN'     // Пользователь не найден
}

interface MessageAuthor {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  status: AuthorStatus;
}
```

### Логика отображения

- **RESOLVED**: Отображаем `firstName` и `lastName`
- **UNKNOWN**: Отображаем заглушку "Неизвестный пользователь"

### WebSocket события

Структура событий в топике `/topic/chat/{chatId}` также обновлена:

**Было:**
```json
{
  "type": "CREATED",
  "chatId": 1,
  "payload": {
    "id": 999,
    "userId": "1",
    "content": "Test message",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

**Стало:**
```json
{
  "type": "CREATED",
  "chatId": 1,
  "payload": {
    "id": 999,
    "author": {
      "userId": "1",
      "firstName": "Test",
      "lastName": "User",
      "status": "RESOLVED"
    },
    "content": "Test message",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

## Удаленные зависимости

- ❌ Больше не требуется вызов `GET /users` из bazar-persona
- ❌ Удалена логика сопоставления пользователей на фронтенде
- ❌ Удален хук `useUsers` из компонента `MessageList`

## Измененные файлы

### Frontend
- `src/types/chat.ts` - добавлены типы `MessageAuthor` и `AuthorStatus`
- `src/components/chat/MessageList.tsx` - удалена логика получения пользователей
- `src/components/chat/MessageItem.tsx` - обновлена логика отображения автора
- `src/hooks/useChatWebSocket.ts` - обновлена обработка WebSocket событий
- `db.json` - обновлена структура моковых данных

## Определение своих/чужих сообщений

Сравнение производится через `message.author.userId` с `currentUser.id` из security контекста:

```typescript
const isCurrentUser = message.author.userId === currentUser?.id;
```

## Пример тестирования в консоли браузера

```javascript
// Сообщение от известного пользователя
window.simulateWSEvent({
  type: 'CREATED',
  chatId: 1,
  payload: {
    id: 999,
    author: {
      userId: '1',
      firstName: 'Test',
      lastName: 'User',
      status: 'RESOLVED'
    },
    content: 'Test message',
    createdAt: new Date().toISOString()
  }
})

// Сообщение от неизвестного пользователя
window.simulateWSEvent({
  type: 'CREATED',
  chatId: 1,
  payload: {
    id: 1000,
    author: {
      userId: 'unknown-123',
      firstName: null,
      lastName: null,
      status: 'UNKNOWN'
    },
    content: 'Message from unknown user',
    createdAt: new Date().toISOString()
  }
})
```
