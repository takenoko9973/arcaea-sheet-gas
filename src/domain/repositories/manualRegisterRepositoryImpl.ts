import { ManualRegisterDto } from "@/domain/dto/manualRegisterDto";

export interface IManualRegisterRepository {
    /**
     * 手動登録のエントリを1件取得する
     */
    getEntry(): ManualRegisterDto | null;
}
