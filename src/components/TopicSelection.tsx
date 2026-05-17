'use client';
import { useState } from 'react';
import { TOPICS } from '@/lib/prompts';
import { Search, Link as LinkIcon, Sparkles, BookOpen, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

interface TopicSelectionProps {
  onSelect: (id: string) => void;
  onParse: (params: { url?: string; text?: string }) => void;
}

export default function TopicSelection({ onSelect, onParse }: TopicSelectionProps) {
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const getIcon = (id: string) => {
    switch (id) {
      case 'nvc': return <MessageSquare size={22} color="#9B7BC0" />;
      case 'boundary': return <ShieldCheck size={22} color="#4A9EFF" />;
      case 'emotion': return <Sparkles size={22} color="#FF9500" />;
      case 'relationship': return <Heart size={22} color="#FF4D4D" />;
      default: return <BookOpen size={22} color="#ADADAD" />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px' }}>
      
      {/* Video URL & Text Input */}
      <div style={{ background: '#F7F7F9', borderRadius: '24px', padding: '20px', marginBottom: '32px', border: '1.5px solid rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#E8D8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LinkIcon size={18} color="#9B7BC0" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>即兴实战：重构视频场景</span>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', padding: '3px', borderRadius: '12px', marginBottom: '16px' }}>
          <button 
            onClick={() => setInputMode('url')}
            style={{
              flex: 1, padding: '8px', borderRadius: '9px', border: 'none',
              background: inputMode === 'url' ? '#FFF' : 'transparent',
              fontSize: '13px', fontWeight: '700', color: inputMode === 'url' ? '#111' : '#6B6B6B',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: inputMode === 'url' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            粘贴视频链接
          </button>
          <button 
            onClick={() => setInputMode('text')}
            style={{
              flex: 1, padding: '8px', borderRadius: '9px', border: 'none',
              background: inputMode === 'text' ? '#FFF' : 'transparent',
              fontSize: '13px', fontWeight: '700', color: inputMode === 'text' ? '#111' : '#6B6B6B',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: inputMode === 'text' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            输入视频总结/文案
          </button>
        </div>

        {inputMode === 'url' ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="粘贴抖音精选视频链接..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              style={{ flex: 1, padding: '14px 18px', borderRadius: '99px', border: '1.5px solid rgba(0,0,0,0.06)', background: '#FFF', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={() => url && onParse({ url })}
              disabled={!url}
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: url ? '#111' : '#E0E0E0', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: url ? 'pointer' : 'not-allowed' }}
            >
              <Search size={20} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              placeholder="在此粘贴视频的文案、对话记录，或者视频的主要总结。AI 将为您提炼出实战对练场景..."
              value={text}
              onChange={e => setText(e.target.value)}
              style={{ 
                width: '100%', 
                height: '110px', 
                padding: '14px 18px', 
                borderRadius: '16px', 
                border: '1.5px solid rgba(0,0,0,0.06)', 
                background: '#FFF', 
                fontSize: '14px', 
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
            />
            <button
              onClick={() => text && onParse({ text })}
              disabled={!text}
              style={{ 
                width: '100%', 
                height: '46px', 
                borderRadius: '99px', 
                border: 'none', 
                background: text ? '#111' : '#E0E0E0', 
                color: '#FFF', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '700',
                fontSize: '14px',
                gap: '8px',
                transition: 'all 0.2s',
                cursor: text ? 'pointer' : 'not-allowed'
              }}
            >
              <Sparkles size={16} />
              生成实战场景
            </button>
          </div>
        )}

        <p style={{ fontSize: '11px', color: '#ADADAD', marginTop: '10px', fontWeight: '500', paddingLeft: '4px' }}>
          {inputMode === 'url' 
            ? 'AI 将自动读取并解析视频中的对话场景，带你进入实战' 
            : 'AI 将根据您提供的视频总结或文案提取核心博弈点，生成专属对练'}
        </p>
      </div>

      {/* Topics / Collections */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>精选内容集</h2>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#ADADAD' }}>更多内容加载中</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {TOPICS.map(topic => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '20px', borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.06)',
              background: '#FFF', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#F7F7F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {getIcon(topic.id)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '2px' }}>{topic.title}</div>
              <div style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '500' }}>{topic.desc}</div>
            </div>
            <div style={{ color: '#ADADAD' }}>
               <Search size={18} />
            </div>
          </button>
        ))}
      </div>

      <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#ADADAD', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Dojo × 抖音精选
        </div>
      </div>
    </div>
  );
}
