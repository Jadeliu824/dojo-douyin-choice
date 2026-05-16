import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSystemPrompt, getReviewPrompt } from '@/lib/prompts';

function getClient() {
  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder-for-build',
    maxRetries: 3,
    timeout: 60000,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, topicId, topicTitle, scenarioTitle, opponentRole, opponentTraits, knowledgePoints, isReview, currentScore, turnCount } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
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
    console.log('OpenAI Raw Response:', `[${replyContent}]`);

    // Extract JSON using regex (robust to markdown or extra text)
    const jsonMatch = replyContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in response, using raw content as fallback');
      if (!isReview && replyContent.length > 0) {
        return NextResponse.json({
          content: replyContent,
          softnessScore: fallbackScore,
          isFinished: false,
          feedback: "Manual extraction fallback"
        });
      }

      return NextResponse.json({
        content: "（对方沉默了片刻，似乎在思考该如何回应...）",
        softnessScore: fallbackScore,
        isFinished: false,
        feedback: "AI returned non-JSON and was empty"
      });
    }

    try {
      const parsedReply = JSON.parse(jsonMatch[0]);
      
      // Handle the case where the model returns an array or different structure
      const finalContent = parsedReply.content || (Array.isArray(parsedReply) ? parsedReply[0]?.content : null);
      
      if (!finalContent && !isReview) {
         return NextResponse.json({
          content: "（对方陷入了沉默...）",
          softnessScore: fallbackScore,
          isFinished: false
        });
      }

      return NextResponse.json(parsedReply);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Extracted text:', jsonMatch[0]);
      if (!isReview) {
        return NextResponse.json({
          content: jsonMatch[0].length > 10 ? jsonMatch[0].substring(0, 500) : "（对方似乎不知道该说什么...）",
          softnessScore: fallbackScore,
          isFinished: false
        });
      }
      throw parseError;
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: '消息处理失败', 
      content: '（系统连接不稳定，对方暂时没有回应，请尝试刷新页面或重试）' 
    }, { status: 500 });
  }
}
