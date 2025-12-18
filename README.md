# 🎁 GoGiftFinder v3 - Сервис подбора подарков для России и СНГ

AI-сервис для подбора подарков с интеграцией **Wildberries**, **Ozon**, **Яндекс.Маркет** и **AliExpress (АЭПлатформа)**.

## 🚀 Технологии

- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стили
- **DeepSeek AI** - генерация контента
- **Supabase** - база данных

## ⚙️ Установка

```bash
git clone https://github.com/drozdoff880508/gogiftfinder-v3.git
cd gogiftfinder-v3
npm install
cp .env.example .env.local
npm run dev
```

## 🤖 Автоматизация

```bash
# Генерация статей для Яндекс.Дзена
node scripts/content-generation/generate-dzen.js
```
