# Implementation Plan - Notentracker

# Goal Description
Implement the "Notentracker" application as a Next.js web app. The app will allow users to track school grades across semesters and quarters, differentiating between "Somi" (oral) and written grades, calculating averages with specific weightings (LK vs GK), and persisting data locally.

## User Review Required
> [!IMPORTANT]
> **Missing Node.js Environment**: The system seemingly lacks `node`, `npm`, or `npx` in the PATH. I cannot automatically scaffold the Next.js application or run it. I will proceed by generating the necessary source files, but you will need to install Node.js and run `npm install` and `npm run dev` manually, or ensure these tools are available to me.

## Proposed Changes

### Configuration & Setup
#### [NEW] [package.json](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/package.json)
- Define dependencies: `next`, `react`, `react-dom`, `lucide-react` (for icons), `clsx`/`tailwind-merge` (for styling if using Tailwind).
- Note: Since I cannot run `create-next-app`, I will create a minimal working setup or rely on you to scaffold it. **Ideally, you scaffold it and I write the logic.**

### Data & Logic Layer
#### [NEW] [types.ts](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/types.ts)
- Definitions for `Semester`, `Subject`, `Quarter`, `Grade`.

#### [NEW] [store.ts](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/utils/store.ts)
- LocalStorage wrapper to save/load the entire state.
- Helper functions for grade calculations (0-15 points to decimal etc.).

### Components

#### [NEW] [components/Layout.tsx](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/components/Layout.tsx)
- Main application shell.

#### [NEW] [components/SemesterCard.tsx](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/components/SemesterCard.tsx)
- Displays semester summary and average on the dashboard.

#### [NEW] [components/SubjectList.tsx](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/components/SubjectList.tsx)
- Lists subjects within a semester.

#### [NEW] [components/GradeInput.tsx](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/components/GradeInput.tsx)
- Input field for 0-15 points.

### Pages / Routes (App Router)

#### [NEW] [app/page.tsx](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/app/page.tsx)
- Dashboard: List of semesters, Add Semester button, Total Average.

#### [NEW] [app/semester/[id]/page.tsx](file:///c:/Users/Emil Kirchhoff/OneDrive/Desktop/Coding/Notentracker/app/semester/[id]/page.tsx)
- Detail view for a semester: List of subjects, Add Subject, Subject details/grades.

## Verification Plan

### Automated Tests
- I cannot run automated tests without Node.js.

### Manual Verification
- User checks if `package.json` and file structure is created.
- User installs Node.js/dependencies.
- User runs `npm run dev`.
- User verifies:
    - Creating a semester "Q1.1".
    - Adding an LK Subject (Math) and a GK Subject (History).
    - Entering grades (0-15) for Q1 and Q2.
    - Checking if averages are correct (Decimals) and LK is weighted double.
