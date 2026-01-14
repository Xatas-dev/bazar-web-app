# Mock API with JSON Server

Этот проект использует json-server для мокирования всех API вызовов во время разработки.

## Установка

Убедитесь, что json-server установлен:
```bash
npm install
```

## Запуск

Для запуска mock API сервера выполните:

```bash
npm run mock
```

Сервер будет доступен по адресу: `http://localhost:3000`

## Запуск приложения

В отдельном терминале запустите приложение:

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

## Доступные эндпоинты

### Пользователи (Persona API)
- `GET /users` - получить всех пользователей
- `GET /users?ids=1,2,3` - получить пользователей по ID
- `GET /users?search=john` - поиск пользователей
- `GET /users/1` - получить пользователя по ID
- `PATCH /users/1` - обновить данные пользователя
- `GET /users/iam` - получить текущего пользователя (мок: возвращает пользователя с id=1)

### Spaces (Space API)
- `GET /space` - получить все spaces пользователя
- `POST /space` - создать новый space
- `POST /space/user` - добавить пользователя в space
- `GET /space/1/user` - получить пользователей space
- `DELETE /space/1` - удалить space
- `DELETE /space/1/user/2` - удалить пользователя из space

### Чаты (Chat API)
- `GET /chats?spaceId=1` - получить чат по space ID
- `POST /chats` - создать новый чат
- `GET /chats/1/messages?page=0&size=20` - получить сообщения чата
- `POST /chats/1/messages` - отправить сообщение

### Market
- `GET /temp-get-subjects` - получить все товары для покупки

### Авторизация
- `POST /logout` - выход из системы (мок: просто возвращает 200 OK)

## Структура данных

### Пользователи
```json
{
  "id": "1",
  "userName": "testuser",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "userPic": "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Spaces
```json
{
  "spaceIds": [1, 2, 3]
}
```

### Чаты
```json
{
  "id": 1,
  "spaceId": 1,
  "name": "General Chat",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Сообщения
```json
{
  "id": 1,
  "chatId": 1,
  "userId": "1",
  "content": "Hello everyone!",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

### Товары
```json
{
  "id": "1",
  "name": "Premium Subscription",
  "description": "Get access to all premium features...",
  "price": 29.99,
  "imageUrl": "https://images.unsplash.com/...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Изменение данных

Все данные хранятся в файле `db.json`. Вы можете редактировать этот файл напрямую, и json-server автоматически перезагрузит данные.

## Дополнительные возможности

json-server поддерживает:
- Фильтрацию: `GET /users?userName=testuser`
- Сортировку: `GET /users?_sort=createdAt&_order=desc`
- Пагинацию: `GET /users?_page=1&_limit=10`
- Операторы: `GET /users?id_gte=1`
- Поиск: `GET /users?q=john`

Более подробная информация: https://github.com/typicode/json-server
