FROM node:22-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

ENV NODE_ENV=production

COPY tsconfig.json vite.config.mts ./
COPY src src

RUN npm run build

# ------------------------------

FROM nginx:stable-alpine-slim AS web

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY static /usr/share/nginx/html/static

# ------------------------------

FROM node:22-slim AS app

WORKDIR /app
COPY package.json package-lock.json ./

ENV NODE_ENV=production

RUN npm install
RUN rm package-lock.json

COPY migrations migrations
COPY --from=build /app/build build
COPY --from=build /app/dist dist

CMD ["npm", "start"]
