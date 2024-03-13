import { Grade } from "../const";

export class GradeData {
    gradeCounts: { [key in Grade]: number } = {
        "PM+": 0,
        "PM": 0,
        "EX+": 0,
        "EX": 0,
        "AA": 0,
        "A": 0,
        "B": 0,
        "C": 0,
        "D": 0,
        "NP": 0,
    };

    constructor() {}

    plus(gradeData: GradeData) {
        const newGradeData = new GradeData();

        for (const grade of Object.values(Grade)) {
            newGradeData.gradeCounts[grade] =
                this.gradeCounts[grade] + gradeData.gradeCounts[grade];
        }
        return newGradeData;
    }
}
