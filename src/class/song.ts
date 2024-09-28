import { Grade } from "../types";

export class Song {
    composer: string;
    constant: number;
    difficulty: string;
    level: string;
    nameEn: string;
    nameJp: string;
    notes: number;
    pack: string;
    score: number;
    side: string;
    songTitle: string;
    version: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(record: any[]) {
        [
            this.songTitle,
            this.nameJp,
            this.nameEn,
            this.composer,
            this.pack,
            this.version,
            this.side,
            this.difficulty,
            this.level,
            this.constant,
            this.notes,
            this.score,
        ] = record;

        this.version = this.version.match(/(\d+\.\d+)/)?.at(1) ?? ""; // アポストロフィが付くので排除
    }

    getSongDataList() {
        return [
            this.songTitle,
            this.nameJp,
            this.nameEn,
            this.composer,
            this.pack,
            "'" + this.version,
            this.side,
            this.difficulty,
            this.level,
            this.constant,
            this.notes,
            this.score,
        ];
    }

    /**
     * 不足しているデータがあるかどうか
     */
    isLuckData() {
        const existBlank = this.getSongDataList().includes("");
        const existNegative = this.getSongDataList().includes(-1);
        return existBlank || existNegative;
    }

    isDeleted() {
        return this.pack === "Deleted";
    }

    getMaximumScore() {
        return 10000000 + this.notes;
    }

    getGrade(): Grade {
        if (this.score === this.getMaximumScore()) {
            return Grade.PMPlus;
        } else if (this.score >= 10000000) {
            return Grade.PM;
        } else if (this.score >= 9900000) {
            return Grade.EXPlus;
        } else if (this.score >= 9800000) {
            return Grade.EX;
        } else if (this.score >= 9500000) {
            return Grade.AA;
        } else if (this.score >= 9200000) {
            return Grade.A;
        } else if (this.score >= 8900000) {
            return Grade.B;
        } else if (this.score >= 8600000) {
            return Grade.C;
        } else if (this.score > 0) {
            return Grade.D;
        } else {
            return Grade.NotPlayed;
        }
    }

    getSongPotential() {
        if (this.score >= 10000000) {
            return this.constant + 2.0;
        } else if (this.score >= 9800000) {
            return this.constant + 1.0 + (this.score - 9800000) / 200000;
        } else {
            const potential = this.constant + (this.score - 9500000) / 300000;
            return potential >= 0 ? potential : 0; // 0を下回らない
        }
    }

    /**
     * Pure数を計算 (Farは0.5として計算)
     */
    getPureNotes(): number {
        return Math.floor((this.score * this.notes * 2) / 10000000) / 2;
    }

    /**
     * 内部数計算
     */
    getHitShinyPureNotes(): number {
        return this.score - Math.floor(10000000 * (this.getPureNotes() / this.notes));
    }
}
