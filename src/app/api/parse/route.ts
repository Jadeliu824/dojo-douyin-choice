import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function getClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder-for-build',
    baseURL: 'https://api.deepseek.com',
  });
}

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: '请输入有效的链接' }, { status: 400 });
    }

    let scrapedContent = '';
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: {
          'X-Return-Format': 'markdown',
          'User-Agent': MOBILE_UA
        }
      });
      if (jinaRes.ok) {
        scrapedContent = await jinaRes.text();
      }
    } catch (e) {
      console.warn("Scraping failed:", e);
    }

    if (!scrapedContent || scrapedContent.length < 50) {
       scrapedContent = `Content URL: ${url}`;
    }

    const systemPrompt = `你是一个抖音精选内容重构专家。
你的任务是将视频内容转化为可练习、可复用的实战能力。

请深度解析视频中的核心沟通博弈点与高价值技巧。必须严格按照以下 JSON 格式返回：
{
  "topicTitle": "基于视频提取的主题",
  "difficulty": "新手/进阶/专家",
  "targetAudience": "适合谁练",
  "knowledgePoints": ["核心知识点1", "核心知识点2"],
  "actionTips": "一句话行动指南",
  "scenarioTitle": "根据视频重构的实战场景",
  "opponentRole": "对方角色",
  "opponentTraits": ["性格特点1", "性格特点2"],
  "initialPressure": 1-10
}

【严禁幻觉】：如果内容无法解析出有意义的对练场景，返回 {"error": "RETRY_MANUAL"}`;

    const userPrompt = `待分析内容：\n${scrapedContent}`;

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    });

    let replyContent = (response.choices[0].message.content || '').trim();
    
    // Extract JSON
    const jsonMatch = replyContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
       throw new Error('AI 无法解析内容为标准格式');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    if (parsedData.error === "RETRY_MANUAL") {
      return NextResponse.json({ 
        error: '视频内容无法自动读取，请尝试手动粘贴视频文案进行解析。' 
      }, { status: 422 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Parse API Error:', error);
    return NextResponse.json({ error: `解析失败: ${error.message || '未知错误'}` }, { status: 500 });
  }
}
