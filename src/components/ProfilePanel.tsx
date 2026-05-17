'use client';
import { X } from 'lucide-react';
import { PlayerProfile, RANKS, BADGES, getCurrentRank, getNextRank, getRankProgress } from '@/lib/ranks';

interface Props {
  profile: PlayerProfile;
  onClose: () => void;
}

export default function ProfilePanel({ profile, onClose }: Props) {
  const rank = getCurrentRank(profile.xp);
  const nextRank = getNextRank(profile.xp);
  const progress = getRankProgress(profile.xp);
  const winRate = profile.totalSparrings > 0 ? Math.round((profile.wins / profile.totalSparrings) * 100) : 0;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 100, animation: 'fadeInOverlay 0.2s ease',
        }}
      />

      {/* Panel */}
      <div
        className="animate-slide-up"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          maxWidth: '540px', margin: '0 auto',
          background: '#FFF', borderRadius: '24px 24px 0 0',
          zIndex: 101, padding: '24px 20px 40px',
          maxHeight: '80vh', overflowY: 'auto',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.1)',
        }}
      >
        {/* Handle + Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '5px', borderRadius: '99px', background: '#E0E0E0', margin: '0 auto' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', position: 'absolute', right: '16px', top: '16px' }}>
            <X size={22} color="#6B6B6B" />
          </button>
        </div>

        {/* Rank Section */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>
            {rank.id === 'rookie' ? '🥋' : rank.id === 'shodan' ? '⚪' : rank.id === 'nidan' ? '🟢' : rank.id === 'sandan' ? '🔵' : rank.id === 'yondan' ? '🔴' : '⚫'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#111', letterSpacing: '-0.3px' }}>
            {rank.title}
          </div>
          <div style={{ fontSize: '14px', color: '#6B6B6B', fontWeight: '500', marginTop: '4px' }}>
            {nextRank ? `下一段位：${nextRank.title}` : '已达最高段位'}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#ADADAD' }}>经验值</span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#111' }}>
              {profile.xp} {nextRank ? `/ ${nextRank.minXP}` : ''}
            </span>
          </div>
          <div style={{ height: '10px', background: '#F0F0F0', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${progress.pct}%`, height: '100%', background: 'linear-gradient(90deg, #9FE050, #7BC040)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: '对练次数', value: profile.totalSparrings },
            { label: '获胜', value: profile.wins },
            { label: '胜率', value: `${winRate}%` },
            { label: '徽章', value: profile.unlockedBadges.length },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: '#F7F7F9', borderRadius: '16px', padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#111', lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ADADAD', marginTop: '4px', letterSpacing: '0.3px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#111', marginBottom: '14px' }}>
          荣誉徽章
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Object.values(BADGES).map(badge => {
            const unlocked = profile.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                style={{
                  background: unlocked ? '#FFF' : '#F7F7F9',
                  borderRadius: '16px',
                  border: unlocked ? '1.5px solid rgba(159,224,80,0.3)' : '1.5px solid rgba(0,0,0,0.04)',
                  padding: '14px 12px',
                  opacity: unlocked ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '22px', filter: unlocked ? 'none' : 'grayscale(1)' }}>
                    {badge.icon}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: unlocked ? '#111' : '#ADADAD' }}>
                    {badge.title}
                  </span>
                  {unlocked && <span style={{ marginLeft: 'auto', fontSize: '14px' }}>✅</span>}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '500', color: unlocked ? '#6B6B6B' : '#ADADAD', lineHeight: 1.4, marginTop: '2px' }}>
                  {badge.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </>
  );
}
