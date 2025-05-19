import { sayHelloWorldLogic } from './helloWorldModule'

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('カスタムマクロ')
      .addItem('Hello World実行', 'sayHelloWorldToSheetFromTS') // ここで呼び出す関数名を指定
      .addToUi();
}

// GASの場合はグローバル関数として公開するのが一般的
// …ではあるが、そもそも使われてない（副作用がない）ので明示的に渡さないとバンドルされない
(globalThis as any).onOpen = onOpen;
(globalThis as any).sayHelloWorldToSheetFromTS = sayHelloWorldLogic;
