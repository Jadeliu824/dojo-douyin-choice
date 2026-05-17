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

    // Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, w, h);

    // Decorative top gradient
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#9FE050');
    grad.addColorStop(1, '#7BC040');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, 6, [0, 0, 0, 0]);
    ctx.fill();

    // Brand
    ctx.fillStyle = '#9FE050';
    ctx.font = 'bold 22px -apple-system, "SF Pro Display", sans-serif';
    ctx.fillText('🎬 练练', 30, 58);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '13px -apple-system, sans-serif';
    ctx.fillText('从视频到本能', 30, 82);

    // Score circle
    const scoreCx = w / 2;
    const scoreCy = 210;
    const scoreR = 72;

    ctx.beginPath();
    ctx.arc(scoreCx, scoreCy, scoreR, 0, Math.PI * 2);
    ctx.fillStyle = isSuccess ? 'rgba(159,224,80,0.15)' : 'rgba(255,77,77,0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(scoreCx, scoreCy, scoreR - 4, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100);
    ctx.strokeStyle = isSuccess ? '#9FE050' : '#FF6B6B';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(score), scoreCx, scoreCy + 16);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText('沟通顺畅度', scoreCx, scoreCy + 50);
    ctx.textAlign = 'left';

    // Status
    ctx.fillStyle = isSuccess ? '#9FE050' : '#FF6B6B';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isSuccess ? '✅ 对练成功' : '💔 谈崩了', w / 2, 320);
    ctx.textAlign = 'left';

    // Opponent
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`对手：${opponentRole}`, w / 2, 355);
    if (scenarioTitle) {
      ctx.fillText(scenarioTitle.length > 30 ? scenarioTitle.slice(0, 30) + '...' : scenarioTitle, w / 2, 378);
    }
    ctx.textAlign = 'left';

    // Gold phrase
    if (goldPhrase) {
      const phraseY = 440;
      ctx.fillStyle = 'rgba(255,215,0,0.2)';
      ctx.beginPath();
      ctx.roundRect(40, phraseY - 10, w - 80, 90, 16);
      ctx.fill();

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 13px -apple-system, sans-serif';
      ctx.fillText('🥇 金牌示范', 60, phraseY + 12);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '17px -apple-system, sans-serif';

      // Word wrap for phrase
      const maxWidth = w - 120;
      const words = goldPhrase;
      const lines: string[] = [];
      let line = '';
      for (const ch of words) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxWidth) {
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);

      let ly = phraseY + 42;
      for (const l of lines) {
        ctx.fillText(`“${l}”`, 60, ly);
        ly += 26;
      }
    }

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 600);
    ctx.lineTo(w - 40, 600);
    ctx.stroke();

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎬 练练 — 你的视频搭子', w / 2, 640);
    ctx.fillText('让视频里的技巧，变成你身上的本能', w / 2, 662);

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText('sparring-ground.vercel.app', w / 2, 695);
    ctx.textAlign = 'left';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', padding: '20px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: '#FFF', borderRadius: '24px', padding: '20px',
        maxWidth: '400px', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#111' }}>分享你的战绩</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color="#6B6B6B" />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block' }}
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
                // Fallback: download
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
          {copied ? '已复制到剪贴板' : '复制图片到剪贴板'}
        </button>

        <div style={{ fontSize: '12px', color: '#ADADAD', fontWeight: '500', textAlign: 'center' }}>
          将图片粘贴到朋友圈、小红书或微信群分享
        </div>
      </div>
    </div>
  );
}
