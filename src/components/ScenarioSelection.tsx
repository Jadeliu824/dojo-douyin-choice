'use client';
import { SCENARIOS } from '@/lib/prompts';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

interface ScenarioSelectionProps {
  topicId: string;
  onSelect: (scenarioId: string) => void;
  onBack: () => void;
}

const DIFF_STYLES: Record<string, {bg: string; color: string}> = {
  '初级': { bg: '#D4F5A2', color: '#3A7000' },
  '进阶': { bg: '#FFE4C8', color: '#8A4500' },
  '地狱': { bg: '#FFD6D6', color: '#CC0000' },
};

export default function ScenarioSelection({ topicId, onSelect, onBack }: ScenarioSelectionProps) {
  const scenarios = SCENARIOS[topicId as keyof typeof SCENARIOS] || [];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>

      {/* Back button */}
      <div style={{ padding: '8px 12px 0' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none',
            fontSize: '15px', fontWeight: '600', color: '#6B6B6B',
            padding: '8px 6px', cursor: 'pointer'
          }}
        >
          <ChevronLeft size={20} />
          返回
        </button>
      </div>

      {/* Hero title */}
      <div style={{ padding: '8px 20px 4px' }}>
        <div style={{ fontSize: '30px', fontWeight: '900', color: '#111', letterSpacing: '-0.3px' }}>
          选择场景
        </div>
        <div style={{ fontSize: '14px', color: '#6B6B6B', marginTop: '6px', fontWeight: '500' }}>
          选一个对你来说有挑战的场景开始实战
        </div>
      </div>

      {/* Scenario cards */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {scenarios.map((scenario: any) => {
          const diffStyle = DIFF_STYLES[scenario.difficulty] || DIFF_STYLES['初级'];
          return (
            <div
              key={scenario.id}
              onClick={() => onSelect(scenario.id)}
              style={{
                background: '#FFF', borderRadius: '20px',
                border: '1.5px solid rgba(0,0,0,0.06)',
                padding: '18px 16px', cursor: 'pointer',
                transition: 'transform 0.15s, border-color 0.15s'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.985)'; e.currentTarget.style.borderColor = '#9FE050'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
            >
              {/* Top: title + arrow */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '17px', fontWeight: '800', color: '#111', lineHeight: 1.3, flex: 1, paddingRight: '8px' }}>
                  {scenario.title}
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '99px', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronRight size={16} color="#999" />
                </div>
              </div>

              {/* Opponent */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '99px', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="#6B6B6B" />
                </div>
                <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '500' }}>
                  {scenario.opponent}
                </span>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700', background: diffStyle.bg, color: diffStyle.color }}>
                  {scenario.difficulty || '初级'}
                </span>
                {scenario.opponentTraits.slice(0, 2).map((t: string, i: number) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '500', background: '#F3F3F5', color: '#6B6B6B' }}>
                    {t.length > 12 ? t.slice(0, 12) + '…' : t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {scenarios.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ADADAD', fontSize: '15px' }}>
            更多场景即将开放
          </div>
        )}
      </div>
    </div>
  );
}
