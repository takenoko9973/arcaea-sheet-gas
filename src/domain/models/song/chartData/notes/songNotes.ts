import { Notes } from "./notes";

type NotesValue = number;
export class SongNotes extends Notes<"SongNotes"> {
    static readonly MIN = 1;
    static readonly MAX = 2236; // PMを取らずに10,000,000を超えない最大ノーツ数

    protected validate(value: NotesValue): void {
        if (value < SongNotes.MIN || value > SongNotes.MAX) {
            throw new Error(
                `ノーツ数は${SongNotes.MIN}から${SongNotes.MAX}の間でなければなりません (${value})`
            );
        }
    }
}
