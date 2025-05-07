FROM node:22-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

ENV NODE_ENV=production

COPY tsconfig.json vite.config.mts ./
COPY src src

RUN npm run build

# ------------------------------

FROM node:22-slim AS production

WORKDIR /app
COPY package.json package-lock.json ./

ENV NODE_ENV=production

RUN npm install
RUN rm package-lock.json

COPY migrations migrations
COPY --from=build /app/build build
COPY --from=build /app/dist dist

CMD ["npm", "start"]

# ------------------------------

FROM node:22-slim AS development

WORKDIR /app
COPY . .

ENV NODE_ENV=development

RUN npm install

CMD ["npm", "run", "dev"]
