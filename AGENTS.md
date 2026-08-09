# Repository rules

- Node.js / Yarn の依存管理、lint、test、build、TypeScript 検証は devcontainer 内で実行する。
- test と build は個別に実行する。deploy script、`clasp push`、その他の本番 Apps Script 更新は実行しない。
- 認証情報や secret を取得、表示、変更しない。
- `baseline/` は参照専用とし、明示的な依頼なしに編集しない。
