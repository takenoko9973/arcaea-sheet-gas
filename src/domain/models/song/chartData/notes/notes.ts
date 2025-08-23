import { ValueObject } from "@/domain/models/shared/valueObject";

type NotesValue = number;
export abstract class Notes<U> extends ValueObject<NotesValue, "Notes"> {
    // Notesの型で区別するために利用 (Structural Typingの影響を回避する)
    private _notes_type!: U;

    constructor(value: NotesValue) {
        super(value);
    }

    equals(other: ValueObject<NotesValue, "Notes">): boolean {
        return this.value === other.value;
    }
}
