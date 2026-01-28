'use client';

import { useState, useEffect } from 'react';
import { calculateSubjectAverage } from '@/lib/store';
import { Subject } from '@/types';
import clsx from 'clsx';
import { ChevronDown, Edit2 } from 'lucide-react';

interface Props {
    subject: Subject;
    onChange: (updated: Subject) => void;
    onDelete: () => void;
    onEdit: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export default function SubjectCard({ subject, onChange, onDelete, onEdit, isExpanded, onToggleExpand }: Props) {
    // We need local state for inputs to prevent "Jumping" during edit.
    // The props 'subject' will be updated only on blur, which causes the sort/reorder.
    const [localQuarters, setLocalQuarters] = useState(subject.quarters);
    const [overrideInput, setOverrideInput] = useState(
        subject.finalOverride !== undefined ? String(subject.finalOverride) : ''
    );
    const [isEditingOverride, setIsEditingOverride] = useState(false);

    // Sync local state if subject prop changes externally (e.g. initial load or other edits)
    // Crucial: Only sync if we are NOT currently editing? 
    // Actually, if a re-sort happens, 'subject' prop changes (it might be a different object reference or just positional). 
    // But typically we want to reflect the prop.
    useEffect(() => {
        setLocalQuarters(subject.quarters);
        setOverrideInput(subject.finalOverride !== undefined ? String(subject.finalOverride) : '');
        setIsEditingOverride(false);
    }, [subject.quarters, subject.finalOverride]);

    const averagePoints = calculateSubjectAverage(subject);
    const roundedPoints = averagePoints !== null ? Math.round(averagePoints) : null;

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

    const commitOverride = () => {
        const trimmed = overrideInput.trim();
        const parsed = trimmed === '' ? undefined : Number.parseInt(trimmed, 10);

        if (parsed !== undefined && (Number.isNaN(parsed) || parsed < 0 || parsed > 15)) {
            // Invalid value: do nothing, keep editing
            return;
        }

        const nextSubject: Subject = {
            ...subject,
            finalOverride: parsed === undefined ? undefined : parsed
        };
        onChange(nextSubject);
        setIsEditingOverride(false);
    };

    return (
        <div
            className={clsx(
                "group bg-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden border border-white/[0.08] transition-all duration-300 ease-spring hover:bg-white/[0.09]",
                isExpanded && "ring-1 ring-white/[0.12]"
            )}
        >

            {/* Header Row */}
            <div className="px-4 py-4 sm:py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-semibold text-white/90"
                        style={{ backgroundColor: subject.color || '#333' }}
                    >
                        {subject.type}
                    </div>
                    <h3 className="font-medium text-white tracking-wide">{subject.name}</h3>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90"
                        title="Bearbeiten"
                    >
                        <Edit2 size={13} />
                    </button>

                    {isEditingOverride ? (
                        <input
                            autoFocus
                            type="number"
                            min="0"
                            max="15"
                            step="1"
                            value={overrideInput}
                            onChange={(e) => setOverrideInput(e.target.value)}
                            onBlur={commitOverride}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    commitOverride();
                                }
                                if (e.key === 'Escape') {
                                    setIsEditingOverride(false);
                                    setOverrideInput(subject.finalOverride !== undefined ? String(subject.finalOverride) : '');
                                }
                            }}
                            className="w-14 bg-black/40 border border-white/10 rounded-md px-2 py-1 text-center text-base sm:text-lg font-bold text-white outline-none focus:border-primary/60"
                            placeholder="–"
                        />
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsEditingOverride(true); }}
                            className={clsx(
                                "text-base sm:text-lg font-bold tabular-nums px-2 py-1 rounded-md transition-colors",
                                subject.finalOverride !== undefined
                                    ? "text-primary"
                                    : "text-white"
                            )}
                            title="Zeugnisnote überschreiben (0-15 Punkte)"
                        >
                            {roundedPoints !== null ? roundedPoints : '—'}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                        className={clsx(
                            "w-12 h-12 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-all duration-300 ease-spring active:scale-90 touch-manipulation",
                            isExpanded && "rotate-180 text-white/80"
                        )}
                        title={isExpanded ? "Eingabe schließen" : "Noten eingeben"}
                        aria-expanded={isExpanded}
                    >
                        <ChevronDown size={15} />
                    </button>
                </div>
            </div>

            {/* Grades Grid */}
            {isExpanded && (
                <div className="grid grid-cols-2 border-t border-white/[0.06] animate-expand">
                    {localQuarters.map((q, idx) => (
                        <div key={q.id || idx} className="p-3">
                            <div className="text-[10px] font-medium text-white/40 uppercase mb-2 text-center tracking-widest">{q.name}</div>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white/[0.04] rounded-xl p-1.5 flex flex-col items-center">
                                    <span className="text-[9px] text-white/30 uppercase mb-1">Somi</span>
                                    <input
                                        type="number"
                                        min="0" max="15"
                                        value={q.somi === undefined ? '' : q.somi}
                                        onChange={(e) => handleLocalChange(idx, 'somi', e.target.value)}
                                        onBlur={commitChange}
                                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                        className="w-full bg-transparent text-center font-medium text-white outline-none focus:text-primary transition-colors duration-200 text-sm py-1"
                                        placeholder="-"
                                    />
                                </div>
                                {subject.assessmentType === 'WRITTEN' && (
                                    <div className="flex-1 bg-white/[0.04] rounded-xl p-1.5 flex flex-col items-center">
                                        <span className="text-[9px] text-white/30 uppercase mb-1">Klausur</span>
                                        <input
                                            type="number"
                                            min="0" max="15"
                                            value={q.written === undefined ? '' : q.written}
                                            onChange={(e) => handleLocalChange(idx, 'written', e.target.value)}
                                            onBlur={commitChange}
                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                            className="w-full bg-transparent text-center font-medium text-white outline-none focus:text-primary transition-colors duration-200 text-sm py-1"
                                            placeholder="-"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
