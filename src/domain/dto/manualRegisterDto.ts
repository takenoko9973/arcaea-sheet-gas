import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

export type ManualRegisterDto = {
    songTitle: string;
    nameJp: string;
    nameEn: string;
    difficulty: DifficultyEnum;
    level: string;
    constant: string;
    urlName: string;
};
