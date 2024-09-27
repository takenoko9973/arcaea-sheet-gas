export const Side = {
    "UNKNOWN": "?",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "7_PLUS": "7+",
    "8": "8",
    "8_PLUS": "8+",
    "9": "9",
    "9_PLUS": "9+",
    "10": "10",
    "10_PLUS": "10+",
    "11": "11",
    "11_PLUS": "11+",
    "12": "12",
} as const;

export type Side = (typeof Side)[keyof typeof Side];
