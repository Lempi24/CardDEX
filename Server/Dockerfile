# Używamy lekkiego obrazu z Node
FROM node:20-slim

# Puppeteer potrzebuje tych bibliotek
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
    wget \
    --no-install-recommends \
 && rm -rf /var/lib/apt/lists/*

# Ustaw zmienną środowiskową dla Puppeteera
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Tworzymy katalog aplikacji
WORKDIR /app

# Kopiujemy package.json i instalujemy zależności
COPY package*.json ./
RUN npm install

# Kopiujemy resztę plików
COPY . .

# Wystawiamy port backendu
EXPOSE 3001

# Uruchamiamy serwer
CMD ["node", "server.js"]
