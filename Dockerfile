FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
RUN npm run build
EXPOSE 10000
ENV PORT=10000
CMD ["npm", "run", "docker-start"]