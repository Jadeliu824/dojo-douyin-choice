'use client';

/* ── Rank Definitions ── */
export interface RankDef {
  id: string;
  title: string;
  minXP: number;
}

export const RANKS: RankDef[] = [
  { id: 'rookie',       title: '入门武者', minXP: 0 },
  { id: 'shodan',       title: '初段',     minXP: 100 },
  { id: 'nidan',        title: '二段',     minXP: 300 },
  { id: 'sandan',       title: '三段',     minXP: 600 },
  { id: 'yondan',       title: '四段',     minXP: 1200 },
  { id: 'godan',        title: '五段',     minXP: 2000 },
];

/* ── Badge Definitions ── */
export interface BadgeDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const BADGES: Record<string, BadgeDef> = {
  first_step:    { id: 'first_step',    title: '初出茅庐', desc: '完成你的第一次实战对练',                  icon: '🌱' },
  pitfall_expert:{ id: 'pitfall_expert',title: '避坑专家', desc: '完成压力值≥8的高难度对练并成功通关',     icon: '🛡️' },
  empathy_master:{ id: 'empathy_master',title: '同理心大师',desc: '完成压力值≥9的地狱级对练并成功通关',    icon: '💎' },
  iron_wall:     { id: 'iron_wall',     title: '铁壁防守', desc: '在对练全程态度分未低于40的情况下获胜',    icon: '🧱' },
  speed_demon:   { id: 'speed_demon',   title: '速战速决', desc: '在5回合内成功完成对练',                   icon: '⚡' },
  comeback:      { id: 'comeback',      title: '极限翻盘', desc: '态度分跌破20后逆转为胜',                  icon: '🔥' },
  tenacious:     { id: 'tenacious',     title: '百折不挠', desc: '累计完成10次对练',                        icon: '💪' },
  hell_warrior:  { id: 'hell_warrior',  title: '地狱勇士', desc: '完成初始压力值为10的终极地狱级对练',      icon: '👹' },
};

/* ── Player Profile ── */
export interface SparringRecord {
  scenarioTitle: string;
  initialPressure: number;
  finalScore: number;
  turnCount: number;
  lowestScore: number;
  isWin: boolean;
  timestamp: number;
}

export interface PlayerProfile {
  xp: number;
  totalSparrings: number;
  wins: number;
  unlockedBadges: string[];
  records: SparringRecord[];
}

const STORAGE_KEY = 'dojo_player_profile';

export function getDefaultProfile(): PlayerProfile {
  return { xp: 0, totalSparrings: 0, wins: 0, unlockedBadges: [], records: [] };
}

export function loadProfile(): PlayerProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProfile();
    return JSON.parse(raw) as PlayerProfile;
  } catch {
    return getDefaultProfile();
  }
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

/* ── XP Calculation ── */
export function calcXP(initialPressure: number, isWin: boolean): number {
  return initialPressure * 10 + (isWin ? 20 : 5);
}

/* ── Rank Lookup ── */
export function getCurrentRank(xp: number): RankDef {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r;
  }
  return rank;
}

export function getNextRank(xp: number): RankDef | null {
  for (const r of RANKS) {
    if (xp < r.minXP) return r;
  }
  return null;
}

export function getRankProgress(xp: number): { prev: number; next: number; pct: number } {
  const next = getNextRank(xp);
  if (!next) return { prev: RANKS[RANKS.length - 1].minXP, next: RANKS[RANKS.length - 1].minXP, pct: 100 };
  const idx = RANKS.indexOf(next);
  const prev = idx > 0 ? RANKS[idx - 1].minXP : 0;
  const range = next.minXP - prev;
  const pct = range > 0 ? Math.min(100, Math.round(((xp - prev) / range) * 100)) : 100;
  return { prev, next: next.minXP, pct };
}

/* ── Achievement Checking ── */
export interface UnlockResult {
  badgeId: string;
  badge: BadgeDef;
  isNew: boolean;
}

export function checkNewBadges(
  profile: PlayerProfile,
  initialPressure: number,
  finalScore: number,
  turnCount: number,
  lowestScore: number,
  isWin: boolean,
): UnlockResult[] {
  const results: UnlockResult[] = [];
  const already = new Set(profile.unlockedBadges);

  const check = (id: string, condition: boolean) => {
    results.push({
      badgeId: id,
      badge: BADGES[id],
      isNew: condition && !already.has(id),
    });
  };

  check('first_step', profile.totalSparrings >= 1);
  check('pitfall_expert', initialPressure >= 8 && isWin);
  check('empathy_master', initialPressure >= 9 && isWin);
  check('iron_wall', isWin && lowestScore >= 40);
  check('speed_demon', isWin && turnCount <= 5);
  check('comeback', isWin && lowestScore < 20);
  check('tenacious', profile.totalSparrings >= 10);
  check('hell_warrior', initialPressure === 10 && isWin);

  return results.filter(r => r.isNew);
}

/* ── Update Profile After Sparring ── */
export function updateProfile(
  profile: PlayerProfile,
  scenarioTitle: string,
  initialPressure: number,
  finalScore: number,
  turnCount: number,
  lowestScore: number,
): { profile: PlayerProfile; newBadges: UnlockResult[] } {
  const isWin = finalScore >= 80;
  const gainedXP = calcXP(initialPressure, isWin);

  const record: SparringRecord = {
    scenarioTitle,
    initialPressure,
    finalScore,
    turnCount,
    lowestScore,
    isWin,
    timestamp: Date.now(),
  };

  const updated: PlayerProfile = {
    xp: profile.xp + gainedXP,
    totalSparrings: profile.totalSparrings + 1,
    wins: profile.wins + (isWin ? 1 : 0),
    unlockedBadges: [...profile.unlockedBadges],
    records: [...profile.records, record],
  };

  const newBadges = checkNewBadges(
    updated,
    initialPressure,
    finalScore,
    turnCount,
    lowestScore,
    isWin,
  );

  for (const nb of newBadges) {
    updated.unlockedBadges.push(nb.badgeId);
  }

  saveProfile(updated);
  return { profile: updated, newBadges };
}
