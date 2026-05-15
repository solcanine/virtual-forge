# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV DATABASE_URL=file:/app/data/prod.db
RUN mkdir -p data && npx prisma generate && npm run build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
