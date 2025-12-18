const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

const TOPICS = [
  "Подарки для программиста",
  "Что подарить парню на день рождения за 2000 рублей",
  "Странные подарки которые действительно нравятся",
  "Подарки для самого сложного в выборе человека",
  "Корпоративные подарки которые люди используют",
  "Подарки для девушки на 8 марта за 3000 рублей",
  "Нестандартные подарки для спортсмена",
  "Подарки для человека который всё уже имеет",
  "Дешевые подарки которые выглядят дорого",
  "Подарки на День рождения для зятя",
  "Экологичные подарки",
  "Подарки для любителя путешествий",
  "Что подарить новорожденному",
  "Подарки для фотографа любителя",
  "Подарки для гейм-девелопера",
  "Что подарить на 23 февраля парню",
  "Подарки для дизайнера",
  "Подарки для копирайтера",
  "Подарки для маркетолога",
  "Подарки для менеджера проекта"
];

// Функция для скачивания картинки с Unsplash
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Получить случайную картинку с Unsplash
async function getUnsplashImage(query) {
  // Используем Unsplash Source API (бесплатный, без API ключа)
  const width = 1200;
  const height = 800;
  const url = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
  return url;
}

async function generateDzenArticle(topic, index) {
  console.log(`\n🤖 Генерирую статью ${index + 1}/20: "${topic}"...`);
  
  const prompt = `Напиши статью для Яндекс.Дзена про "${topic}"

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
✅ 1500-2000 знаков БЕЗ пробелов (НЕ БОЛЬШЕ!)
✅ Заголовок: "🎁 ${topic}"
✅ Структура:
  - Введение (1-2 коротких абзаца)
  - 5-7 идей подарков (НЕ 10+, а 5-7!)
  - Каждая идея: название + 1-2 предложения описания + цена
  - Короткое заключение (1 абзац)

✅ Стиль:
  - Дружеский, короткие абзацы
  - Эмоджи: 🎁✨💝👍
  - Списки с маркерами
  - Без воды!

✅ В конце: "🚀 Больше идей на gogiftfinder.com"

Формат: Markdown, КОРОТКО И ПО ДЕЛУ!`;

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 2000 // Уменьшили лимит токенов
    });

    const content = response.choices[0].message.content;
    const charCount = content.replace(/\s/g, '').length;
    
    // Скачиваем картинку с Unsplash
    console.log('  🖼️  Скачиваю картинку с Unsplash...');
    const imageQuery = 'gift,present,celebration';
    const imageUrl = await getUnsplashImage(imageQuery);
    
    const imagesDir = path.join(__dirname, '../../content/dzen/images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const imageFilename = `image_${index + 1}.jpg`;
    const imagePath = path.join(imagesDir, imageFilename);
    
    await downloadImage(imageUrl, imagePath);
    console.log(`  ✅ Картинка сохранена: ${imageFilename}`);
    
    // Добавляем инструкцию по картинке в начало статьи
    const contentWithImage = `---
🖼️ **КАРТИНКА ДЛЯ ОБЛОЖКИ:**
Файл: content/dzen/images/${imageFilename}
Загрузите эту картинку как обложку статьи на Дзене!
---

${content}`;
    
    const filename = `dzen_${index + 1}_${topic.replace(/\s+/g, '_').toLowerCase()}.md`;
    const contentDir = path.join(__dirname, '../../content/dzen');
    const outputPath = path.join(contentDir, filename);
    
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, contentWithImage);
    console.log(`✅ Готово! Символов: ${charCount} | Файл: ${filename}`);
    return { topic, charCount, filename, imageFilename, success: true };
  } catch (error) {
    console.error(`❌ Ошибка: ${error.message}`);
    return { topic, success: false, error: error.message };
  }
}

async function generateWeeklyContent() {
  console.log('🚀 УЛУЧШЕННЫЙ ГЕНЕРАТОР С КАРТИНКАМИ');
  console.log('='.repeat(60));
  console.log('✨ Создаю 20 статей + 20 картинок с Unsplash\n');
  
  const results = [];
  for (let i = 0; i < 20; i++) {
    const result = await generateDzenArticle(TOPICS[i], i);
    results.push(result);
    if (i < 19) await new Promise(resolve => setTimeout(resolve, 3000)); // 3 сек пауза
  }
  
  console.log('\n' + '='.repeat(60));
  const successful = results.filter(r => r.success);
  console.log(`✅ Успешно: ${successful.length}/20`);
  console.log(`📁 Статьи: ${path.join(__dirname, '../../content/dzen/')}`);
  console.log(`🖼️  Картинки: ${path.join(__dirname, '../../content/dzen/images/')}`);
  console.log('\n🎯 ТЕПЕРЬ:');
  console.log('  1. Откройте статью из content/dzen/');
  console.log('  2. Скопируйте текст в Дзен');
  console.log('  3. Загрузите картинку из content/dzen/images/ как обложку');
  console.log('  4. Опубликуйте!');
}

if (require.main === module) {
  generateWeeklyContent().catch(console.error);
}

module.exports = { generateDzenArticle, generateWeeklyContent };
