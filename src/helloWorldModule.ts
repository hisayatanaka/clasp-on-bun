export function sayHelloWorldLogic(): void {
  // 関数名を変更してエクスポート (元の名前でも良い)
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheets()[0]; // 最初のシートを取得
    if (sheet) {
      sheet.getRange('A1').setValue('Hello, World.');
      SpreadsheetApp.getUi().alert(
        '成功',
        'A1セルに "Hello, World." と書き込みました。',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : '不明なエラーが発生しました';
    Logger.log(`Error in sayHelloWorldLogic: ${errorMessage}`);
    SpreadsheetApp.getUi().alert(
      'エラー',
      `エラーが発生しました: ${errorMessage}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}
