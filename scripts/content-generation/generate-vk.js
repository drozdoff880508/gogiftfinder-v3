const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

async function generateVKPosts(count = 7) {
  console.log(`🚀 Генерирую ${count} постов для ВКонтакте...\n`);
  
  const prompt = `Напиши ${count} разных постов для ВКонтакте про подарки.

ТРЕБОВАНИЯ:
- Каждый пост 200-400 символов
- Много эмоджи 🎁✨💝
- Включи вопрос (для комментариев)
- Посты должны быть разными:
  1. Опрос/вопрос
  2. Подборка идей (5 странных подарков)
  3. Юмор/мем про подарки
  4. Совет/лайфхак
  5. История/опыт
  6. Челлендж
  7. Прямая реклама gogiftfinder.com
- Максимум 1-2 ссылки пер пост
- Разделяй посты тройной линией ---
Формат: Markdown для ВК`;

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      temperature: 0.8,
      max_tokens: 2000
    });

    const posts = response.choices[0].message.content.split('---').filter(p => p.trim());
    
    const contentDir = path.join(__dirname, '../../content/vk');
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    const filename = `vk_posts_${Date.now()}.txt`;
    fs.writeFileSync(path.join(contentDir, filename), posts.join('\n\n---\n\n'));
    
    console.log(`✅ Создано ${posts.length} постов`);
    console.log(`📁 Файл: content/vk/${filename}\n`);
    
    posts.forEach((post, i) => {
      console.log(`📱 Пост ${i + 1}:`);
      console.log(post.trim());
      console.log('\n' + '='.repeat(50) + '\n');
    });
    
    return posts;
  } catch (error) {
    console.error(`❌ Ошибка: ${error.message}`);
    return [];
  }
}

if (require.main === module) {
  generateVKPosts(7).catch(console.error);
}

module.exports = { generateVKPosts };
