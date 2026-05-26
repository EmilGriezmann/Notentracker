export type GradePoints = number; // 0-15

export type GradeType = 'SOMI' | 'WRITTEN';

export interface Quarter {
    id: string;
    name: string;
    somi?: GradePoints;
    written?: GradePoints;
}

export type SubjectType = 'GK' | 'LK';
export type SubjectAssessmentType = 'WRITTEN' | 'ORAL';

// Global subject master data – shared across all semesters
export interface SubjectDefinition {
    id: string;
    name: string;
    type: SubjectType;
    assessmentType: SubjectAssessmentType;
    color?: string;
}

// Per-semester grade data (raw storage)
export interface SemesterEntry {
    subjectId: string;
    quarters: Quarter[];
    finalOverride?: GradePoints;
}

// Stored semester (raw storage format)
export interface StoredSemester {
    id: string;
    name: string;
    entries: SemesterEntry[];
}

// View model – merged definition + grades (what components use)
export interface Subject {
    id: string;
    name: string;
    type: SubjectType;
    assessmentType: SubjectAssessmentType;
    color?: string;
    quarters: Quarter[];
    finalOverride?: GradePoints;
}

// View model semester (what components use)
export interface Semester {
    id: string;
    name: string;
    subjects: Subject[];
}
