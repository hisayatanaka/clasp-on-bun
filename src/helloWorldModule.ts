export function sayHelloWorldLogic(): void { // 関数名を変更してエクスポート (元の名前でも良い)
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheets()[0]; // 最初のシートを取得
    if (sheet) {
      sheet.getRange('A1').setValue('Hello, World.');
      SpreadsheetApp.getUi().alert('成功', 'A1セルに "Hello, World." と書き込みました。', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (e: any) {
    Logger.log(`Error in sayHelloWorldToSheet: ${e.message}`); // エラーログの関数名は元のままにしておくか、合わせる
    SpreadsheetApp.getUi().alert('エラー', `エラーが発生しました: ${e.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
