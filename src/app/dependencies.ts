import { IDailyDataRepository } from "@/domain/repositories/dailyStatisticsRepositoryImpl";
import { ISongCollectionRepository } from "@/domain/repositories/songCollectionRepositoryImpl";
import { ISongRepository } from "@/domain/repositories/songRepositoryImpl";
import { ConfigSheet } from "@/infrastructure/repositories/configSheet";
import { DailyStatisticsRepository } from "@/infrastructure/repositories/dailyStatisticsRepository";
import { SongCollectionRepository } from "@/infrastructure/repositories/songCollectionRepository";
import { SongRepository } from "@/infrastructure/repositories/songRepository";

export function getSongRepository(): ISongRepository {
    // app層からの参照点を一箇所に集約する
    return SongRepository.instance;
}

export function getSongCollectionRepository(): ISongCollectionRepository {
    // 収集データの参照も集約して依存を一本化する
    return SongCollectionRepository.instance;
}

export function getDailyStatisticsRepository(): IDailyDataRepository {
    // 日次統計の永続化先をここで固定する
    return DailyStatisticsRepository.instance;
}

export function getConfigSheet(): ConfigSheet {
    // Configシートへの参照をapp層から直接持たないようにする
    return ConfigSheet.instance;
}
