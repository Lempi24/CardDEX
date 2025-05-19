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

# Ustaw katalog roboczy
WORKDIR /app

# Kopiuj package.json i zainstaluj zależności
COPY package*.json ./
RUN npm install

# Kopiuj resztę plików
COPY . .

# Otwórz port (ważne dla Render)
EXPOSE 3001

# Start backendu
CMD ["npm", "start"]
