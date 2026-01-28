'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { loadSemesters, saveSemesters, calculateTotalAverage, pointsToGrade } from '@/lib/store';
import { Semester } from '@/types';
import SemesterCard from '@/components/SemesterCard';
import { Plus } from 'lucide-react';

function GradeRing({ grade }: { grade: number }) {
    const [animatedGrade, setAnimatedGrade] = useState(6.0);
    const [animatedPct, setAnimatedPct] = useState(0);
    const frameRef = useRef<number>(0);

    const targetPct = Math.max(0, Math.min(100, ((6 - grade) / 5) * 100));

    const getColor = useCallback((g: number) => {
        if (g >= 4.0) return '#ff453a';
        const t = Math.max(0, Math.min(1, (4.0 - g) / 3.0));
        const hue = Math.round(t * 142);
        return `hsl(${hue}, 75%, 55%)`;
    }, []);

    useEffect(() => {
        const duration = 1200;
        const startTime = performance.now();
        const startGrade = 6.0;
        const startPct = 0;

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);

            setAnimatedGrade(startGrade + (grade - startGrade) * eased);
            setAnimatedPct(startPct + (targetPct - startPct) * eased);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [grade, targetPct]);

    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (animatedPct / 100) * circumference;
    const ringColor = getColor(animatedGrade);

    return (
        <div className="relative w-[88px] h-[88px] flex items-center justify-center">
            <svg width="88" height="88" viewBox="0 0 88 88" className="absolute inset-0 -rotate-90">
                <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                    cx="44" cy="44" r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                />
            </svg>
            <span className="relative text-xl font-bold text-white leading-none">
                {animatedGrade.toFixed(1)}
            </span>
        </div>
    );
}

export default function Home() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState('');

    useEffect(() => {
        setSemesters(loadSemesters());
        setIsLoaded(true);
    }, []);

    const handleAddSemester = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSemesterName.trim()) return;

        const newSem: Semester = {
            id: crypto.randomUUID(),
            name: newSemesterName.trim(),
            subjects: []
        };

        const updated = [...semesters, newSem];
        setSemesters(updated);
        saveSemesters(updated);
        setNewSemesterName('');
        setIsAdding(false);
    };

    const totalAvgPoints = isLoaded ? calculateTotalAverage(semesters) : null;
    const totalAvgGrade = totalAvgPoints !== null ? pointsToGrade(totalAvgPoints) : null;

    if (!isLoaded) return <div className="flex h-screen items-center justify-center text-text-muted">Lade Daten...</div>;

    return (
        <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto selection:bg-primary/30">

            {/* Header */}
            <header className="mb-12 animate-fade-in">
                <div className="flex items-center gap-5">
                    <h1 className="text-5xl font-bold tracking-tight text-white">Noten</h1>

                    {totalAvgGrade !== null && totalAvgPoints !== null && (
                        <GradeRing grade={totalAvgGrade} />
                    )}
                </div>
            </header>

            {/* Content */}
            <section className="animate-slide-up">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-white tracking-tight">Meine Semester</h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.12] transition-all duration-200 active:scale-90"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Input Form Overlay */}
                {isAdding && (
                    <div className="mb-8 p-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-[24px] animate-scale-in">
                        <form onSubmit={handleAddSemester} className="bg-surface rounded-[22px] p-6 flex flex-col md:flex-row gap-4 items-center">
                            <input
                                type="text"
                                value={newSemesterName}
                                onChange={(e) => setNewSemesterName(e.target.value)}
                                placeholder="Semester Name (z.B. Q2)"
                                className="flex-1 bg-transparent text-xl font-bold text-white placeholder-white/20 outline-none border-b-2 border-transparent focus:border-primary/50 px-2 py-1 transition-colors w-full"
                                autoFocus
                            />
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    type="submit"
                                    className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95"
                                >
                                    Erstellen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95"
                                >
                                    Abbrechen
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semesters.map(sem => (
                        <SemesterCard key={sem.id} semester={sem} />
                    ))}

                    {/* Empty State / Add Card */}
                    {semesters.length === 0 && !isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl text-text-muted hover:text-white hover:border-white/20 hover:bg-white/5 transition-all group"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={32} className="text-primary" />
                            </div>
                            <p className="font-semibold text-lg">Starte dein erstes Semester</p>
                            <p className="text-sm opacity-50">Tippe hier zum Erstellen</p>
                        </button>
                    )}
                </div>
            </section>
        </main>
    );
}
