# Użyj lekkiego image Node'a
FROM node:18-slim

# Zainstaluj Chromium + zależności puppeteera
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    ca-certificates \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Znajdź ścieżkę do chrome i ustaw zmienną środowiskową
RUN which chromium || which chromium-browser || echo "chromium not found"
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Ustaw katalog roboczy
WORKDIR /app

# Kopiuj package.json i zainstaluj zależności
COPY package*.json ./
RUN npm install

# Kopiuj resztę plików
COPY . .

# Otwórz port (używaj zmiennej środowiskowej PORT)
ENV PORT=10000
EXPOSE ${PORT}

# Start backendu
CMD ["node", "server.js"]