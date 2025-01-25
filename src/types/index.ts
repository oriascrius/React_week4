// API 回應的通用介面
// 定義所有 API 回應都會有的基本資料結構
export interface ApiResponse {
  success: boolean;      // API 請求是否成功
  message?: string;      // 回應訊息（可選）
  token?: string;        // JWT 認證令牌（可選）
  expired?: string;      // 令牌過期時間（可選）
  products?: Product[];  // 產品資料陣列（可選）
  pagination?: PaginationType;
}

// 登入表單資料介面
// 定義登入時需要的資料欄位
export interface LoginFormData {  // 改名為 LoginFormData
  username: string;  // 使用者帳號（Email）
  password: string;  // 使用者密碼
}

// 產品資料介面
// 定義單一產品的所有屬性
export interface Product {
  id: string;            // 產品唯一識別碼
  title: string;         // 產品名稱
  category: string;      // 產品分類
  unit: string;          // 單位（如：個、件、組）
  origin_price: number;  // 產品原價
  price: number;         // 產品售價
  description: string;   // 產品描述
  content: string;       // 產品詳細內容
  is_enabled: number;    // 是否啟用（1: 啟用, 0: 停用）
  imageUrl: string;      // 主要圖片網址
  imagesUrl?: string[]; // 其他圖片網址陣列（可選）
}

// 新增商品的資料介面
export interface NewProduct {
  title: string;         // 產品名稱
  category: string;      // 產品分類
  origin_price: number;  // 產品原價
  price: number;         // 產品售價
  unit: string;          // 單位
  description: string;   // 產品描述
  content: string;       // 產品詳細內容
  is_enabled: number;    // 是否啟用
  imageUrl: string | undefined;  // 主要圖片網址
  imagesUrl?: string[]; // 其他圖片網址陣列（可選）
  imagePreview?: string; // 主圖預覽（可選）
  imagesPreview?: string[]; // 其他圖片預覽（可選）
}

// 環境變數相關型別宣告
declare module '*.css';  // 讓 TypeScript 認識 CSS 模組

// 環境變數介面
declare interface ImportMetaEnv {
  readonly VITE_API_URL: string;   // API 基礎網址
  readonly VITE_API_PATH: string;  // API 路徑
}

export interface PaginationType {  // 改名從 Pagination 到 PaginationType
  total_pages: number;
  current_page: number;
  has_pre: boolean;
  has_next: boolean;
  category?: string;
} 