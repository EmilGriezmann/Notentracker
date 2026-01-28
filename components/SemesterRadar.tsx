'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
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
        <div className="w-full h-full min-h-[250px] p-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="points"
                        tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }}
                        axisLine={{ stroke: '#ffffff20' }}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        domain={[0, maxCount + 1]}
                        tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13 }}
                        labelFormatter={(v) => `${v} Punkte`}
                        formatter={(value: number) => [`${value} Fächer`, 'Anzahl']}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={true}>
                        {chartData.map((_, i) => (
                            <Cell key={i} fill="#0a84ff" fillOpacity={0.8} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
