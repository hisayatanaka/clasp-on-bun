import { sayHelloWorldLogic } from './helloWorldModule';

/**
 * Google Apps Scriptのスプレッドシート開時に実行される関数
 * カスタムメニューを作成し、Hello World実行項目を追加する
 */
function onOpen(): void {
  SpreadsheetApp.getUi()
    .createMenu('カスタムマクロ')
    .addItem('Hello World実行', 'sayHelloWorldToSheetFromTS')
    .addToUi();
}

// Google Apps Scriptのグローバルスコープに直接設定
(globalThis as any).onOpen = onOpen;
(globalThis as any).sayHelloWorldToSheetFromTS = sayHelloWorldLogic;
