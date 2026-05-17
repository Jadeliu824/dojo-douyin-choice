'use client';
import { useRef, useState } from 'react';
import { Share2, Check, X } from 'lucide-react';

interface ShareCardProps {
  score: number;
  opponentRole: string;
  goldPhrase?: string;
  scenarioTitle?: string;
  isSuccess: boolean;
  onClose: () => void;
}

export default function ShareCard({ score, opponentRole, goldPhrase, scenarioTitle, isSuccess, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const CANVAS_W = 600;
  const CANVAS_H = 780;

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = CANVAS_W;
    const h = CANVAS_H;

    // ── Background ──
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // ── Top decorative band ──
    const bandGrad = ctx.createLinearGradient(0, 0, w, 0);
    bandGrad.addColorStop(0, '#D4F5A2');
    bandGrad.addColorStop(0.3, '#C2F0E8');
    bandGrad.addColorStop(0.6, '#C8E6FF');
    bandGrad.addColorStop(1, '#E8D8FF');
    ctx.fillStyle = bandGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, 8, [0, 0, 0, 0]);
    ctx.fill();

    // ── Brand ──
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 26px -apple-system, "SF Pro Display", sans-serif';
    ctx.fillText('Dojo', 36, 62);

    ctx.fillStyle = '#6B6B6B';
    ctx.font = '500 13px -apple-system, sans-serif';
    ctx.fillText('开口才算学会', 36, 86);

    // ── Score circle ──
    const scoreCx = w / 2;
    const scoreCy = 200;
    const scoreR = 70;

    // Outer ring background
    ctx.beginPath();
    ctx.arc(scoreCx, scoreCy, scoreR, 0, Math.PI * 2);
    ctx.fillStyle = isSuccess ? '#F0FAE6' : '#FFF0F0';
    ctx.fill();

    // Score arc
    ctx.beginPath();
    ctx.arc(scoreCx, scoreCy, scoreR - 4, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.min(score, 100)) / 100);
    ctx.strokeStyle = isSuccess ? '#9FE050' : '#FFB0B0';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score number
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 56px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(score), scoreCx, scoreCy - 2);

    ctx.fillStyle = '#ADADAD';
    ctx.font = '500 13px -apple-system, sans-serif';
    ctx.fillText('沟通顺畅度', scoreCx, scoreCy + 44);
    ctx.textBaseline = 'alphabetic';

    // ── Result badge ──
    const badgeY = 298;
    const badgeColors = isSuccess
      ? { bg: '#D4F5A2', text: '#3A7000', label: '✅ 对练成功' }
      : { bg: '#FFD6D6', text: '#CC0000', label: '💔 谈崩了' };

    ctx.textAlign = 'center';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    const badgeText = badgeColors.label;
    const badgeW = ctx.measureText(badgeText).width + 32;
    ctx.fillStyle = badgeColors.bg;
    ctx.beginPath();
    ctx.roundRect(scoreCx - badgeW / 2, badgeY - 14, badgeW, 32, 99);
    ctx.fill();

    ctx.fillStyle = badgeColors.text;
    ctx.fillText(badgeText, scoreCx, badgeY + 6);
    ctx.textAlign = 'left';

    // ── Opponent & Scenario ──
    ctx.fillStyle = '#6B6B6B';
    ctx.font = '500 14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`对手：${opponentRole || '未知'}`, scoreCx, 360);
    if (scenarioTitle) {
      ctx.font = '500 13px -apple-system, sans-serif';
      ctx.fillStyle = '#ADADAD';
      ctx.fillText(scenarioTitle.length > 30 ? scenarioTitle.slice(0, 30) + '...' : scenarioTitle, scoreCx, 384);
    }
    ctx.textAlign = 'left';

    // ── Gold phrase card ──
    if (goldPhrase) {
      const cardY = 422;
      ctx.fillStyle = '#FFF8E1';
      ctx.beginPath();
      ctx.roundRect(36, cardY, w - 72, 110, 16);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,215,0,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(36, cardY, w - 72, 110, 16);
      ctx.stroke();

      ctx.fillStyle = '#8B6914';
      ctx.font = 'bold 12px -apple-system, sans-serif';
      ctx.fillText('🥇 金牌示范', 56, cardY + 24);

      // Word wrap
      const maxWidth = w - 124;
      ctx.fillStyle = '#6B5B00';
      ctx.font = '500 15px -apple-system, sans-serif';
      const chars = goldPhrase.split('');
      const lines: string[] = [];
      let line = '';
      for (const ch of chars) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxWidth) {
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);

      let ly = cardY + 52;
      for (const l of lines) {
        ctx.fillText(`“${l}”`, 56, ly);
        ly += 28;
      }
    }

    // ── Divider ──
    const dividerY = goldPhrase ? 578 : 470;
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, dividerY);
    ctx.lineTo(w - 36, dividerY);
    ctx.stroke();

    // ── Footer ──
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 15px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dojo · 开口才算学会', w / 2, dividerY + 44);

    ctx.fillStyle = '#ADADAD';
    ctx.font = '500 12px -apple-system, sans-serif';
    ctx.fillText('在对话中成长，在实战中精进', w / 2, dividerY + 70);

    ctx.fillStyle = '#D4D4D4';
    ctx.font = '500 11px -apple-system, sans-serif';
    ctx.fillText('dojo-douyin.vercel.app', w / 2, dividerY + 96);
    ctx.textAlign = 'left';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', padding: '20px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: '#FFF', borderRadius: '20px', padding: '20px',
        maxWidth: '380px', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '17px', fontWeight: '800', color: '#111' }}>分享战绩</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color="#ADADAD" />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ width: '100%', height: 'auto', borderRadius: '14px', display: 'block' }}
          onLoad={drawCard}
        />

        <button
          onClick={() => {
            drawCard();
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.toBlob((blob) => {
              if (!blob) return;
              navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ]).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }).catch(() => {
                const a = document.createElement('a');
                a.href = canvas.toDataURL();
                a.download = 'dojo-share.png';
                a.click();
              });
            });
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '14px', borderRadius: '99px', border: 'none',
            background: copied ? '#D4F5A2' : '#111',
            color: copied ? '#3A7000' : '#FFF',
            fontSize: '15px', fontWeight: '800', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? <Check size={18} /> : <Share2 size={18} />}
          {copied ? '已复制到剪贴板' : '复制图片'}
        </button>

        <div style={{ fontSize: '12px', color: '#ADADAD', fontWeight: '500', textAlign: 'center' }}>
          可直接粘贴到朋友圈、小红书分享
        </div>
      </div>
    </div>
  );
}
