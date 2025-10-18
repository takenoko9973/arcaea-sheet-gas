export function setDailyTrigger() {
    // 既存のトリガーを削除
    const allTriggers = ScriptApp.getProjectTriggers();
    for (const trigger of allTriggers) {
        if (trigger.getHandlerFunction() === "setDataByDate") {
            ScriptApp.deleteTrigger(trigger);
            break;
        }
    }

    // 次の日の切り替わり時に実行するように設定
    const now = new Date();
    const dailyTrigger = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0);
    ScriptApp.newTrigger("setDataByDate").timeBased().at(dailyTrigger).create();

    console.log("set daily Trigger: " + dailyTrigger);
}
