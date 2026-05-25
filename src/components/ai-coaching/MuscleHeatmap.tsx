import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { logger } from '@/lib/logger';

interface MuscleVolumeData {
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
}

interface Props { period?: string }

export const MuscleHeatmap: React.FC<Props> = ({ period = 'month' }) => {
  const router = useRouter();
  const [muscleVolumes, setMuscleVolumes] = useState<MuscleVolumeData>({ chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analysis/muscle-volume?period=${period}`, { credentials: 'include' });
        if (response.ok) setMuscleVolumes(await response.json());
        else if (response.status !== 401) logger.warn('muscle-volume API warning:', await response.text());
      } catch (e) { logger.error('muscle-volume fetch error:', e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [period]);

  const formatVolume = (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 't' : v + ' kg';

  const getHeatStyle = (v: number) => {
    if (v === 0) return { background: 'var(--surface-3)', borderColor: 'var(--border)' };
    if (v < 1000) return { background: 'rgba(163,230,53,0.12)', borderColor: 'rgba(163,230,53,0.3)' };
    if (v < 5000) return { background: 'rgba(163,230,53,0.28)', borderColor: 'rgba(163,230,53,0.5)' };
    return { background: 'rgba(239,68,68,0.22)', borderColor: 'rgba(239,68,68,0.5)' };
  };

  const getAccent = (v: number) =>
    v === 0 ? 'var(--text-faint)' : v < 1000 ? '#a3e635' : v < 5000 ? '#84cc16' : '#ef4444';

  const LABELS: Record<string, string> = { chest: '胸部', back: '背部', legs: '腿部', shoulders: '肩部', arms: '手臂' };

  if (loading) {
    return (
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="animate-pulse">
          <div className="h-5 bg-secondary rounded w-1/3 mb-4" />
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-secondary rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
        <Dumbbell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        肌群训练热力图
      </h2>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {Object.entries(muscleVolumes).map(([mg, vol]) => {
          const hs = getHeatStyle(vol);
          const accent = getAccent(vol);
          return (
            <button
              key={mg}
              onClick={() => router.push(`/muscle-history/${mg}?period=${period}`)}
              className="rounded-xl h-20 flex flex-col items-center justify-center transition-all active:scale-95 hover:brightness-110"
              style={{ background: hs.background, border: `1.5px solid ${hs.borderColor}` }}
            >
              <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{LABELS[mg]}</span>
              <span className="text-xs font-semibold mt-1" style={{ color: accent }}>
                {formatVolume(vol)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 text-[11px]" style={{ color: 'var(--text-faint)' }}>
        {([['var(--surface-3)', '未训练'], ['rgba(163,230,53,0.4)', '<1000kg'], ['rgba(132,204,22,0.6)', '<5000kg'], ['rgba(239,68,68,0.5)', '≥5000kg']] as [string, string][]).map(([bg, lbl]) => (
          <div key={lbl} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: bg }} />
            <span>{lbl}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>点击肌群查看训练历史</p>
      </div>
    </div>
  );
};