import { ValueObject } from "../../../shared/valueObject";

type NotesValue = number;
export class Notes extends ValueObject<NotesValue, "SongTitle"> {
    static readonly MIN = 1;
    static readonly MAX = 2236; // PMを取らずに10,000,000を超えない最大ノーツ数

    constructor(value: NotesValue) {
        super(value);
    }

    protected validate(value: NotesValue): void {
        if (value < Notes.MIN || value > Notes.MAX) {
            throw new Error(`ノーツ数は${Notes.MIN}から${Notes.MAX}の間でなければなりません。`);
        }
    }

    equals(others: Notes): boolean {
        return this.value === others.value;
    }
}
