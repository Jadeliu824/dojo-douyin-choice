'use client';
import { useState } from 'react';
import { TOPICS, SCENARIOS } from '@/lib/prompts';
import TopicSelection from './TopicSelection';
import ScenarioSelection from './ScenarioSelection';
import ChatInterface, { Message } from './ChatInterface';
import ReviewReport from './ReviewReport';
import DynamicScenarioConfirm, { DynamicScenario } from './DynamicScenarioConfirm';

type FlowState = 'topic' | 'scenario' | 'parsing' | 'dynamic_scenario' | 'chat' | 'review';

export default function FlowManager() {
  const [state, setState] = useState<FlowState>('topic');
  const [topicId, setTopicId] = useState('');
  const [scenarioId, setScenarioId] = useState('');
  const [dynScenario, setDynScenario] = useState<DynamicScenario | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [finalScore, setFinalScore] = useState(50);

  const reset = () => { setState('topic'); setTopicId(''); setScenarioId(''); setDynScenario(null); setHistory([]); };

  const handleParseUrl = async (text: string) => {
    setState('parsing');
    try {
      const res = await fetch('/api/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: text }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDynScenario(data); setState('dynamic_scenario');
    } catch (err: any) { alert(err.message || '解析失败'); setState('topic'); }
  };

  const currentTopic    = dynScenario ? { title: dynScenario.topicTitle } : TOPICS.find(t => t.id === topicId);
  const scenarioList    = topicId ? (SCENARIOS[topicId as keyof typeof SCENARIOS] || []) : [];
  const currentScenario = dynScenario
    ? { title: dynScenario.scenarioTitle, opponent: dynScenario.opponentRole, opponentTraits: dynScenario.opponentTraits, knowledgePoints: dynScenario.knowledgePoints }
    : scenarioList.find(s => s.id === scenarioId);

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', minHeight: '100vh', background: '#FFFFFF' }}>
      {/* App Branding Header */}
      <header style={{ padding: '24px 20px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 onClick={reset} style={{ fontSize: '32px', fontWeight: '900', color: '#111', letterSpacing: '-1px', margin: 0, cursor: 'pointer' }}>Dojo</h1>
            <div style={{ background: '#000', color: '#FFF', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>抖音精选</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#9FE050' }} />
          </div>
        </div>
        <p style={{ fontSize: '14px', color: '#6B6B6B', fontWeight: '600', margin: 0 }}>内容重构：从“看过”到“练过”</p>
      </header>

      {/* Main Content Area */}
      <div style={{ paddingBottom: '40px' }}>
        {state === 'topic' && <TopicSelection onSelect={id => { setTopicId(id); setDynScenario(null); setState('scenario'); }} onParseUrl={handleParseUrl} />}
        
        {state === 'parsing' && (
          <div style={{ padding: '100px 20px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #F0F0F0', borderTopColor: '#9FE050', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>解析视频内容中...</div>
            <div style={{ fontSize: '14px', color: '#6B6B6B', marginTop: '8px' }}>正在为您重构实战场景</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {state === 'dynamic_scenario' && dynScenario && (
          <DynamicScenarioConfirm scenario={dynScenario} onAccept={() => { setHistory([]); setState('chat'); }} onCancel={() => setState('topic')} />
        )}

        {state === 'scenario' && (
          <ScenarioSelection topicId={topicId} onSelect={id => { setScenarioId(id); setDynScenario(null); setHistory([]); setState('chat'); }} onBack={() => setState('topic')} />
        )}

        {state === 'chat' && currentTopic && currentScenario && (
          <ChatInterface
            topicTitle={currentTopic.title}
            scenarioTitle={currentScenario.title}
            opponentRole={currentScenario.opponent}
            opponentTraits={currentScenario.opponentTraits}
            knowledgePoints={currentScenario.knowledgePoints}
            onBack={() => setState('scenario')}
            onFinished={(msgs, score) => { setHistory(msgs); setFinalScore(score); setState('review'); }}
          />
        )}

        {state === 'review' && (
          <ReviewReport
            topicId={topicId}
            messages={history}
            isDynamic={!!dynScenario}
            finalScore={finalScore}
            knowledgePoints={currentScenario?.knowledgePoints}
            onRestart={() => { setHistory([]); setState('chat'); }}
            onChangeScenario={() => setState('topic')}
          />
        )}
      </div>
    </div>
  );
}
