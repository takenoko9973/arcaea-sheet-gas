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
}
