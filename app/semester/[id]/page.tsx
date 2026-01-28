'use client';

import { useEffect, useState } from 'react';
import { loadSemesters, saveSemesters, calculateSemesterAverage, pointsToGrade, sortSubjects } from '@/lib/store';
import { Semester, Subject } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, X, Check } from 'lucide-react';
import SubjectCard from '@/components/SubjectCard';
import SemesterRadar from '@/components/SemesterRadar';
import clsx from 'clsx';

// Apple-inspired colors (12 options)
const COLORS = [
    '#0a84ff', // Blue
    '#bf5af2', // Purple
    '#ff9f0a', // Orange
    '#ff453a', // Red
    '#30d158', // Green
    '#64d2ff', // Cyan
    '#5e5ce6', // Indigo
    '#ff375f', // Pink
    '#ffd60a', // Yellow
    '#ac8e68', // Brown
    '#8e8e93', // Gray
    '#ffffff'  // White
];

export default function SemesterPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [semester, setSemester] = useState<Semester | null>(null);
    const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editSubjectId, setEditSubjectId] = useState<string | null>(null);

    // Form State
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<'GK' | 'LK'>('GK');
    const [formAssess, setFormAssess] = useState<'WRITTEN' | 'ORAL'>('WRITTEN');
    const [formColor, setFormColor] = useState(COLORS[0]);

    useEffect(() => {
        const list = loadSemesters();
        setSemesters(list);
        const found = list.find(s => s.id === id);
        if (!found) return;
        // Ensure sorted on load
        found.subjects = sortSubjects(found.subjects);
        setSemester(found);
        // Default: collapsed for overview on tablet/phone
        setExpandedSubjectId(null);
    }, [id]);

    const saveCurrentSemester = (updatedSem: Semester) => {
        const newSemesters = semesters.map(s => s.id === updatedSem.id ? updatedSem : s);
        setSemesters(newSemesters);
        setSemester(updatedSem);
        saveSemesters(newSemesters);
    };

    const openAddModal = () => {
        setEditSubjectId(null);
        setFormName('');
        setFormType('GK');
        setFormAssess('WRITTEN');
        setFormColor(COLORS[0]);
        setIsModalOpen(true);
    };

    const openEditModal = (subject: Subject) => {
        setEditSubjectId(subject.id);
        setFormName(subject.name);
        setFormType(subject.type);
        setFormAssess(subject.assessmentType);
        setFormColor(subject.color || COLORS[0]);
        setIsModalOpen(true);
    };

    const handleSaveSubject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim() || !semester) return;

        if (editSubjectId) {
            // Edit Mode - Editing properties should trigger a sort
            let updatedSubjects = semester.subjects.map(s => s.id === editSubjectId ? {
                ...s,
                name: formName.trim(),
                type: formType,
                assessmentType: formAssess,
                color: formColor
            } : s);

            updatedSubjects = sortSubjects(updatedSubjects);

            const updatedSem = { ...semester, subjects: updatedSubjects };
            saveCurrentSemester(updatedSem);
        } else {
            // Create Mode - Add to TOP, do NOT sort yet (resort existing list, prepend new)
            const newSubject: Subject = {
                id: crypto.randomUUID(),
                name: formName.trim(),
                type: formType,
                assessmentType: formAssess,
                quarters: [{ id: 'q1', name: 'Q1' }, { id: 'q2', name: 'Q2' }],
                color: formColor
            };

            const sortedExisting = sortSubjects(semester.subjects);
            const updatedSem = { ...semester, subjects: [newSubject, ...sortedExisting] };
            saveCurrentSemester(updatedSem);
        }

        setIsModalOpen(false);
    };

    const updateSubjectGrades = (updatedSub: Subject) => {
        if (!semester) return;

        // Update the list with the new data
        let updatedSubjects = semester.subjects.map(s => s.id === updatedSub.id ? updatedSub : s);

        // RULE: Only sort if the subject we just edited was NOT the top one.
        // This keeps the "newly added" subject (which sits at top) pinned there while we edit it.
        // It will only be sorted when we interact with OTHER subjects (or reload/add new).
        const isTopSubject = semester.subjects.length > 0 && semester.subjects[0].id === updatedSub.id;

        if (!isTopSubject) {
            updatedSubjects = sortSubjects(updatedSubjects);
        }

        const updatedSem = {
            ...semester,
            subjects: updatedSubjects
        };
        saveCurrentSemester(updatedSem);
    };

    const deleteSubject = (subId: string) => {
        if (!semester) return;
        if (!confirm('Fach wirklich löschen?')) return;
        const updatedSem = {
            ...semester,
            subjects: semester.subjects.filter(s => s.id !== subId)
        };
        saveCurrentSemester(updatedSem);
    };

    const handleDeleteSemester = () => {
        if (!confirm('Ganzes Semester löschen?')) return;
        const newSemesters = semesters.filter(s => s.id !== id);
        saveSemesters(newSemesters);
        router.push('/');
    };

    if (!semester) return <div className="flex h-screen items-center justify-center">Lade...</div>;

    const avgPoints = calculateSemesterAverage(semester);
    const avgGrade = avgPoints !== null ? pointsToGrade(avgPoints) : null;

    return (
        <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto selection:bg-primary/30">

            {/* Navigation */}
            <nav className="mb-8 flex justify-between items-center">
                <Link href="/" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium text-sm">
                    <ChevronLeft size={20} />
                    Semesterübersicht
                </Link>
                <button
                    onClick={handleDeleteSemester}
                    className="text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                    Semester Löschen
                </button>
            </nav>

            {/* Hero Header */}
            <header className="mb-12 animate-slide-up">

                {/* Row 1: Title */}
                <div className="mb-8">
                    <span className="text-secondary font-bold uppercase tracking-widest text-xs mb-2 block">Semester</span>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight">{semester.name}</h1>
                    <p className="text-text-muted mt-2 font-medium">{semester.subjects.length} Fächer eingetragen</p>
                </div>

                {/* Row 2: Stats & Chart */}
                <div className="grid md:grid-cols-2 gap-6 items-stretch">

                    {/* Average Card */}
                    {avgPoints !== null && (
                        <div className="bg-gradient-to-br from-surface to-surface-highlight p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-center items-center text-center min-h-[165px]">
                            <div className="text-sm text-text-muted font-bold uppercase tracking-wider mb-3">Durchschnitt</div>
                            <div className="text-7xl font-black text-white leading-none tracking-tighter mb-4 scale-110">
                                {avgGrade ? avgGrade.toFixed(2) : '-'}
                            </div>
                            <div className="text-xl font-mono text-primary font-bold bg-primary/10 px-4 py-1 rounded-full">{avgPoints.toFixed(2)}</div>
                        </div>
                    )}

                    {/* Radar Chart */}
                    {(semester.subjects.length > 0) && (
                        <div className="bg-gradient-to-br from-surface to-surface-highlight rounded-3xl border border-white/5 shadow-2xl min-h-[225px] flex items-center justify-center">
                            <SemesterRadar subjects={semester.subjects} />
                        </div>
                    )}
                </div>
            </header>

            {/* Subjects List */}
            <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up"
                style={{ animationDelay: '0.1s' }}
            >
                {semester.subjects.map(sub => (
                    <div key={sub.id} className="animate-slide-up">
                        <SubjectCard
                            subject={sub}
                            onChange={updateSubjectGrades}
                            onDelete={() => deleteSubject(sub.id)}
                            onEdit={() => openEditModal(sub)}
                            isExpanded={expandedSubjectId === sub.id}
                            onToggleExpand={() =>
                                setExpandedSubjectId(prev => (prev === sub.id ? null : sub.id))
                            }
                        />
                    </div>
                ))}
                {semester.subjects.length === 0 && (
                    <div className="text-center py-12 px-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                        <p className="text-text-muted">Noch keine Fächer eingetragen.</p>
                    </div>
                )}
            </div>

            {/* Add Button */}
            <button
                onClick={openAddModal}
                className="w-full mt-8 mb-8 bg-surface/50 border border-dashed border-white/10 hover:border-primary/50 text-text-muted hover:text-white py-4 rounded-xl transition-all flex justify-center items-center gap-2 font-semibold group animate-fade-in"
            >
                <div className="bg-white/10 p-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus size={18} />
                </div>
                Fach hinzufügen
            </button>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface border border-white/10 p-6 rounded-3xl shadow-2xl w-full max-w-md animate-scale-in relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">
                            {editSubjectId ? 'Fach bearbeiten' : 'Neues Fach'}
                        </h3>
                        <form onSubmit={handleSaveSubject} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Fachname</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="z.B. Englisch"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Kursart</label>
                                    <div className="flex bg-black/30 p-1 rounded-xl">
                                        <button type="button" onClick={() => setFormType('GK')} className={clsx("flex-1 py-2 rounded-lg text-xs font-bold transition-all", formType === 'GK' ? 'bg-surface-highlight text-white shadow-lg' : 'text-text-muted hover:text-white')}>GK</button>
                                        <button type="button" onClick={() => setFormType('LK')} className={clsx("flex-1 py-2 rounded-lg text-xs font-bold transition-all", formType === 'LK' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white')}>LK</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Bewertung</label>
                                    <div className="flex bg-black/30 p-1 rounded-xl">
                                        <button type="button" onClick={() => setFormAssess('WRITTEN')} className={clsx("flex-1 py-2 rounded-lg text-xs font-bold transition-all", formAssess === 'WRITTEN' ? 'bg-surface-highlight text-white shadow-lg' : 'text-text-muted hover:text-white')}>Schriftlich</button>
                                        <button type="button" onClick={() => setFormAssess('ORAL')} className={clsx("flex-1 py-2 rounded-lg text-xs font-bold transition-all", formAssess === 'ORAL' ? 'bg-surface-highlight text-white shadow-lg' : 'text-text-muted hover:text-white')}>Mündlich</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Farbe</label>
                                <div className="grid grid-cols-6 gap-3">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setFormColor(c)}
                                            className={clsx("w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all mx-auto", formColor === c ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100")}
                                            style={{ backgroundColor: c }}
                                        >
                                            {formColor === c && <Check size={14} className={c === '#ffffff' ? 'text-black' : 'text-white'} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-white text-black hover:bg-white/90 py-3 rounded-xl font-bold transition-all transform active:scale-[0.98]">
                                Speichern
                            </button>

                            {editSubjectId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        deleteSubject(editSubjectId);
                                        setIsModalOpen(false);
                                    }}
                                    className="w-full bg-danger/10 text-danger hover:bg-danger/20 py-3 rounded-xl font-bold transition-all transform active:scale-[0.98]"
                                >
                                    Fach löschen
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
