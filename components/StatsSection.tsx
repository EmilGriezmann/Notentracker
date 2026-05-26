'use client';

import { useMemo } from 'react';
import { Semester } from '@/types';
import { calculateSemesterAverage, calculateSubjectAverage, pointsToGrade } from '@/lib/store';

// Catmull-Rom → cubic Bézier smooth path
function smoothLinePath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return '';
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(i - 1, 0)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(i + 2, pts.length - 1)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x} ${p2.y}`;
    }
    return d;
}

// ─── Trend Card ───────────────────────────────────────────────────────────────

interface TrendPoint { name: string; avg: number }

function TrendCard({ data }: { data: TrendPoint[] }) {
    const W = 260, H = 90;
    const padL = 28, padR = 8, padT = 8, padB = 20;

    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const latestAvg = data.length > 0 ? data[data.length - 1].avg : null;

    if (data.length < 2) {
        return (
            <div className="rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 shadow-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Verlauf</span>
                <div className="flex items-center justify-center h-24 text-[var(--color-text-muted)] text-sm">
                    Mind. 2 Semester nötig
                </div>
            </div>
        );
    }

    const values = data.map(d => d.avg);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const span = Math.max(maxVal - minVal, 1.5);
    const lo = minVal - span * 0.15;
    const hi = maxVal + span * 0.15;

    const toX = (i: number) => padL + (i / (data.length - 1)) * chartW;
    const toY = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * chartH;

    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.avg) }));
    const linePath = smoothLinePath(pts);
    const areaPath = linePath + ` L ${pts[pts.length - 1].x} ${H - padB} L ${pts[0].x} ${H - padB} Z`;

    const yTicks = [maxVal, minVal];

    return (
        <div className="rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Verlauf</span>
                {latestAvg !== null && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-[var(--color-text)] leading-none">
                            ø {latestAvg.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                            ≈ {pointsToGrade(latestAvg).toFixed(2)}
                        </div>
                    </div>
                )}
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="statGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0a84ff" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#0a84ff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-axis labels */}
                {yTicks.map((v, i) => (
                    <text
                        key={i}
                        x={padL - 5}
                        y={toY(v)}
                        fontSize="7.5"
                        fill="var(--color-text-muted)"
                        textAnchor="end"
                        dominantBaseline="middle"
                    >
                        {v.toFixed(1)}
                    </text>
                ))}

                {/* Area fill */}
                <path d={areaPath} fill="url(#statGrad)" />

                {/* Line */}
                <path d={linePath} fill="none" stroke="#0a84ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Dots */}
                {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="#0a84ff" />
                ))}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text
                        key={i}
                        x={toX(i)}
                        y={H - 4}
                        fontSize="7.5"
                        fill="var(--color-text-muted)"
                        textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
                        dominantBaseline="auto"
                    >
                        {d.name}
                    </text>
                ))}
            </svg>
        </div>
    );
}

// ─── Best Klausuren Card ──────────────────────────────────────────────────────

interface KlausurItem {
    subjectName: string;
    semesterName: string;
    quarterName: string;
    grade: number;
}

function BestKlausurenCard({ items }: { items: KlausurItem[] }) {
    const rankColors = ['#0a84ff', '#30d158', '#ff9f0a'];

    return (
        <div className="rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 shadow-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-4 block">
                Beste Klausuren
            </span>
            <div className="flex flex-col gap-3.5">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div
                            className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: rankColors[i] }}
                        >
                            {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-[var(--color-text)] truncate leading-tight">
                                {item.subjectName}
                            </div>
                            <div className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                                {item.semesterName} · {item.quarterName}
                            </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <span className="text-xl font-bold text-[var(--color-text)] leading-none">
                                {item.grade}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)] ml-0.5">Pkt</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Stats Section ────────────────────────────────────────────────────────────

interface Props {
    semesters: Semester[];
}

export default function StatsSection({ semesters }: Props) {
    const trendData = useMemo<TrendPoint[]>(() =>
        semesters
            .map(s => ({ name: s.name, avg: calculateSemesterAverage(s) }))
            .filter((d): d is TrendPoint => d.avg !== null),
        [semesters]
    );

    const bestKlausuren = useMemo<KlausurItem[]>(() => {
        const results: KlausurItem[] = [];
        semesters.forEach(sem => {
            sem.subjects
                .filter(sub => sub.assessmentType === 'WRITTEN')
                .forEach(sub => {
                    sub.quarters.forEach(q => {
                        if (q.written !== undefined && q.written !== null) {
                            results.push({
                                subjectName: sub.name,
                                semesterName: sem.name,
                                quarterName: q.name,
                                grade: q.written,
                            });
                        }
                    });
                });
        });
        return results.sort((a, b) => b.grade - a.grade).slice(0, 3);
    }, [semesters]);

    if (trendData.length === 0 && bestKlausuren.length === 0) return null;

    const showBoth = trendData.length >= 2 && bestKlausuren.length > 0;

    return (
        <section className={`mb-10 animate-slide-up grid gap-4 ${showBoth ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            {trendData.length > 0 && <TrendCard data={trendData} />}
            {bestKlausuren.length > 0 && <BestKlausurenCard items={bestKlausuren} />}
        </section>
    );
}
