'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
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
            color: s.color || '#fff'
        };
    }).filter(d => d.avg !== null);

    if (subjectData.length === 0) return null;

    const allPoints = subjectData.map(d => d.avg as number);
    const maxPoint = Math.max(...allPoints);
    const minPoint = Math.min(...allPoints);

    const chartData = [];
    for (let p = maxPoint; p >= minPoint; p--) {
        const matchingSubjects = subjectData.filter(d => d.avg === p);
        chartData.push({
            point: `${p}`,
            count: matchingSubjects.length,
            fullMark: subjects.length,
            subjects: matchingSubjects.map(s => s.name).join(', ')
        });
    }

    return (
        <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis
                        dataKey="point"
                        tick={{ fill: '#888', fontSize: 12, fontWeight: 600 }}
                        tickSize={5}
                    />
                    <PolarRadiusAxis domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                        name="Anzahl"
                        dataKey="count"
                        stroke="#0a84ff"
                        strokeWidth={3}
                        fill="#0a84ff"
                        fillOpacity={0.5}
                        isAnimationActive={true}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
