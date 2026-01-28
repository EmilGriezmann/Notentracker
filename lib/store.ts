import { Semester, Subject, Quarter, GradePoints } from '../types';

const STORAGE_KEY = 'notentracker_data';

export const loadSemesters = (): Semester[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveSemesters = (semesters: Semester[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
};

export const calculateSubjectAverage = (subject: Subject): number | null => {
    // If a final "Zeugnisnote" override exists, it always wins.
    if (typeof subject.finalOverride === 'number') {
        return subject.finalOverride;
    }

    let totalPoints = 0;
    let count = 0;

    subject.quarters.forEach(q => {
        // Add Somi
        if (q.somi !== undefined && q.somi !== null) {
            totalPoints += q.somi;
            count++;
        }
        // Add Written only if subject is WRITTEN
        if (subject.assessmentType === 'WRITTEN' && q.written !== undefined && q.written !== null) {
            totalPoints += q.written;
            count++;
        }
    });

    if (count === 0) return null;
    return totalPoints / count;
};

export const calculateSemesterAverage = (semester: Semester): number | null => {
    let totalWeightedPoints = 0;
    let totalWeight = 0;

    semester.subjects.forEach(sub => {
        const avg = calculateSubjectAverage(sub);
        if (avg !== null) {
            const weight = sub.type === 'LK' ? 2 : 1;
            totalWeightedPoints += avg * weight;
            totalWeight += weight;
        }
    });

    if (totalWeight === 0) return null;
    return totalWeightedPoints / totalWeight;
};

export const calculateTotalAverage = (semesters: Semester[]): number | null => {
    let total = 0;
    let count = 0;

    semesters.forEach(sem => {
        const avg = calculateSemesterAverage(sem);
        if (avg !== null) {
            total += avg;
            count++;
        }
    });

    if (count === 0) return null;
    return total / count;
};

export const pointsToGrade = (points: number): number => {
    // Approx formula: 17 - points / 3.
    const grade = (17 - points) / 3;
    return Math.round(grade * 100) / 100; // 2 decimal places
};

// Helper to sort subjects: LK -> GK Written -> GK Oral
export const sortSubjects = (subjects: Subject[]): Subject[] => {
    return [...subjects].sort((a, b) => {
        // 1. LK vs GK
        if (a.type === 'LK' && b.type !== 'LK') return -1;
        if (a.type !== 'LK' && b.type === 'LK') return 1;

        // 2. If both GK, check assessment: Written vs Oral
        if (a.type === 'GK' && b.type === 'GK') {
            if (a.assessmentType === 'WRITTEN' && b.assessmentType !== 'WRITTEN') return -1;
            if (a.assessmentType !== 'WRITTEN' && b.assessmentType === 'WRITTEN') return 1;
        }

        // 3. Fallback: Alphabetical
        return a.name.localeCompare(b.name);
    });
};
