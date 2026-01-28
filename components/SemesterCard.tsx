'use client';

import Link from 'next/link';
import { pointsToGrade, calculateSemesterAverage } from '@/lib/store';
import { Semester } from '@/types';

interface Props {
    semester: Semester;
}

export default function SemesterCard({ semester }: Props) {
    const avgPoints = calculateSemesterAverage(semester);
    const avgGrade = avgPoints !== null ? pointsToGrade(avgPoints) : null;

    return (
        <Link href={`/semester/${semester.id}`}>
            <div className="relative group overflow-hidden rounded-[22px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] transition-all duration-300 ease-spring hover:scale-[1.02] active:scale-[0.98] hover:bg-white/[0.09] cursor-pointer shadow-lg shadow-black/50">

                {/* Apple Wallet-style Header gradient hint */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1">Halbjahr</span>
                            <h3 className="text-2xl font-bold text-white tracking-tight">{semester.name}</h3>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex justify-end items-end border-t border-white/5 pt-4">
                        {avgGrade !== null ? (
                            <span className="text-3xl font-bold text-white leading-none tracking-tight">
                                {avgGrade.toFixed(2)}
                            </span>
                        ) : (
                            <span className="text-white/30 italic text-sm">--</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
