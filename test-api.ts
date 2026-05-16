import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function test() {
  console.log('Testing DeepSeek API with key:', process.env.DEEPSEEK_API_KEY?.substring(0, 10) + '...');
  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'hi' }],
    });
    console.log('Success:', response.choices[0].message.content);
  } catch (error: any) {
    console.error('API Test Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.status);
      console.error('Response Data:', error.data);
    }
  }
}

test();
