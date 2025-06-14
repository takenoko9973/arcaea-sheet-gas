import { Notes } from "./notes";

type NotesValue = number;
export class PureNotes extends Notes<"PureNotes"> {
    static readonly MIN = 0;
    static readonly MAX = 2236; // PMを取らずに10,000,000を超えない最大ノーツ数

    protected validate(value: NotesValue): void {
        if (value < PureNotes.MIN || value > PureNotes.MAX) {
            throw new Error(
                `ノーツ数は${PureNotes.MIN}から${PureNotes.MAX}の間でなければなりません (${value})`
            );
        }
    }
}
