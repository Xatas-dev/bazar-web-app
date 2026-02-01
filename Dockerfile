# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Сначала копируем только файлы зависимостей
# Это позволяет Docker кэшировать слой с node_modules, если зависимости не менялись
COPY package*.json ./

# 2. Устанавливаем зависимости
RUN npm ci

# 3. Копируем остальной исходный код
COPY . .

# 4. Собираем проект
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]