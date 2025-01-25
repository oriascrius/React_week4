/// <reference types="vite/client" />

// 定義環境變數的介面
interface ImportMetaEnv {
  // readonly（唯讀）表示這些值不能被修改，只能讀取
  // 例如：不能寫 import.meta.env.VITE_API_URL = "新網址" （這會報錯）
  readonly VITE_API_URL: string;  // API 的基礎網址
  readonly VITE_API_PATH: string; // API 的路徑名稱
}

// 擴充 ImportMeta 介面
interface ImportMeta {
  // env 屬性也是唯讀的，防止意外修改環境變數
  readonly env: ImportMetaEnv;
} 