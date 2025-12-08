'use client';

import { useState, useEffect } from 'react';
import { pointsToGrade, calculateSubjectAverage } from '@/lib/store';
import { Subject } from '@/types';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';

interface Props {
    subject: Subject;
    onChange: (updated: Subject) => void;
    onDelete: () => void;
}

export default function SubjectCard({ subject, onChange, onDelete }: Props) {
    // We need local state for inputs to prevent "Jumping" during edit.
    // The props 'subject' will be updated only on blur, which causes the sort/reorder.
    const [localQuarters, setLocalQuarters] = useState(subject.quarters);

    // Sync local state if subject prop changes externally (e.g. initial load or other edits)
    // Crucial: Only sync if we are NOT currently editing? 
    // Actually, if a re-sort happens, 'subject' prop changes (it might be a different object reference or just positional). 
    // But typically we want to reflect the prop.
    useEffect(() => {
        setLocalQuarters(subject.quarters);
    }, [subject.quarters]);

    const average = calculateSubjectAverage(subject);
    const averageGrade = average !== null ? pointsToGrade(average) : null;

    const handleLocalChange = (qIndex: number, type: 'somi' | 'written', valueStr: string) => {
        const value = valueStr === '' ? undefined : parseInt(valueStr, 10);
        // Allow empty or valid 0-15
        if (value !== undefined && (isNaN(value) || value < 0 || value > 15)) {
            // We can just ignore invalid input or better yet, allow typing but validate on blur
            return;
            // For simplicity, strict numeric masking:
        }

        const newQuarters = [...localQuarters];
        if (!newQuarters[qIndex]) return;
        newQuarters[qIndex] = { ...newQuarters[qIndex], [type]: value };
        setLocalQuarters(newQuarters);
    };

    const commitChange = () => {
        // Check if actually changed to avoid unnecessary triggers
        if (JSON.stringify(localQuarters) !== JSON.stringify(subject.quarters)) {
            onChange({ ...subject, quarters: localQuarters });
        }
    };

    return (
        <div
            className="group bg-surface/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 transition-all hover:bg-surface-highlight"
            style={{ borderColor: subject.color ? `${subject.color}40` : undefined }}
        >

            {/* Header Row */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
                {subject.color && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: subject.color }} />
                )}

                <div className="flex items-center gap-3 pl-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-sm"
                        style={{ backgroundColor: subject.color || '#333' }}
                    >
                        {subject.type}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white tracking-wide">{subject.name}</h3>
                        <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                            {subject.assessmentType === 'WRITTEN' ? 'Schriftlich' : 'Mündlich'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {average !== null ? (
                        <div className="text-right">
                            <div className="text-lg font-bold text-white tabular-nums">{averageGrade ? averageGrade.toFixed(2) : ''}</div>
                        </div>
                    ) : (
                        <div className="text-white/20 text-sm">—</div>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:bg-danger hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Entfernen"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Grades Grid */}
            <div className="grid grid-cols-2 divide-x divide-white/5">
                {localQuarters.map((q, idx) => (
                    <div key={q.id || idx} className="p-3">
                        <div className="text-[10px] font-bold text-text-muted uppercase mb-2 text-center tracking-widest">{q.name}</div>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/20 rounded-lg p-1.5 flex flex-col items-center">
                                <span className="text-[9px] text-text-muted uppercase mb-1">Somi</span>
                                <input
                                    type="number"
                                    min="0" max="15"
                                    value={q.somi === undefined ? '' : q.somi}
                                    onChange={(e) => handleLocalChange(idx, 'somi', e.target.value)}
                                    onBlur={commitChange}
                                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                    className="w-full bg-transparent text-center font-semibold text-white outline-none focus:text-primary transition-colors text-sm" // Increased text size
                                    placeholder="-"
                                />
                            </div>
                            {subject.assessmentType === 'WRITTEN' && (
                                <div className="flex-1 bg-black/20 rounded-lg p-1.5 flex flex-col items-center">
                                    <span className="text-[9px] text-text-muted uppercase mb-1">Klausur</span>
                                    <input
                                        type="number"
                                        min="0" max="15"
                                        value={q.written === undefined ? '' : q.written}
                                        onChange={(e) => handleLocalChange(idx, 'written', e.target.value)}
                                        onBlur={commitChange}
                                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                        className="w-full bg-transparent text-center font-semibold text-white outline-none focus:text-primary transition-colors text-sm"
                                        placeholder="-"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
