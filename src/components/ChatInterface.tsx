'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Bot, User, ArrowRight, Mic } from 'lucide-react';

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
  initialPressure?: number;
  onBack: () => void;
  onFinished: (history: Message[], finalScore: number, metadata: { initialPressure: number; turnCount: number; lowestScore: number }) => void;
}

export default function ChatInterface({
  topicTitle, scenarioTitle, opponentRole, opponentTraits, knowledgePoints, initialPressure = 5,
  onBack, onFinished
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [softnessScore, setSoftnessScore] = useState(50);
  const [lowestScore, setLowestScore] = useState(50);
  const [scoreDiff, setScoreDiff] = useState<number | null>(null);
  const [isForcedFinished, setIsForcedFinished] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const turnCountRef = useRef(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isComplete = softnessScore >= 90 || softnessScore <= 10 || isForcedFinished;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          if (result && result[0]) {
            setInput(result[0].transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            alert('请允许使用麦克风以启用语音输入功能');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playScoreSound = (diff: number) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.08; // subtle volume
      if (diff > 0) {
        osc.frequency.value = 1200;
        osc.type = 'sine';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.value = 200;
        osc.type = 'sawtooth';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio not supported, silently ignore
    }
  };

  const handleScoreChange = (diff: number) => {
    setScoreDiff(diff);
    if (diff !== 0) {
      playScoreSound(diff);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器暂不支持语音识别功能，请尝试使用 Chrome 或 Safari 浏览器');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Start recognition failed:', err);
      }
    }
  };

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

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

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
        handleScoreChange(diff);
        setSoftnessScore(newScore);
        if (newScore < lowestScore) setLowestScore(newScore);
        turnCountRef.current += 1;
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

  /* ── Visual Mood Avatar ── */
  const getOpponentEmoji = (): string => {
    const role = opponentRole.toLowerCase();
    if (role.includes('伴侣') || role.includes('伴侣')) return '😒';
    if (role.includes('朋友')) return '😤';
    if (role.includes('同事') || role.includes('老板') || role.includes('经理')) return '😏';
    if (role.includes('长辈') || role.includes('亲戚') || role.includes('父母') || role.includes('妈')) return '😐';
    if (role.includes('客户') || role.includes('房东') || role.includes('领导')) return '😠';
    if (role.includes('伴侣') || role.includes('对象') || role.includes('爱人')) return '😑';
    return '🤖';
  };

  const getMoodState = () => {
    if (softnessScore > 80) return { emoji: '😊', label: '满意', bg: '#D4F5A2', border: '#9FE050', iconColor: '#3A7000' };
    if (softnessScore > 50) return { emoji: '🙂', label: '缓和', bg: '#E8D8FF', border: '#D0B0F0', iconColor: '#9B7BC0' };
    if (softnessScore > 25) return { emoji: '😐', label: '紧绷', bg: '#FFE4C8', border: '#FFCC99', iconColor: '#CC7700' };
    return { emoji: '😠', label: '愤怒', bg: '#FFD6D6', border: '#FF9999', iconColor: '#CC0000' };
  };

  const mood = getMoodState();

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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '14px',
              background: mood.bg, border: `2px solid ${mood.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: scoreDiff !== null && scoreDiff > 0 ? 'scale(1.1)' : scoreDiff !== null && scoreDiff < 0 ? 'scale(0.95)' : 'scale(1)',
            }}>
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{getOpponentEmoji()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {opponentRole || '实战对练'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: mood.iconColor, transition: 'color 0.3s' }}>
                  {mood.emoji} {mood.label}
                </span>
                {initialPressure >= 8 && (
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#CC0000' }}>
                    · {initialPressure === 10 ? '🔱 地狱' : '👹 地狱'}
                  </span>
                )}
              </div>
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
          <div className={isShaking ? 'shake' : ''} style={{ flex: 1, height: '6px', background: '#F0F0F0', borderRadius: '99px', overflow: 'hidden' }}>
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
            onClick={() => onFinished(messages, softnessScore, { initialPressure, turnCount: turnCountRef.current, lowestScore })}
            style={{ width: '100%', padding: '16px', borderRadius: '99px', border: 'none', background: '#9FE050', color: '#2B5200', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            完成对练，查看复盘报告 <ArrowRight size={20} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={toggleListening}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: 'none',
                background: isListening ? '#FF4D4D' : '#E8D8FF',
                color: isListening ? '#FFF' : '#9B7BC0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
                boxShadow: isListening ? '0 0 15px rgba(255, 77, 77, 0.5)' : 'none',
                animation: isListening ? 'pulse-glow 1.5s infinite' : 'none'
              }}
            >
              <Mic size={22} />
            </button>
            <input
              type="text"
              placeholder={isListening ? "正在聆听，请开口说话..." : "输入或点击左侧语音说话..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '99px',
                border: isListening ? '1.5px solid #FF4D4D' : 'none',
                background: isListening ? '#FFF5F5' : '#F0F0F0',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: 'none',
                background: input.trim() ? '#9FE050' : '#F0F0F0',
                color: input.trim() ? '#2B5200' : '#ADADAD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                cursor: input.trim() ? 'pointer' : 'not-allowed'
              }}
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
        @keyframes pulse-glow {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 77, 77, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
        }
        .shake {
          animation: shake-bar 0.5s ease-in-out;
        }
        @keyframes shake-bar {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-2px); }
          30% { transform: translateX(2px); }
          45% { transform: translateX(-1px); }
          60% { transform: translateX(1px); }
          75% { transform: translateX(-0.5px); }
          90% { transform: translateX(0.5px); }
        }
      `}</style>
    </div>
  );
}
