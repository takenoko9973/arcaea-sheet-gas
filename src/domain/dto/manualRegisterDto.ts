import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

export type ManualRegisterDto = {
    nameJp: string;
    songTitle: string;
    difficulty: DifficultyEnum;
    level: string;
    constant: number;
    urlName: string;
};
