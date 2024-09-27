export const Difficulty = {
    PAST: "PST",
    PRESENT: "PRS",
    FUTURE: "FTR",
    BEYOND: "BYD",
    ETERNAL: "ETR",
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
