FROM node:20-alpine
WORKDIR /app

# Спочатку копіюємо залежності окремо — кешування шарів Docker
COPY package*.json ./
RUN npm install

# Копіюємо весь вихідний код
COPY . .

EXPOSE 5173

# --host 0.0.0.0 — обов'язково щоб Vite був доступний поза контейнером
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
