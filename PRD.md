# Product Requirements Document (PRD) - Notentracker

## 1. Einführung
Der "Notentracker" ist eine Web-Applikation, die es Schülern ermöglicht, ihre Schulnoten für verschiedene Halbjahre und Quartale zu erfassen und Durchschnitte zu berechnen. Das Ziel ist eine einfache, lokal ausführbare Anwendung ("auf dem PC ausprobieren"), die spezifische Anforderungen des deutschen Schulsystems (wie LKs und Quartalsnoten) berücksichtigt.

## 2. Technischer Stack
- **Frontend**: Next.js
- **Laufzeitumgebung**: Node.js (Lokal)
- **Persistenz**: Lokaler Speicher (z.B. LocalStorage oder JSON-Datei für den MVP)

## 3. Funktionale Anforderungen

### 3.1 Startseite & Navigation
- **Übersicht**: Anzeige einer Liste aller angelegten Halbjahre.
- **Gesamtschnitt**: Anzeige eines berechneten Gesamtdurchschnitts über alle Halbjahre hinweg.
- **Verwaltung**: Button zum Hinzufügen eines neuen Halbjahres mit der Möglichkeit, dieses individuell zu benennen.

### 3.2 Halbjahres-Ebene
- Jedes Halbjahr ist eine eigenständige Einheit mit eigenem Durchschnitt.
- Es muss klar zwischen verschiedenen Halbjahren (z.B. "Q1.1", "Q1.2") unterschieden werden.
- Innerhalb eines Halbjahres können Fächer hinzugefügt und bearbeitet werden.

### 3.3 Fächer & Konfiguration
- **Fächertypen**:
  - **Leistungskurs (LK)**: Wird in der Durchschnittsberechnung des Halbjahres doppelt gewichtet.
  - **Grundkurs (GK)** / Standard: Einfache Gewichtung.
- **Bewertungsart**:
  - **Schriftlich**: Fach beinhaltet "Somi"-Noten (Sonstige Mitarbeit) UND schriftliche Noten (Klausuren).
  - **Mündlich**: Fach beinhaltet NUR "Somi"-Noten.

### 3.4 Notenerfassung (Pro Fach)
- Die Erfassung erfolgt auf Quartalsbasis.
- **Pro Quartal** können eingetragen werden:
  - Eine Somi-Note.
  - Eine schriftliche Note (nur bei schriftlichen Fächern).

### 3.5 Berechnungslogik
1.  **Notensystem**:
    - **Eingabe & interne Berechnung**: Alle Noten werden in Notenpunkten (0-15 MSS-Punkte) erfasst und verarbeitet.
    - **Anzeige von Schnitten**: Alle errechneten Durchschnitte (Fach, Halbjahr, Gesamt) werden als Dezimalnote angezeigt.
2.  **Fach-Schnitt**:
    - Die Noten aus den Quartalen (Somi + ggf. Schriftlich) werden zu einer Endnote für das Fach verrechnet.
3.  **Halbjahres-Schnitt**:
    - Durchschnitt aller Fächer des Halbjahres.
    - **Gewichtung**: LK-Noten zählen doppelt so viel wie andere Fächer.
4.  **Gesamtschnitt (Startseite)**:
    - Durchschnitt aus den Schnitten aller angelegten Halbjahre.

## 4. Nicht-Funktionale Anforderungen
- **Einfachheit**: Intuitive Bedienung ohne komplexe Einrichtung.
- **Design**: Klare Strukturierung, aber Fokus auf Funktionalität für den ersten Prototypen.
- **Lokal**: Die App muss ohne externes Backend auf dem Entwickler-PC laufen.
