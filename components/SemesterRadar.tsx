'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Subject } from '@/types';
import { calculateSubjectAverage } from '@/lib/store';

interface Props {
    subjects: Subject[];
}

export default function SemesterRadar({ subjects }: Props) {
    const subjectData = subjects.map(s => {
        const avg = calculateSubjectAverage(s);
        return {
            name: s.name,
            avg: avg !== null ? Math.round(avg) : null,
        };
    }).filter(d => d.avg !== null);

    if (subjectData.length === 0) return null;

    // Count how many subjects achieved each point value
    const countMap: Record<number, number> = {};
    subjectData.forEach(d => {
        const p = d.avg as number;
        countMap[p] = (countMap[p] || 0) + 1;
    });

    // Only include achieved grade points, sorted ascending
    const chartData = Object.keys(countMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map(p => ({
            points: p,
            count: countMap[p],
        }));

    const maxCount = Math.max(...chartData.map(d => d.count));

    return (
        <div className="w-full h-full min-h-[225px] pt-8 pb-4 px-4 pointer-events-none select-none">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="points"
                        tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }}
                        axisLine={{ stroke: '#ffffff20' }}
                        tickLine={false}
                    />
                    <YAxis
                        width={20}
                        allowDecimals={false}
                        domain={[0, maxCount + 1]}
                        tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                        {chartData.map((_, i) => (
                            <Cell key={i} fill="#ffffff" fillOpacity={0.85} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
