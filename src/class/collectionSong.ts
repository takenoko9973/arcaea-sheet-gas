import { extractionJaName, extractionUrlName } from '../util';
import { Song } from './song';

/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export class CollectionSong {
  composer: string;
  constant: string;
  difficulty: string;
  level: string;
  nameEn: string;
  nameJp: string;
  notes: string;
  pack: string;
  side: string;
  songTitle: string;
  urlName: string;
  version: string;

  constructor(difficulty: string, data: any[]) {
    let constantOld, constantNow;

    this.difficulty = difficulty;
    [
      this.songTitle,
      this.nameJp,
      this.nameEn,
      this.composer,
      this.side,
      this.level,
      constantOld,
      constantNow,
      this.notes,
    ] = data;
    this.constant = constantNow !== '' ? constantNow : constantOld;

    // url用の名前も含んでいるので分離
    // また、文字コードもあるのでそれも変換
    this.urlName = extractionUrlName(this.nameJp);
    this.nameJp = extractionJaName(this.nameJp);
    this.pack = '';
    this.version = '';
  }

  toSongData() {
    return new Song([
      this.songTitle,
      this.nameJp,
      this.nameEn,
      this.composer,
      this.pack,
      this.version,
      this.side,
      this.difficulty,
      this.level,
      Number(this.constant),
      Number(this.notes),
      0,
    ]);
  }
}

export function fetchSongDataFromWiki(collectSong: CollectionSong) {
  // wikiから、追加のデータを取得
  const songData = FetchArcaeaWiki.createSongData(collectSong.urlName);
  Utilities.sleep(1500); //サーバーに負荷をかけないようにする

  // wikiからのデータを取り込む
  collectSong.notes =
    collectSong.notes !== ''
      ? collectSong.notes
      : songData.getNotesByDiff(collectSong.difficulty)[0];
  collectSong.pack = songData.pack;
  collectSong.version = songData.version.match(/^(\d+\.\d+)/)[1];
}

declare const FetchArcaeaWiki: FetchArcaeaWiki;

interface FetchArcaeaWiki {
  createSongData(urlName: string): any;
}
