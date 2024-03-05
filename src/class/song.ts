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
export class Song {
  composer: string;
  constant: number;
  difficulty: string;
  level: string;
  nameEn: string;
  nameJp: string;
  notes: number;
  pack: string;
  score: number;
  side: string;
  songTitle: string;
  version: string;
  constructor(record: any[]) {
    [
      this.songTitle,
      this.nameJp,
      this.nameEn,
      this.composer,
      this.pack,
      this.version,
      this.side,
      this.difficulty,
      this.level,
      this.constant,
      this.notes,
      this.score,
    ] = record;
  }

  getSongDataList() {
    return [
      this.songTitle,
      this.nameJp,
      this.nameEn,
      this.composer,
      this.pack,
      "'" + this.version,
      this.side,
      this.difficulty,
      this.level,
      this.constant,
      this.notes,
      this.score,
    ];
  }

  /**
   * 不足しているデータがあるかどうか
   */
  isLuckData() {
    const existBlank = this.getSongDataList().includes('');
    const existNegative = this.getSongDataList().includes(-1);
    return existBlank || existNegative;
  }
}
