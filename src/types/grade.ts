export const Grade = {
    PMPlus: "PM+",
    PM: "PM",
    EXPlus: "EX+",
    EX: "EX",
    AA: "AA",
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    NotPlayed: "NP",
} as const;

export type Grade = (typeof Grade)[keyof typeof Grade];
