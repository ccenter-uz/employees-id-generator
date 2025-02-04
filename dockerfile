FROM node:22.11.0 AS build

WORKDIR /app
COPY package*.json ./
COPY vite.config.ts ./

RUN npm install
COPY . .
RUN npm run build

# Используем nginx для статической раздачи файлов
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
