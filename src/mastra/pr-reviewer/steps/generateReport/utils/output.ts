import { mkdir, writeFile } from "fs/promises";
import path from "path";

const OUTPUT_DIR = ".output";

/**
 * レポート用のタイムスタンプ付きファイル名を生成する
 *
 * @return 生成されたファイル名 (例: "20230101120000_pull_request.org")。
 */
export const generateReportFilename = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
  return `${timestamp}_pull_request.org`;
};

/**
 * レポート内容をファイルに書き込む。
 */
export const writeReportToFile = async (reportContent: string): Promise<string> => {
  const projectRoot = process.cwd();
  const filename = generateReportFilename();
  const outputPath = path.join(projectRoot, OUTPUT_DIR, filename);

  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(outputPath, reportContent);
    console.log(`レポートが正常に生成されました: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("レポートファイルの書き込みエラー:", error);
    throw new Error("レポートファイルの書き込みに失敗しました。");
  }
};
