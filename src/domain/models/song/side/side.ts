import { ValueObject } from "../../shared/valueObject";

export enum SideEnum {
    LIGHT = "光",
    CONFLICT = "対立",
    COLORLESS = "無",
}

type SideValue = SideEnum;
export class Side extends ValueObject<SideValue, "Pack"> {
    constructor(value: SideValue) {
        super(value);
    }

    protected validate(value: SideValue): void {
        if (!Object.values(SideEnum).includes(value)) {
            throw new Error("無効な属性です。");
        }
    }

    equals(others: Side): boolean {
        return this.value === others.value;
    }
}
