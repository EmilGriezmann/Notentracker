'use client';

import { useEffect, useState } from 'react';
import { loadSemesters, saveSemesters, calculateTotalAverage, pointsToGrade } from '@/lib/store';
import { Semester } from '@/types';
import SemesterCard from '@/components/SemesterCard';
import { Plus } from 'lucide-react';

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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-bold tracking-tight text-white mb-2">Noten</h1>
                        <p className="text-lg text-text-muted font-medium">Alle Semester im Überblick</p>
                    </div>

                    {totalAvgGrade !== null && (
                        <div className="bg-surface/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-surface transition-colors">
                            <div className="text-right">
                                <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-0.5">Gesamt</div>
                                <div className="text-3xl font-bold text-white leading-none">{totalAvgGrade.toFixed(2)}</div>
                            </div>
                            <div className="h-10 w-px bg-white/10 mx-2"></div>
                            <div className="text-xs font-mono text-text-muted">{totalAvgPoints?.toFixed(2)} Pkt</div>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <section className="animate-slide-up">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-white tracking-tight">Meine Semester</h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-300"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        <span className="text-sm">Hinzufügen</span>
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
