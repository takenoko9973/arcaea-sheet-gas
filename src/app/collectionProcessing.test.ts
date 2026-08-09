import { PersistenceFatalError } from "@/domain/errors/persistenceFatalError";
import { DifficultyEnum } from "@/domain/models/song/difficulty/difficultyName/difficultyName";

import {
    processCollectionDtos,
} from "./collectionProcessing";

describe("processCollectionDtos", () => {
    it("スキップ、成功、失敗を重複なく集計し、失敗の文脈を残す", () => {
        const cause = new Error("Wiki unavailable");
        const result = processCollectionDtos({
            dtos: [
                { songTitle: "skip-song", nameJp: "" },
                { songTitle: "changed-song", nameJp: "変更曲" },
                { songTitle: "failed-song", nameJp: "失敗曲" },
                { songTitle: "unchanged-song", nameJp: "未変更曲" },
            ],
            difficulty: DifficultyEnum.FUTURE,
            operation: "register",
            shouldSkip: dto => dto.songTitle === "skip-song",
            process: dto => {
                if (dto.songTitle === "failed-song") throw cause;
                return dto.songTitle === "changed-song";
            },
        });

        expect(result).toMatchObject({ processed: 2, changed: 1, skipped: 1 });
        expect(result.failures).toEqual([
            {
                difficulty: DifficultyEnum.FUTURE,
                operation: "register",
                song: "failed-song",
                name: "失敗曲",
                cause,
            },
        ]);
    });

    it("永続化のfatalはアイテム失敗に変換せず再送出する", () => {
        const fatal = new PersistenceFatalError("SongScore flush", new Error("write failure"));

        expect(() =>
            processCollectionDtos({
                dtos: [{ songTitle: "fatal-song", nameJp: "致命曲" }],
                difficulty: DifficultyEnum.FUTURE,
                operation: "register",
                shouldSkip: () => false,
                process: () => {
                    throw fatal;
                },
            })
        ).toThrow(fatal);
    });
});
