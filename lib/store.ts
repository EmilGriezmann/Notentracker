import { Semester, Subject, Quarter, SubjectDefinition, StoredSemester } from '../types';

const STORAGE_KEY = 'notentracker_semesters';
const DEFINITIONS_KEY = 'notentracker_subject_definitions';

const DEFAULT_QUARTERS: Quarter[] = [
    { id: 'q1', name: 'Q1' },
    { id: 'q2', name: 'Q2' },
];

// ─── Definitions ─────────────────────────────────────────────────────────────

export const loadSubjectDefinitions = (): SubjectDefinition[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(DEFINITIONS_KEY);
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
};

const saveSubjectDefinitions = (defs: SubjectDefinition[]) => {
    localStorage.setItem(DEFINITIONS_KEY, JSON.stringify(defs));
};

// ─── Semester load / save ─────────────────────────────────────────────────────

export const loadSemesters = (): Semester[] => {
    if (typeof window === 'undefined') return [];

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    // Detect old format (subjects[] directly on semester)
    if ('subjects' in parsed[0]) {
        return migrateOldFormat(parsed);
    }

    // New format: merge definitions with entries
    const defs = loadSubjectDefinitions();
    return parsed.map((s: StoredSemester): Semester => ({
        id: s.id,
        name: s.name,
        subjects: s.entries
            .map(entry => {
                const def = defs.find(d => d.id === entry.subjectId);
                if (!def) return null;
                return {
                    id: def.id,
                    name: def.name,
                    type: def.type,
                    assessmentType: def.assessmentType,
                    color: def.color,
                    quarters: entry.quarters,
                    finalOverride: entry.finalOverride,
                } as Subject;
            })
            .filter(Boolean) as Subject[],
    }));
};

export const saveSemesters = (semesters: Semester[]) => {
    if (typeof window === 'undefined') return;

    // Extract and merge subject definitions (newest edit wins per id)
    const defMap = new Map<string, SubjectDefinition>(
        loadSubjectDefinitions().map(d => [d.id, d])
    );
    semesters.forEach(sem =>
        sem.subjects.forEach(sub => {
            defMap.set(sub.id, {
                id: sub.id,
                name: sub.name,
                type: sub.type,
                assessmentType: sub.assessmentType,
                color: sub.color,
            });
        })
    );
    saveSubjectDefinitions(Array.from(defMap.values()));

    // Save semesters in new storage format
    const stored: StoredSemester[] = semesters.map(sem => ({
        id: sem.id,
        name: sem.name,
        entries: sem.subjects.map(sub => ({
            subjectId: sub.id,
            quarters: sub.quarters,
            finalOverride: sub.finalOverride,
        })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
};

// Creates a new Semester, optionally copying the subject list (without grades) from another.
export const createSemester = (name: string, copyFrom?: Semester): Semester => ({
    id: crypto.randomUUID(),
    name,
    subjects: copyFrom
        ? copyFrom.subjects.map(sub => ({
              ...sub,
              quarters: DEFAULT_QUARTERS.map(q => ({ ...q })),
              finalOverride: undefined,
          }))
        : [],
});

// ─── Migration ────────────────────────────────────────────────────────────────

function migrateOldFormat(old: Semester[]): Semester[] {
    // Persist in new format immediately so next load uses new path
    saveSemesters(old);
    return old;
}

// ─── Calculation helpers ──────────────────────────────────────────────────────

export const calculateQuarterAverage = (semester: Semester, quarterIndex: number): number | null => {
    let totalWeighted = 0;
    let totalWeight = 0;

    semester.subjects.forEach(sub => {
        const q = sub.quarters[quarterIndex];
        if (!q) return;
        let total = 0;
        let count = 0;
        if (q.somi !== undefined && q.somi !== null) { total += q.somi; count++; }
        if (sub.assessmentType === 'WRITTEN' && q.written !== undefined && q.written !== null) {
            total += q.written; count++;
        }
        if (count > 0) {
            const w = sub.type === 'LK' ? 2 : 1;
            totalWeighted += (total / count) * w;
            totalWeight += w;
        }
    });

    return totalWeight === 0 ? null : totalWeighted / totalWeight;
};

export const calculateSubjectAverage = (subject: Subject): number | null => {
    if (typeof subject.finalOverride === 'number') return subject.finalOverride;

    let total = 0;
    let count = 0;

    subject.quarters.forEach(q => {
        if (q.somi !== undefined && q.somi !== null) { total += q.somi; count++; }
        if (subject.assessmentType === 'WRITTEN' && q.written !== undefined && q.written !== null) {
            total += q.written; count++;
        }
    });

    return count === 0 ? null : total / count;
};

export const calculateSemesterAverage = (semester: Semester): number | null => {
    let totalWeighted = 0;
    let totalWeight = 0;

    semester.subjects.forEach(sub => {
        const avg = calculateSubjectAverage(sub);
        if (avg !== null) {
            const zeugnisnote = Math.round(avg); // ganzzahlige Notenpunkte wie auf dem Zeugnis
            const w = sub.type === 'LK' ? 2 : 1;
            totalWeighted += zeugnisnote * w;
            totalWeight += w;
        }
    });

    return totalWeight === 0 ? null : totalWeighted / totalWeight;
};

export const calculateTotalAverage = (semesters: Semester[]): number | null => {
    let total = 0;
    let count = 0;

    semesters.forEach(sem => {
        const avg = calculateSemesterAverage(sem);
        if (avg !== null) { total += avg; count++; }
    });

    return count === 0 ? null : total / count;
};

export const pointsToGrade = (points: number): number => {
    return Math.round(((17 - points) / 3) * 100) / 100;
};

export const sortSubjects = (subjects: Subject[]): Subject[] => {
    return [...subjects].sort((a, b) => {
        if (a.type === 'LK' && b.type !== 'LK') return -1;
        if (a.type !== 'LK' && b.type === 'LK') return 1;
        if (a.type === 'GK' && b.type === 'GK') {
            if (a.assessmentType === 'WRITTEN' && b.assessmentType !== 'WRITTEN') return -1;
            if (a.assessmentType !== 'WRITTEN' && b.assessmentType === 'WRITTEN') return 1;
        }
        return a.name.localeCompare(b.name);
    });
};
