export class ScoreData {
    sumScore: number;
    lostScore: number;
    farNotes: number;
    luckShinyPureNotes: number;

    constructor(sumScore: number, lostScore: number, farNotes: number, luckShinyPureNotes: number) {
        this.sumScore = sumScore;
        this.lostScore = lostScore;
        this.farNotes = farNotes;
        this.luckShinyPureNotes = luckShinyPureNotes;
    }
}
