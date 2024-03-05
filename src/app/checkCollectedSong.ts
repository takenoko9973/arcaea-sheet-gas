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
import { updateData } from './updateData';
import { registSongData } from './registSong';

export function checkCollectedSong() {
  autoRegist();
  update();
}

function autoRegist() {
  console.log('Start auto regist');
  // registSongData("PST");
  // registSongData("PRS");
  registSongData('FTR');
  registSongData('BYD');
  registSongData('ETR');
  console.log('End auto regist');
}

function update() {
  console.log('Start update');
  updateData('FTR');
  updateData('BYD');
  updateData('ETR');
  console.log('Start update');
}
