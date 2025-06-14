import { Notes } from "./notes";

type NotesValue = number;
export class ShinyPureNotes extends Notes<"PureNotes"> {
    static readonly MIN = 0;
    static readonly MAX = 2236; // PMを取らずに10,000,000を超えない最大ノーツ数

    protected validate(value: NotesValue): void {
        if (value < ShinyPureNotes.MIN || value > ShinyPureNotes.MAX) {
            throw new Error(
                `ノーツ数は${ShinyPureNotes.MIN}から${ShinyPureNotes.MAX}の間でなければなりません (${value})`
            );
        }
    }
}
