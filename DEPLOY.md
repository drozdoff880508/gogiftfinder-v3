# 🚀 Инструкция по деплою на Timeweb VPS

## 💻 Предварительная настройка сервера

### 1. Подключение к VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2. Установка необходимого ПО

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка PM2, Nginx, Git
npm install -g pm2
apt install -y nginx git certbot python3-certbot-nginx
```

## 📂 Развертывание проекта

### 3. Клонирование репозитория

```bash
cd /var/www
git clone https://github.com/drozdoff880508/gogiftfinder-v3.git
cd gogiftfinder-v3
```

### 4. Установка зависимостей

```bash
npm install
```

### 5. Настройка переменных окружения

```bash
cp .env.example .env.local
nano .env.local
```

Вставьте ваши API ключи:

```env
DEEPSEEK_API_KEY=sk-49ee309a677d4683bf5d9a08db87e7f6
WILDBERRIES_AFFILIATE_ID=your_id
# ... остальные ключи
```

### 6. Сборка проекта

```bash
npm run build
```

### 7. Запуск с PM2

```bash
pm2 start npm --name "gogiftfinder" -- start
pm2 save
pm2 startup
```

## 🌐 Настройка Nginx

### 8. Создание конфига

```bash
nano /etc/nginx/sites-available/gogiftfinder
```

Вставьте:

```nginx
server {
    listen 80;
    server_name gogiftfinder.com www.gogiftfinder.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9. Активация конфига

```bash
ln -s /etc/nginx/sites-available/gogiftfinder /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 10. SSL сертификат

```bash
certbot --nginx -d gogiftfinder.com -d www.gogiftfinder.com
```

## 🤖 Генерация контента

### Дзен (на сервере)

```bash
cd /var/www/gogiftfinder-v3
node scripts/content-generation/generate-dzen.js
```

Статьи сохранятся в `content/dzen/`

### ВК (на сервере)

```bash
node scripts/content-generation/generate-vk.js
```

Посты сохранятся в `content/vk/`

### Скачивание контента на локальный компьютер

```bash
scp -r root@YOUR_VPS_IP:/var/www/gogiftfinder-v3/content ./content
```

## 🔄 Обновление проекта

```bash
cd /var/www/gogiftfinder-v3
git pull origin main
npm install
npm run build
pm2 restart gogiftfinder
```

## ✅ Готово!

Сайт доступен по адресу: https://gogiftfinder.com
