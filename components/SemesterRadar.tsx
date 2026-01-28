'use client';

import { Subject } from '@/types';
import { calculateSubjectAverage } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';

interface Props {
    subjects: Subject[];
}

function AnimatedRow({ name, target, color, delay }: { name: string; target: number; color: string; delay: number }) {
    const [pct, setPct] = useState(0);
    const [displayVal, setDisplayVal] = useState(0);
    const frameRef = useRef(0);

    useEffect(() => {
        const targetPct = (target / 15) * 100;
        const duration = 900;
        let startTime: number | null = null;

        const timeout = setTimeout(() => {
            const animate = (now: number) => {
                if (!startTime) startTime = now;
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                setPct(targetPct * eased);
                setDisplayVal(Math.round(target * eased));

                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(animate);
                }
            };
            frameRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(frameRef.current);
        };
    }, [target, delay]);

    return (
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-sm font-semibold text-[var(--color-text)] truncate">{name}</span>
                <span className="text-xs font-bold text-[var(--color-text-muted)] tabular-nums ml-2 shrink-0">{displayVal}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
                <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

export default function SemesterRadar({ subjects }: Props) {
    const ranked = subjects
        .map(s => ({
            name: s.name,
            color: s.color || '#888',
            avg: calculateSubjectAverage(s),
        }))
        .filter(d => d.avg !== null)
        .sort((a, b) => (b.avg as number) - (a.avg as number))
        .slice(0, 3);

    if (ranked.length === 0) return null;

    return (
        <div className="w-full h-full flex flex-col justify-center gap-4 px-6 py-6">
            <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Top {ranked.length}</span>
            {ranked.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] w-4 text-right">{i + 1}</span>
                    <AnimatedRow name={s.name} target={s.avg as number} color={s.color} delay={i * 150} />
                </div>
            ))}
        </div>
    );
}
