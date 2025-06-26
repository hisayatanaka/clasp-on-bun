// helloWorldModule.tsのテスト
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sayHelloWorldLogic } from './helloWorldModule';
import { createMockGASEnvironment } from '../tests/setup';

describe('sayHelloWorldLogic', () => {
  let mockGAS: ReturnType<typeof createMockGASEnvironment>;

  beforeEach(() => {
    // 各テスト前にモックをリセット
    vi.clearAllMocks();
    mockGAS = createMockGASEnvironment();

    // SpreadsheetAppのモック設定
    vi.mocked(
      (global as any).SpreadsheetApp.getActiveSpreadsheet
    ).mockReturnValue(mockGAS.mockSpreadsheet as any);
    vi.mocked((global as any).SpreadsheetApp.getUi).mockReturnValue(
      mockGAS.mockUi as any
    );
  });

  describe('正常系テスト', () => {
    it('スプレッドシートのA1セルに"Hello, World."を正常に書き込む', () => {
      // Arrange
      const mockSheet = mockGAS.mockSheet;
      vi.mocked(mockGAS.mockSpreadsheet.getSheets).mockReturnValue([mockSheet]);

      // Act
      sayHelloWorldLogic();

      // Assert
      expect(
        (global as any).SpreadsheetApp.getActiveSpreadsheet
      ).toHaveBeenCalledOnce();
      expect(mockGAS.mockSpreadsheet.getSheets).toHaveBeenCalledOnce();
      expect(mockSheet.getRange).toHaveBeenCalledWith('A1');
      expect(mockSheet.setValue).toHaveBeenCalledWith('Hello, World.');
    });

    it('成功時に適切なアラートを表示する', () => {
      // Arrange
      const mockSheet = mockGAS.mockSheet;
      vi.mocked(mockGAS.mockSpreadsheet.getSheets).mockReturnValue([mockSheet]);

      // Act
      sayHelloWorldLogic();

      // Assert
      expect((global as any).SpreadsheetApp.getUi).toHaveBeenCalled();
      expect(mockGAS.mockUi.alert).toHaveBeenCalledWith(
        '成功',
        'A1セルに "Hello, World." と書き込みました。',
        (global as any).SpreadsheetApp.ButtonSet.OK
      );
    });
  });

  describe('異常系テスト', () => {
    it('スプレッドシートが取得できない場合のエラーハンドリング', () => {
      // Arrange
      const mockError = new Error('Spreadsheet not found');
      vi.mocked(
        (global as any).SpreadsheetApp.getActiveSpreadsheet
      ).mockImplementation(() => {
        throw mockError;
      });

      // Act
      sayHelloWorldLogic();

      // Assert
      expect((global as any).Logger.log).toHaveBeenCalledWith(
        'Error in sayHelloWorldLogic: Spreadsheet not found'
      );
      expect(mockGAS.mockUi.alert).toHaveBeenCalledWith(
        'エラー',
        'エラーが発生しました: Spreadsheet not found',
        (global as any).SpreadsheetApp.ButtonSet.OK
      );
    });

    it('シートが存在しない場合はアラートを表示しない', () => {
      // Arrange
      vi.mocked(mockGAS.mockSpreadsheet.getSheets).mockReturnValue([]);

      // Act
      sayHelloWorldLogic();

      // Assert
      expect(mockGAS.mockUi.alert).not.toHaveBeenCalled();
      expect((global as any).Logger.log).not.toHaveBeenCalled();
    });

    it('nullシートの場合はアラートを表示しない', () => {
      // Arrange
      vi.mocked(mockGAS.mockSpreadsheet.getSheets).mockReturnValue([
        null as any,
      ]);

      // Act
      sayHelloWorldLogic();

      // Assert
      expect(mockGAS.mockUi.alert).not.toHaveBeenCalled();
      expect((global as any).Logger.log).not.toHaveBeenCalled();
    });

    it('setValue実行時のエラーハンドリング', () => {
      // Arrange
      const mockSheet = mockGAS.mockSheet;
      const mockError = new Error('Permission denied');
      vi.mocked(mockGAS.mockSpreadsheet.getSheets).mockReturnValue([mockSheet]);
      vi.mocked(mockSheet.setValue).mockImplementation(() => {
        throw mockError;
      });

      // Act
      sayHelloWorldLogic();

      // Assert
      expect((global as any).Logger.log).toHaveBeenCalledWith(
        'Error in sayHelloWorldLogic: Permission denied'
      );
      expect(mockGAS.mockUi.alert).toHaveBeenCalledWith(
        'エラー',
        'エラーが発生しました: Permission denied',
        (global as any).SpreadsheetApp.ButtonSet.OK
      );
    });

    it('unknown型エラーの場合のハンドリング', () => {
      // Arrange
      const unknownError = 'String error message';
      vi.mocked(
        (global as any).SpreadsheetApp.getActiveSpreadsheet
      ).mockImplementation(() => {
        throw unknownError;
      });

      // Act
      sayHelloWorldLogic();

      // Assert
      expect((global as any).Logger.log).toHaveBeenCalledWith(
        'Error in sayHelloWorldLogic: 不明なエラーが発生しました'
      );
      expect(mockGAS.mockUi.alert).toHaveBeenCalledWith(
        'エラー',
        'エラーが発生しました: 不明なエラーが発生しました',
        (global as any).SpreadsheetApp.ButtonSet.OK
      );
    });
  });

  describe('統合テスト', () => {
    it('正常フローの統合テスト', () => {
      // Arrange
      const mockSheet = mockGAS.mockSheet;
      vi.mocked(mockGAS.mockSpreadsheet.getSheets).mockReturnValue([mockSheet]);

      // Act
      sayHelloWorldLogic();

      // Assert - 各APIが呼び出されているか確認
      expect(
        (global as any).SpreadsheetApp.getActiveSpreadsheet
      ).toHaveBeenCalled();
      expect(mockGAS.mockSpreadsheet.getSheets).toHaveBeenCalled();
      expect(mockSheet.getRange).toHaveBeenCalledWith('A1');
      expect(mockSheet.setValue).toHaveBeenCalledWith('Hello, World.');
      expect((global as any).SpreadsheetApp.getUi).toHaveBeenCalled();
      expect(mockGAS.mockUi.alert).toHaveBeenCalledWith(
        '成功',
        'A1セルに "Hello, World." と書き込みました。',
        (global as any).SpreadsheetApp.ButtonSet.OK
      );
    });
  });
});
