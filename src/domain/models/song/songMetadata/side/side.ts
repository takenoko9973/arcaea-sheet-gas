import { ValueObject } from "domain/models/shared/valueObject";

export enum SideEnum {
    LIGHT = "光",
    CONFLICT = "対立",
    COLORLESS = "無",
    LEPHON = "リフォン",
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

    equals(other: Side): boolean {
        return this.value === other.value;
    }
}
