'use client';
import { Target, Users, BookOpen, ArrowRight, X } from 'lucide-react';

export interface DynamicScenario {
  topicTitle: string;
  scenarioTitle: string;
  opponentRole: string;
  opponentTraits: string[];
  knowledgePoints: string[];
}

interface Props {
  scenario: DynamicScenario;
  onAccept: () => void;
  onCancel: () => void;
}

export default function DynamicScenarioConfirm({ scenario, onAccept, onCancel }: Props) {
  return (
    <div className="animate-fade-in" style={{ padding: '0 16px 40px' }}>
      
      {/* Header with Cancel */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0' }}>
        <button 
          onClick={onCancel}
          style={{ 
            width: '36px', height: '36px', borderRadius: '50%', 
            background: 'rgba(0,0,0,0.05)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} color="#6B6B6B" />
        </button>
      </div>

      {/* Hero card */}
      <div style={{ 
        background: '#FFF', borderRadius: '24px', 
        border: '1.5px solid rgba(0,0,0,0.06)',
        padding: '24px 20px', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ 
            padding: '4px 12px', borderRadius: '99px', 
            background: '#D4F5A2', color: '#3A7000', 
            fontSize: '11px', fontWeight: '800', 
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            视频内容重构
          </div>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111', lineHeight: 1.25, marginBottom: '12px' }}>
          {scenario.scenarioTitle}
        </h2>
        
        <p style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: 1.5 }}>
          AI 已深度解析该视频中的冲突逻辑与知识点，为您重构了以下实战场景。准备好挑战了吗？
        </p>
      </div>

      {/* Details list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        
        {/* Opponent */}
        <div style={{ background: '#FFF', borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.06)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#E8D8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#9B7BC0" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>对练角色</div>
          </div>
          <div style={{ fontSize: '14px', color: '#111', fontWeight: '600' }}>{scenario.opponentRole}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {scenario.opponentTraits.map((t, i) => (
              <span key={i} style={{ padding: '4px 10px', borderRadius: '99px', background: '#F3F3F5', color: '#6B6B6B', fontSize: '12px' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Knowledge points */}
        <div style={{ background: '#FFF', borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.06)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#FFE4C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#FF9F4A" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>核心知识点</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scenario.knowledgePoints.map((kp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#6B6B6B', lineHeight: 1.4 }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF9F4A', marginTop: '6px', flexShrink: 0 }} />
                {kp}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Start Button */}
      <button
        onClick={onAccept}
        style={{
          width: '100%', padding: '16px', borderRadius: '99px', border: 'none',
          background: '#9FE050', color: '#2B5200',
          fontSize: '16px', fontWeight: '800',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: 'pointer', transition: 'transform 0.1s'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        进入实战
        <ArrowRight size={20} />
      </button>

    </div>
  );
}
