import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSystemPrompt, getReviewPrompt } from '@/lib/prompts';

function getClient() {
  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder-for-build',
    maxRetries: 1,
    timeout: 30000,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, topicId, topicTitle, scenarioTitle, opponentRole, opponentTraits, knowledgePoints, isReview, currentScore, turnCount } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Check for missing API Key early
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'sk-placeholder-for-build') {
       return NextResponse.json({ 
        content: '（检测到 DEEPSEEK_API_KEY 未配置。请在 Vercel 项目设置的 Environment Variables 中添加该 Key 并重新部署）' 
      });
    }

    const fallbackScore = body.currentScore || 30;

    let systemPrompt = '';
    let apiMessages = [...messages];

    if (isReview) {
      const historyStr = messages.map((m: any) => `${m.role === 'user' ? '用户' : '对方'}: ${m.content}`).join('\n');
      systemPrompt = getReviewPrompt(topicId, historyStr);
      apiMessages = [{ role: 'user', content: '请给我复盘报告' }];
    } else {
      systemPrompt = getSystemPrompt(topicTitle, scenarioTitle, opponentRole, opponentTraits, currentScore || 30, turnCount || 0, knowledgePoints);
      if (apiMessages.length === 0) {
        apiMessages = [{ role: 'user', content: '（场景已加载，请根据设定直接说出你的第一句开场白）' }];
      }
    }

    const response = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      temperature: isReview ? 0.2 : 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...apiMessages.map(m => ({
          role: m.role,
          content: m.content,
        }))
      ],
    });

    let replyContent = (response.choices[0].message.content || '').trim();
    
    // Normalize Chinese brackets to prevent regex failure
    const normalizedContent = replyContent.replace(/（/g, '(').replace(/）/g, ')');
    
    // Extract JSON using regex
    const jsonMatch = normalizedContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      if (!isReview && replyContent.length > 0) {
        const cleaned = replyContent.replace(/\(softnessScore:.*?\)/gi, '').replace(/\(isFinished:.*?\)/gi, '').trim();
        return NextResponse.json({
          content: cleaned || "（对方陷入了沉默...）",
          softnessScore: fallbackScore,
          isFinished: false,
          feedback: "Fallback cleanup"
        });
      }

      return NextResponse.json({
        content: "（对方沉默了片刻...）",
        softnessScore: fallbackScore,
        isFinished: false
      });
    }

    try {
      const parsedReply = JSON.parse(jsonMatch[0]);
      if (parsedReply.content) {
        parsedReply.content = parsedReply.content
          .replace(/\(softnessScore:.*?\)/gi, '')
          .replace(/\(isFinished:.*?\)/gi, '')
          .trim();
      }
      return NextResponse.json(parsedReply);
    } catch (parseError) {
      const rawText = replyContent.split('{')[0].trim();
      return NextResponse.json({
        content: rawText || "（对方似乎不知道该说什么...）",
        softnessScore: fallbackScore,
        isFinished: false
      });
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    const errorStatus = error.status || 500;
    let errorMsg = '（系统连接不稳定，对方暂时没有回应，请重试）';

    if (errorStatus === 401) {
      errorMsg = '（API Key 无效，请检查 Vercel 环境变量配置）';
    } else if (errorStatus === 429) {
      errorMsg = '（API 调用频率过高，请稍后再试）';
    } else if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      errorMsg = '（请求超时，AI 响应较慢，请刷新页面重试）';
    }

    return NextResponse.json({ 
      error: '消息处理失败', 
      content: errorMsg 
    }, { status: errorStatus });
  }
}
