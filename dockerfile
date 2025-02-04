FROM node:22.11.0 AS build

WORKDIR /app

ARG VITE_APP_VERSION="1.0.0"
ARG VITE_APP_GITHUB_LINK="https://gitlab.ccenter.uz/"
ARG VITE_APP_RELEASES_LINK="https://gitlab.ccenter.uz/"

ENV VITE_APP_VERSION=${VITE_APP_VERSION}
ENV VITE_APP_GITHUB_LINK=${VITE_APP_GITHUB_LINK}
ENV VITE_APP_RELEASES_LINK=${VITE_APP_RELEASES_LINK}

COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

# Используем nginx для статической раздачи файлов
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]