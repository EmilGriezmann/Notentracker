export type GradePoints = number; // 0-15

export type GradeType = 'SOMI' | 'WRITTEN';

export interface Quarter {
    id: string;
    name: string; // "Q1", "Q2" etc.
    somi?: GradePoints; // Optional because it might not be set yet
    written?: GradePoints; // Optional
}

export type SubjectType = 'GK' | 'LK';
export type SubjectAssessmentType = 'WRITTEN' | 'ORAL'; // Schriftlich (Somi+Klausur) oder Mündlich (nur Somi)

export interface Subject {
    id: string;
    name: string;
    type: SubjectType;
    assessmentType: SubjectAssessmentType;
    quarters: Quarter[];
    /**
     * Optional "Zeugnisnote"/Endnote override (0-15 points).
     * If set, averages should use this value instead of calculating from quarters.
     */
    finalOverride?: GradePoints;
    color?: string;
}

export interface Semester {
    id: string;
    name: string; // e.g. "Q1.1"
    subjects: Subject[];
}
