'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Bot, User, ArrowRight } from 'lucide-react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  score?: number;
}

interface ChatInterfaceProps {
  topicTitle: string;
  scenarioTitle: string;
  opponentRole: string;
  opponentTraits: string[];
  knowledgePoints?: string[];
  onBack: () => void;
  onFinished: (history: Message[], finalScore: number) => void;
}

export default function ChatInterface({ 
  topicTitle, scenarioTitle, opponentRole, opponentTraits, knowledgePoints, 
  onBack, onFinished 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [softnessScore, setSoftnessScore] = useState(50);
  const [scoreDiff, setScoreDiff] = useState<number | null>(null);
  const [isForcedFinished, setIsForcedFinished] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isComplete = softnessScore >= 90 || softnessScore <= 10 || isForcedFinished;

  // Make opponent speak first
  useEffect(() => {
    if (messages.length === 0 && !isTyping) {
      handleSendInitial();
    }
  }, []);

  const handleSendInitial = async () => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          topicTitle,
          scenarioTitle,
          opponentRole,
          opponentTraits,
          knowledgePoints,
          currentScore: softnessScore,
          turnCount: 0
        })
      });
      const data = await res.json();
      if (data.content) {
        setMessages([{ role: 'assistant', content: data.content }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || isComplete) return;

    const userMsg: Message = { role: 'user', content: input };
    const currentHistory = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setScoreDiff(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentHistory,
          topicTitle,
          scenarioTitle,
          opponentRole,
          opponentTraits,
          knowledgePoints,
          currentScore: softnessScore,
          turnCount: currentHistory.filter(m => m.role === 'user').length
        })
      });
      const data = await res.json();
      
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
      if (data.softnessScore !== undefined) {
        const newScore = Number(data.softnessScore);
        const diff = newScore - softnessScore;
        setScoreDiff(diff);
        setSoftnessScore(newScore);
      }
      if (data.isFinished) {
        setIsForcedFinished(true);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: '（系统连接不稳定，对方暂时没有回应，请尝试刷新页面或重试）' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const barColor = softnessScore > 80 ? '#9FE050' : softnessScore < 30 ? '#FF6B6B' : '#4A9EFF';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#F7F7F9' }}>
      
      {/* Header */}
      <div style={{ background: '#FFF', borderBottom: '1.5px solid rgba(0,0,0,0.06)', padding: '12px 16px 12px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ width: '60px', display: 'flex', alignItems: 'center' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
              <ChevronLeft size={24} color="#111" />
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#E8D8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="#9B7BC0" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {opponentRole || '实战对练'}
            </div>
          </div>
          
          <div style={{ width: '60px', display: 'flex', justifyContent: 'flex-end' }}>
            {!isComplete && messages.filter(m => m.role === 'user').length >= 1 && (
              <button 
                onClick={() => setIsForcedFinished(true)}
                style={{ background: 'rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', color: '#111', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                结束
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px' }}>
          <div style={{ flex: 1, height: '6px', background: '#F0F0F0', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${softnessScore}%`, height: '100%', background: barColor, borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <span style={{ fontSize: '13px', fontWeight: '800', color: '#111' }}>{softnessScore}</span>
             {scoreDiff !== null && scoreDiff !== 0 && (
               <span style={{ fontSize: '11px', fontWeight: '800', color: scoreDiff > 0 ? '#3A7000' : '#CC0000', animation: 'float-up 1s ease-out forwards' }}>
                 {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
               </span>
             )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', padding: '0 4px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#ADADAD', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            对方态度
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && isTyping && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B6B6B' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>对方正在进入场景...</div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '12px 16px', borderRadius: '18px',
              background: m.role === 'user' ? '#111' : '#E8D8FF',
              color: m.role === 'user' ? '#FFF' : '#111',
              fontSize: '15px', fontWeight: '500', lineHeight: '1.5',
              borderBottomRightRadius: m.role === 'user' ? '4px' : '18px',
              borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '18px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {isTyping && messages.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '18px', background: '#E8D8FF', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' }}>
            <div className="dot-bounce" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9B7BC0' }} />
            <div className="dot-bounce" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9B7BC0', animationDelay: '0.2s' }} />
            <div className="dot-bounce" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9B7BC0', animationDelay: '0.4s' }} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '16px', background: '#FFF', borderTop: '1.5px solid rgba(0,0,0,0.06)' }}>
        {isComplete ? (
          <button
            onClick={() => onFinished(messages, softnessScore)}
            style={{ width: '100%', padding: '16px', borderRadius: '99px', border: 'none', background: '#9FE050', color: '#2B5200', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            完成对练，查看复盘报告 <ArrowRight size={20} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="输入你的回复..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '14px 18px', borderRadius: '99px', border: 'none', background: '#F0F0F0', fontSize: '15px', outline: 'none' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: input.trim() ? '#9FE050' : '#F0F0F0', color: input.trim() ? '#2B5200' : '#ADADAD', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .dot-bounce { animation: dot-bounce 1.4s infinite ease-in-out both; }
        @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
        @keyframes float-up { 
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
