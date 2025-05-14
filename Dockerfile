FROM ghcr.io/puppeteer/puppeteer:24.8.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/bin/google-chrome-stable

WORKDIR /user/src/app

# Kopiujemy package.json, locka i instalujemy zależności
COPY package*.json ./
RUN npm ci

# Kopiujemy całą resztę projektu
COPY . .

# Budujemy frontend (React + Vite)
RUN npm run build

# Odpalamy backend
CMD ["node", "server.js"]
