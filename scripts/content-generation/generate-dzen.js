const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');
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

async function generateDzenArticle(topic, index) {
  console.log(`\n🤖 Генерирую статью ${index + 1}/20: "${topic}"...`);
  
  const prompt = `Напиши статью для Яндекс.Дзена про "${topic}"

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
✅ Минимум 1500 знаков БЕЗ пробелов
✅ Заголовок H1: "🎁 ${topic}: Идеи для идеального подарка"
✅ Структура:
  - Введение (2-3 абзаца)
  - 10+ идей подарков с описаниями
  - Для каждого: название, цена (1000-5000₽), почему хороший, где купить
  - Заключение
✅ Стиль: дружеский, много эмоджи 🎁✨💝
✅ В конце: "Больше идей на gogiftfinder.com"
Формат: Markdown`;

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 3000
    });

    const content = response.choices[0].message.content;
    const charCount = content.replace(/\s/g, '').length;
    const filename = `dzen_${index + 1}_${topic.replace(/\s+/g, '_').toLowerCase()}.md`;
    const contentDir = path.join(__dirname, '../../content/dzen');
    const outputPath = path.join(contentDir, filename);
    
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, content);
    console.log(`✅ Готово! Символов: ${charCount} | Файл: ${filename}`);
    return { topic, charCount, filename, success: true };
  } catch (error) {
    console.error(`❌ Ошибка: ${error.message}`);
    return { topic, success: false, error: error.message };
  }
}

async function generateWeeklyContent() {
  console.log('🚀 ГЕНЕРАТОР КОНТЕНТА ДЛЯ ЯНДЕКС.ДЗЕНА');
  console.log('='.repeat(60));
  console.log(`📅 Генерирую 20 статей...\n`);
  
  const results = [];
  for (let i = 0; i < 20; i++) {
    const result = await generateDzenArticle(TOPICS[i], i);
    results.push(result);
    if (i < 19) await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  const successful = results.filter(r => r.success);
  console.log(`✅ Успешно: ${successful.length}/20`);
  console.log(`📁 Файлы: ${path.join(__dirname, '../../content/dzen/')}`);
}

if (require.main === module) {
  generateWeeklyContent().catch(console.error);
}

module.exports = { generateDzenArticle, generateWeeklyContent };
