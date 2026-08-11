export class FrameScoreData {
    maxFrameScore: number;
    lostFrameScore: number;

    constructor(maxFrameScore: number, lostFrameScore: number) {
        this.maxFrameScore = maxFrameScore;
        this.lostFrameScore = lostFrameScore;
    }
}
