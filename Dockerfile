# HealthScan — full app (built SPA + anatomy API) in one container.
# Works on Render / Railway / Fly.io / any container host.
# Set OPENAI_API_KEY (and optionally ALLOWED_ORIGIN) as env vars on the host.
FROM node:18-slim
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV PORT=8787
EXPOSE 8787
CMD ["node", "server/index.mjs"]
