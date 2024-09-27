export const Side = {
    LIGHT: "光",
    CONFLICT: "対立",
    COLORLESS: "無",
} as const;

export type Side = (typeof Side)[keyof typeof Side];
