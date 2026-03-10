import { IDailyDataRepository } from "@/domain/repositories/dailyStatisticsRepositoryImpl";
import { ISongCollectionRepository } from "@/domain/repositories/songCollectionRepositoryImpl";
import { ISongRepository } from "@/domain/repositories/songRepositoryImpl";
import { ConfigSheet } from "@/infrastructure/repositories/configSheet";
import { DailyStatisticsRepository } from "@/infrastructure/repositories/dailyStatisticsRepository";
import { SongCollectionRepository } from "@/infrastructure/repositories/songCollectionRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

export const repositories = {
    // app層からの参照点を一箇所に集約する
    song(): ISongRepository {
        return SongRepository.instance;
    },
    // 収集データの参照も集約して依存を一本化する
    songCollection(): ISongCollectionRepository {
        return SongCollectionRepository.instance;
    },
    // 日次統計の永続化先をここで固定する
    dailyStatistics(): IDailyDataRepository {
        return DailyStatisticsRepository.instance;
    },
    // Configシートへの参照をapp層から直接持たないようにする
    configSheet(): ConfigSheet {
        return ConfigSheet.instance;
    },
};
