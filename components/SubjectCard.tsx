'use client';

import { useState, useEffect, useRef } from 'react';
import { calculateSubjectAverage } from '@/lib/store';
import { Subject } from '@/types';
import clsx from 'clsx';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';

interface Props {
    subject: Subject;
    onChange: (updated: Subject) => void;
    onDelete: () => void;
    onEdit: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export default function SubjectCard({ subject, onChange, onDelete, onEdit, isExpanded, onToggleExpand }: Props) {
    const [localQuarters, setLocalQuarters] = useState(subject.quarters);
    const [overrideInput, setOverrideInput] = useState(
        subject.finalOverride !== undefined ? String(subject.finalOverride) : ''
    );
    const [isEditingOverride, setIsEditingOverride] = useState(false);

    // Swipe state
    const [swipeX, setSwipeX] = useState(0);
    const touchStartX = useRef(0);
    const touchCurrentX = useRef(0);
    const isSwiping = useRef(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalQuarters(subject.quarters);
        setOverrideInput(subject.finalOverride !== undefined ? String(subject.finalOverride) : '');
        setIsEditingOverride(false);
    }, [subject.quarters, subject.finalOverride]);

    const averagePoints = calculateSubjectAverage(subject);
    const roundedPoints = averagePoints !== null ? Math.round(averagePoints) : null;

    const handleLocalChange = (qIndex: number, type: 'somi' | 'written', valueStr: string) => {
        const value = valueStr === '' ? undefined : parseInt(valueStr, 10);
        if (value !== undefined && (isNaN(value) || value < 0 || value > 15)) return;

        const newQuarters = [...localQuarters];
        if (!newQuarters[qIndex]) return;
        newQuarters[qIndex] = { ...newQuarters[qIndex], [type]: value };
        setLocalQuarters(newQuarters);
    };

    const commitChange = () => {
        if (JSON.stringify(localQuarters) !== JSON.stringify(subject.quarters)) {
            onChange({ ...subject, quarters: localQuarters });
        }
    };

    const commitOverride = () => {
        const trimmed = overrideInput.trim();
        const parsed = trimmed === '' ? undefined : Number.parseInt(trimmed, 10);

        if (parsed !== undefined && (Number.isNaN(parsed) || parsed < 0 || parsed > 15)) return;

        const nextSubject: Subject = {
            ...subject,
            finalOverride: parsed === undefined ? undefined : parsed
        };
        onChange(nextSubject);
        setIsEditingOverride(false);
    };

    // Swipe handlers (disabled when expanded)
    const handleTouchStart = (e: React.TouchEvent) => {
        if (isExpanded) return;
        touchStartX.current = e.touches[0].clientX;
        touchCurrentX.current = e.touches[0].clientX;
        isSwiping.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping.current || isExpanded) return;
        touchCurrentX.current = e.touches[0].clientX;
        const diff = touchStartX.current - touchCurrentX.current;
        // Only allow swipe left (positive diff), clamp to 100px
        const clamped = Math.max(0, Math.min(diff, 100));
        setSwipeX(clamped);
    };

    const handleTouchEnd = () => {
        if (!isSwiping.current || isExpanded) return;
        isSwiping.current = false;
        if (swipeX >= 80) {
            // Snap open to reveal delete
            setSwipeX(80);
        } else {
            setSwipeX(0);
        }
    };

    const handleSwipeDelete = () => {
        setSwipeX(0);
        onDelete();
    };

    return (
        <div className="relative overflow-hidden rounded-3xl" ref={cardRef}>
            {/* Delete button behind */}
            <div
                className="absolute inset-y-0 right-0 w-20 bg-danger flex items-center justify-center text-white rounded-r-3xl transition-opacity"
                style={{ opacity: swipeX > 10 ? 1 : 0 }}
            >
                <button onClick={handleSwipeDelete} className="w-full h-full flex items-center justify-center">
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Main card content */}
            <div
                className={clsx(
                    "relative bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl overflow-hidden border border-[var(--glass-border)] transition-all duration-300 ease-spring hover:bg-[var(--glass-hover)] shadow-2xl group",
                    isExpanded && "border-[var(--glass-hover)]"
                )}
                style={{ transform: `translateX(-${swipeX}px)`, transition: isSwiping.current ? 'none' : 'transform 0.3s ease' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
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
                        <h3 className="font-medium text-[var(--color-text)] tracking-wide">{subject.name}</h3>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90"
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
                                    if (e.key === 'Enter') { e.preventDefault(); commitOverride(); }
                                    if (e.key === 'Escape') {
                                        setIsEditingOverride(false);
                                        setOverrideInput(subject.finalOverride !== undefined ? String(subject.finalOverride) : '');
                                    }
                                }}
                                className="w-14 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-md px-2 py-1 text-center text-base sm:text-lg font-bold text-[var(--color-text)] outline-none focus:border-primary/60"
                                placeholder="–"
                            />
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsEditingOverride(true); }}
                                className={clsx(
                                    "text-base sm:text-lg font-bold tabular-nums px-2 py-1 rounded-md transition-colors",
                                    subject.finalOverride !== undefined
                                        ? "text-primary"
                                        : "text-[var(--color-text)]"
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
                                "w-12 h-12 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300 ease-spring active:scale-90 touch-manipulation",
                                isExpanded && "rotate-180 text-[var(--color-text)]"
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
                    <div className="grid grid-cols-2 border-t border-[var(--glass-border)] animate-expand">
                        {localQuarters.map((q, idx) => (
                            <div key={q.id || idx} className="p-3">
                                <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase mb-2 text-center tracking-widest">{q.name}</div>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-[var(--input-bg)] rounded-xl p-1.5 flex flex-col items-center">
                                        <span className="text-[9px] text-[var(--color-text-muted)] uppercase mb-1">Somi</span>
                                        <input
                                            type="number"
                                            min="0" max="15"
                                            value={q.somi === undefined ? '' : q.somi}
                                            onChange={(e) => handleLocalChange(idx, 'somi', e.target.value)}
                                            onBlur={commitChange}
                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                            className="w-full bg-transparent text-center font-medium text-[var(--color-text)] outline-none focus:text-primary transition-colors duration-200 text-sm py-1"
                                            placeholder="-"
                                        />
                                    </div>
                                    {subject.assessmentType === 'WRITTEN' && (
                                        <div className="flex-1 bg-[var(--input-bg)] rounded-xl p-1.5 flex flex-col items-center">
                                            <span className="text-[9px] text-[var(--color-text-muted)] uppercase mb-1">Klausur</span>
                                            <input
                                                type="number"
                                                min="0" max="15"
                                                value={q.written === undefined ? '' : q.written}
                                                onChange={(e) => handleLocalChange(idx, 'written', e.target.value)}
                                                onBlur={commitChange}
                                                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                className="w-full bg-transparent text-center font-medium text-[var(--color-text)] outline-none focus:text-primary transition-colors duration-200 text-sm py-1"
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
        </div>
    );
}
