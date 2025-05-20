# Użyj oficjalnego obrazu Node z Debianem slim
FROM node:20-slim

# Ustaw zmienne środowiskowe Puppeteera (ważne!)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Zainstaluj Chromium i inne potrzebne libki
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Tworzymy katalog aplikacji
WORKDIR /app

# Kopiujemy pliki i instalujemy zależności
COPY package*.json ./
RUN npm install

# Kopiujemy resztę kodu
COPY . .

# Otwieramy port (Railway ustawi PORT)
EXPOSE ${PORT}

# Start serwera
CMD ["node", "server.js"]
