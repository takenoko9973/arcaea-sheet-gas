# Repository rules

- Node.js / Yarn の依存管理、format、lint、typecheck、test、build は devcontainer 内で実行する。
- 編集後は `yarn fix` → `yarn verify` を実行し、test と build の成功を個別に確認する。
- deploy script、`clasp push`、`clasp deploy`、その他の本番 Apps Script 更新は実行しない。
- 認証情報や secret を取得、表示、変更しない。
- `baseline/` は参照専用とし、明示的な依頼なしに編集しない。
