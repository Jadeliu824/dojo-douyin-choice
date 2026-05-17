'use client';
import { useEffect, useState } from 'react';
import { RotateCcw, LayoutGrid, CheckCircle, AlertCircle, Star, AlertTriangle, Lightbulb, Award } from 'lucide-react';
import { Message } from './ChatInterface';
import { UnlockResult } from '@/lib/ranks';

interface ReviewReportProps {
  topicId: string;
  messages: Message[];
  isDynamic: boolean;
  finalScore: number;
  knowledgePoints?: string[];
  onRestart: () => void;
  onChangeScenario: () => void;
  newBadges?: UnlockResult[];
}

/* ── Badge Unlock Celebration ── */
function BadgeCelebration({ badges, onDone }: { badges: UnlockResult[]; onDone: () => void }) {
  const [visible, setVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 100);
    const t2 = setTimeout(() => { setVisible(false); onDone(); }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', animation: 'badgeFadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', transform: showContent ? 'scale(1)' : 'scale(0.5)', transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <div style={{ fontSize: '64px', marginBottom: '12px', animation: 'badgeBounce 1s ease infinite' }}>
          {badges[0]?.badge.icon || '🏆'}
        </div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#9FE050', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
          新徽章解锁
        </div>
        {badges.map(b => (
          <div key={b.badgeId} style={{ marginBottom: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#FFF', marginBottom: '4px' }}>
              {b.badge.title}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
              {b.badge.desc}
            </div>
          </div>
        ))}
        {badges.length > 1 && (
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            共解锁 {badges.length} 个徽章
          </div>
        )}
      </div>
      <style>{`
        @keyframes badgeFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes badgeBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}

export default function ReviewReport({ topicId, messages, isDynamic, finalScore, knowledgePoints, onRestart, onChangeScenario, newBadges }: ReviewReportProps) {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(true);

  const isSuccess = finalScore >= 80;
  const scoreColor = isSuccess ? '#3A7000' : finalScore <= 25 ? '#CC0000' : '#004499';
  const scoreBg    = isSuccess ? '#D4F5A2' : finalScore <= 25 ? '#FFD6D6' : '#C8E6FF';
  const barColor   = isSuccess ? '#9FE050' : finalScore <= 25 ? '#FF6B6B' : '#4A9EFF';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, topicId, isReview: true })
        });
        const data = await res.json();
        if (data && (data.didWell || data.content)) {
          if (data.didWell) {
            setReport(data);
          } else {
            const m = data.content.match(/\{[\s\S]*\}/);
            if (m) setReport(JSON.parse(m[0]));
          }
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  /* ── Badge celebration overlay ── */
  if (newBadges && newBadges.length > 0 && showCelebration) {
    return <BadgeCelebration badges={newBadges} onDone={() => setShowCelebration(false)} />;
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #F0F0F0', borderTopColor: '#9FE050', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>生成复盘报告中…</div>
        <div style={{ fontSize: '14px', color: '#6B6B6B' }}>AI 教练正在分析你的表现</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── feedback card helper ── */
  const FCard = ({ icon: Icon, bg, iconColor, label, labelColor, quote, sub }: any) => (
    <div style={{ background: '#FFF', borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.06)', padding: '18px 16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={iconColor} />
        </div>
        <span style={{ fontSize: '15px', fontWeight: '800', color: labelColor }}>{label}</span>
      </div>
      <div style={{ fontSize: '15px', fontWeight: '500', color: '#111', lineHeight: '1.6', fontStyle: 'italic', marginBottom: sub ? '10px' : '0' }}>
        "{quote}"
      </div>
      {sub && (
        <div style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: '1.5', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          {sub}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '48px' }}>

      {/* ── Result banner ── */}
      <div style={{ margin: '16px 16px 0', background: '#FFF', borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.06)', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: scoreBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              {isSuccess ? <CheckCircle size={28} color={scoreColor} /> : <AlertCircle size={28} color={scoreColor} />}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#ADADAD', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
              {isSuccess ? '实战能力报告' : '沟通破裂报告'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#111', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              {isSuccess ? '完成！干得漂亮' : '谈崩了…没关系'}
            </div>
          </div>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: scoreBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: scoreColor, lineHeight: 1 }}>{finalScore}</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: scoreColor, opacity: 0.7 }}>分</span>
          </div>
        </div>

        <div style={{ fontSize: '14px', color: '#6B6B6B', lineHeight: '1.55', margin: '14px 0 16px' }}>
          {isSuccess
            ? (isDynamic ? '你成功将技巧转化为实战经验，沟通肌肉记忆加分' : '你正在将这项沟通技巧内化为肌肉记忆，继续保持！')
            : '对方彻底拒绝了继续沟通。但每次失败都是进步，复盘一下哪里出了问题'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#ADADAD' }}>沟通顺畅度</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: barColor }}>{finalScore}%</span>
        </div>
        <div style={{ height: '8px', background: '#F0F0F0', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ width: `${finalScore}%`, height: '100%', background: barColor, borderRadius: '99px', transition: 'width 0.8s ease' }} />
        </div>
      </div>

      <div style={{ padding: '24px 20px 10px', fontSize: '11px', fontWeight: '700', color: '#ADADAD', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        教练深度点评
      </div>

      <div style={{ padding: '0 16px' }}>
        {!report && !isLoading ? (
          <div style={{ padding: '30px', textAlign: 'center', background: '#FFF', borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.06)' }}>
             <div style={{ fontSize: '14px', color: '#ADADAD' }}>未能生成详细复盘，可能由于对话过短或网络波动</div>
          </div>
        ) : (
          <>
            <FCard
              icon={Star}
              bg="#D4F5A2"
              iconColor="#3A7000"
              label="高光时刻"
              labelColor="#3A7000"
              quote={report?.didWell?.moment || '寻找沟通的突破口...'}
              sub={report?.didWell?.comment ? `点评：${report?.didWell?.comment}` : '继续加油，你的表达可以更有影响力'}
            />

            <FCard
              icon={AlertTriangle}
              bg="#FFE4C8"
              iconColor="#8A4500"
              label="避坑指南"
              labelColor="#8A4500"
              quote={report?.stuck?.moment || '表现稳健，暂无明显雷点'}
              sub={report?.stuck?.comment ? `改进：${report?.stuck?.comment}` : '基本避开了情绪陷阱，保持这种节奏'}
            />

            <div style={{ background: '#FFF', borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.06)', padding: '18px 16px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#C8E6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lightbulb size={18} color="#004499" />
                </div>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#004499' }}>锦囊金句</span>
              </div>
              <div style={{ background: '#EBF4FF', borderRadius: '14px', padding: '14px', marginBottom: '10px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#004499', lineHeight: '1.55' }}>
                  "{report?.nextTime?.phrase || '暂无锦囊'}"
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '500' }}>
                下次遇到类似情况，直接用这句试试。
              </div>
            </div>

            {/* ── Gold Standard ── */}
            {report?.goldStandard?.reply && (
              <div style={{ background: '#FFF', borderRadius: '20px', border: '2px solid #FFD700', padding: '18px 16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={18} color="#B8860B" />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#8B6914' }}>🥇 高手金牌示范</span>
                </div>
                <div style={{ background: '#FFFDE7', borderRadius: '14px', padding: '14px', marginBottom: '10px', border: '1px solid #FFD700' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#8B6914', lineHeight: '1.55' }}>
                    “{report.goldStandard.reply}”
                  </div>
                </div>
                {report.goldStandard.explanation && (
                  <div style={{ fontSize: '13px', color: '#8B6914', fontWeight: '500', lineHeight: '1.55', padding: '10px 0 0', borderTop: '1px solid rgba(255,215,0,0.3)' }}>
                    {report.goldStandard.explanation}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {knowledgePoints && knowledgePoints.length > 0 && (
        <div style={{ padding: '20px 16px 4px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#ADADAD', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
            能力标签
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {knowledgePoints.map((kp, i) => (
              <span key={i} style={{
                background: '#F0F0F0', color: '#111',
                padding: '6px 14px', borderRadius: '99px',
                fontSize: '13px', fontWeight: '600',
              }}>
                {kp}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        <button
          onClick={onRestart}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', borderRadius: '99px', border: 'none', background: '#9FE050', color: '#2B5200', fontSize: '16px', fontWeight: '800', cursor: 'pointer', transition: 'opacity 0.15s' }}
        >
          <RotateCcw size={17} /> 再次实战
        </button>
        <button
          onClick={onChangeScenario}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', borderRadius: '99px', border: '1.5px solid rgba(0,0,0,0.10)', background: '#FFF', color: '#444', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.15s' }}
        >
          <LayoutGrid size={17} /> {isDynamic ? '更换内容' : '更换主题'}
        </button>
      </div>
    </div>
  );
}
