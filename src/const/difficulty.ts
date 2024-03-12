export const Difficulty = {
    Past: "PST",
    Present: "PRS",
    Future: "FTR",
    Beyond: "BYD",
    Eternal: "ETR",
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];
