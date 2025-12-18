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

// Генерация картинки через простой API (DiceBear Avatars)
function generateSimpleImage(topic, index) {
  // Используем DiceBear API для генерации простых иллюстраций
  const seed = encodeURIComponent(topic + index);
  const style = ['adventurer', 'avataaars', 'bottts', 'identicon', 'initials'][index % 5];
  const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=400&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  return url;
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : require('http');
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Обработка редиректов
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function generateDzenArticle(topic, index) {
  console.log(`\n🤖 Статья ${index + 1}/20: "${topic}"`);
  
  const prompt = `Напиши статью для Яндекс.Дзена про "${topic}"

ТРЕБОВАНИЯ:
✅ 1500-2000 символов БЕЗ пробелов
✅ Заголовок: "🎁 ${topic}"
✅ Структура:
  - Введение (1-2 абзаца)
  - 5-7 идей подарков
  - Каждая: название + 1-2 предложения + цена
  - Заключение
✅ Стиль: дружеский, эмоджи 🎁✨💝, списки
✅ Конец: "🚀 Больше на gogiftfinder.com"
Формат: Markdown`;

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    const charCount = content.replace(/\s/g, '').length;
    
    // Генерируем простую картинку
    console.log('  🎨 Генерирую картинку...');
    const imageUrl = generateSimpleImage(topic, index);
    
    const imagesDir = path.join(__dirname, '../../content/dzen/images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const imageFilename = `image_${index + 1}.svg`;
    const imagePath = path.join(imagesDir, imageFilename);
    
    await downloadImage(imageUrl, imagePath);
    console.log(`  ✅ Картинка: ${imageFilename} | Текст: ${charCount} симв.`);
    
    const contentWithImage = `---
🖼️ КАРТИНКА: content/dzen/images/${imageFilename}
Загрузите как обложку на Дзене
---

${content}`;
    
    const filename = `dzen_${index + 1}_${topic.replace(/\s+/g, '_').toLowerCase().substring(0, 40)}.md`;
    const contentDir = path.join(__dirname, '../../content/dzen');
    const outputPath = path.join(contentDir, filename);
    
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, contentWithImage);
    return { topic, charCount, filename, imageFilename, success: true };
  } catch (error) {
    console.error(`  ❌ Ошибка: ${error.message}`);
    return { topic, success: false, error: error.message };
  }
}

async function generateWeeklyContent() {
  console.log('🎉 УЛЬТИМАТИВНЫЙ ГЕНЕРАТОР С AI КАРТИНКАМИ');
  console.log('='.repeat(60));
  console.log('✨ 20 статей + 20 уникальных картинок\n');
  
  const results = [];
  for (let i = 0; i < 20; i++) {
    const result = await generateDzenArticle(TOPICS[i], i);
    results.push(result);
    if (i < 19) await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  const successful = results.filter(r => r.success);
  console.log(`✅ Готово: ${successful.length}/20`);
  console.log(`📁 Статьи: content/dzen/`);
  console.log(`🎨 Картинки: content/dzen/images/`);
  console.log('\n🚀 КАК ПУБЛИКОВАТЬ:');
  console.log('  1. Откройте статью');
  console.log('  2. Скопируйте текст в Дзен');
  console.log('  3. Загрузите SVG картинку как обложку');
  console.log('  4. Опубликуйте! 🎉');
}

if (require.main === module) {
  generateWeeklyContent().catch(console.error);
}

module.exports = { generateDzenArticle, generateWeeklyContent };
