import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import "./assets/style.css";
import { LoginFormData, Product, ApiResponse, NewProduct, PaginationType } from './types';
import Pagination from './components/Pagination';

// API 基礎網址設定
const API_BASE = import.meta.env.VITE_API_URL;
// API 路徑，需要替換成自己的路徑
const API_PATH = import.meta.env.VITE_API_PATH;

// 創建 ReactSwal 實例
const ReactSwal = withReactContent(Swal);

function App() {
  // 表單資料狀態，用於存儲使用者名稱和密碼
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  // 管理登入狀態的 state，true 表示已登入，false 表示未登入
  const [isAuth, setIsAuth] = useState<boolean>(false);

  // 儲存產品列表的 state，初始值為空陣列
  const [products, setProducts] = useState<Product[]>([]);

  // 儲存當前選中產品詳情的 state，初始值為 null
  const [tempProduct, setTempProduct] = useState<Product | null>(null);

  // 新增商品的狀態
  const [newProduct, setNewProduct] = useState<NewProduct>({
    title: "",
    category: "",
    origin_price: 0,
    price: 0,
    unit: "",
    description: "",
    content: "",
    is_enabled: 1,
    imageUrl: "",
    imagesUrl: [],
    imagePreview: "",
    imagesPreview: []
  });

  const [showModal, setShowModal] = useState(false);  // 控制 Modal 顯示
  const [isEditing, setIsEditing] = useState(false);  // 控制是否為編輯模式
  const [editingId, setEditingId] = useState<string>('');  // 新增：儲存正在編輯的商品 ID
  const [showDetailModal, setShowDetailModal] = useState(false);  // 新增：控制查看細節 Modal

  // 新增分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType | null>(null);

  // 取得產品列表的非同步函式
  const getData = async (page = 1) => {
    try {
      const response = await axios.get<ApiResponse>(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
      );
      console.log('API 回應:', response.data); // 加入這行來檢查 API 回應
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || null);
    } catch (error) {
      console.error('API 錯誤:', error);
    }
  };

  // 處理表單輸入變更的函式
  // 當使用者在輸入框中輸入時觸發
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 處理登入表單提交的非同步函式
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`;
      axios.defaults.headers.common.Authorization = token;
      getData();
      setIsAuth(true);
      
      ReactSwal.fire({
        title: '登入成功',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        ReactSwal.fire({
          title: '登入失敗',
          text: error.response?.data.message,
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  // 使用 useEffect 在元件載入時檢查登入狀態
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 從 Cookie 中取得 token
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("hexToken="))
          ?.split("=")[1];
        
        if (!token) {
          setIsAuth(false);
          return;
        }

        // 設定 axios 預設標頭
        axios.defaults.headers.common.Authorization = token;
        
        // 驗證 token
        const response = await axios.post(`${API_BASE}/api/user/check`);
        
        if (response.data.success) {
          setIsAuth(true);
          getData();  // 取得產品資料
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        console.error('登入驗證失敗:', error);
        setIsAuth(false);
      }
    };

    checkLoginStatus();
  }, []); // 空依賴陣列表示只在元件首次載入時執行

  // 處理新增商品
  const handleAddProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post<ApiResponse>(
        `${API_BASE}/api/${API_PATH}/admin/product`,
        {
          data: newProduct
        }
      );
      
      if (response.data.success) {
        ReactSwal.fire({
          title: '商品新增成功',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
        getData();
        setShowModal(false);  // 關閉 Modal
        // 重置表單
        setNewProduct({
          title: "",
          category: "",
          origin_price: 0,
          price: 0,
          unit: "",
          description: "",
          content: "",
          is_enabled: 1,
          imageUrl: "",
          imagesUrl: [],
          imagePreview: "",
          imagesPreview: []
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        ReactSwal.fire({
          title: '新增失敗',
          text: error.response?.data.message,
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  // 處理表單輸入
  const handleProductChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'imageUrl') {
      // 直接設定圖片網址和預覽
      setNewProduct(prev => ({
        ...prev,
        imageUrl: value,
        imagePreview: value // 確保預覽值也被設定
      }));
    } else if (name === 'imagesUrl') {
      // 處理多圖片網址
      const urls = value.split(',').map(url => url.trim()).filter(url => url);
      setNewProduct(prev => ({
        ...prev,
        imagesUrl: urls,
        imagesPreview: urls // 確保預覽值也被設定
      }));
    } else {
      // 處理其他欄位
      setNewProduct(prev => ({
        ...prev,
        [name]: e.target.type === 'number' ? Number(value) : value
      }));
    }
  };

  // 刪除商品函式
  const handleDelete = async (id: string) => {
    const result = await ReactSwal.fire({
      title: '確定要刪除嗎？',
      text: "此操作無法復原！",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '是的，刪除！',
      cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete<ApiResponse>(
          `${API_BASE}/api/${API_PATH}/admin/product/${id}`
        );
        
        if (response.data.success) {
          ReactSwal.fire({
            title: '已刪除',
            text: '商品已成功刪除！',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          });
          getData();
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          ReactSwal.fire({
            title: '錯誤',
            text: `刪除失敗：${error.response?.data.message}`,
            icon: 'error',
            confirmButtonColor: '#3085d6'
          });
        }
      }
    }
  };

  // 開啟編輯 Modal
  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setEditingId(product.id);  // 保存正在編輯的商品 ID
    setNewProduct({
      title: product.title,
      category: product.category,
      origin_price: product.origin_price,
      price: product.price,
      unit: product.unit || "",
      description: product.description || "",
      content: product.content || "",
      is_enabled: product.is_enabled as number,
      imageUrl: product.imageUrl,
      imagesUrl: product.imagesUrl || [],
      imagePreview: product.imageUrl,
      imagesPreview: product.imagesUrl || []
    });
    setShowModal(true);
  };

  // 處理更新商品
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.put<ApiResponse>(
        `${API_BASE}/api/${API_PATH}/admin/product/${editingId}`,  // 使用保存的 ID
        {
          data: newProduct
        }
      );
      
      if (response.data.success) {
        ReactSwal.fire({
          title: '商品更新成功',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
        getData();
        setShowModal(false);
        setIsEditing(false);
        setEditingId('');  // 清除編輯中的 ID
        // 重置表單
        setNewProduct({
          title: "",
          category: "",
          origin_price: 0,
          price: 0,
          unit: "",
          description: "",
          content: "",
          is_enabled: 1,
          imageUrl: "",
          imagesUrl: [],
          imagePreview: "",
          imagesPreview: []
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        ReactSwal.fire({
          title: '更新失敗',
          text: error.response?.data.message,
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  // Modal 關閉時也要清除編輯狀態
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId('');  // 清除編輯中的 ID
    setNewProduct({
      title: "",
      category: "",
      origin_price: 0,
      price: 0,
      unit: "",
      description: "",
      content: "",
      is_enabled: 1,
      imageUrl: "",
      imagesUrl: [],
      imagePreview: "",
      imagesPreview: []
    });
  };

  // 添加圖片上傳函式
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file-to-upload', file);

      // 確保 token 存在於 headers 中
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("No token found");
      }

      // 修正 API 路徑
      const response = await axios.post<{
        success: boolean;
        imageUrl?: string;
        message?: string;
      }>(
        `${API_BASE}/api/${API_PATH}/admin/upload`,  // 移除 v2
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token
          }
        }
      );

      console.log('上傳回應:', response.data);  // 檢查回應

      if (response.data.success && response.data.imageUrl) {
        setNewProduct(prev => ({
          ...prev,
          imageUrl: response.data.imageUrl,
          imagePreview: response.data.imageUrl
        }));

        ReactSwal.fire({
          title: '成功',
          text: '圖片上傳成功',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (axios.isAxiosError(error)) {
        console.log('錯誤回應:', error.response?.data);  // 檢查錯誤回應
        ReactSwal.fire({
          title: '錯誤',
          text: error.response?.data?.message || '圖片上傳失敗',
          icon: 'error'
        });
      }
    }
  };

  // 處理頁碼變更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getData(page);
  };

  // 渲染 UI
  return (
    <>
      {/* 使用條件渲染：已登入顯示產品列表，未登入顯示登入表單 */}
      {isAuth ? (
        // 已登入狀態的 UI
        <div className="container p-5">  {/* 改用 container-fluid 讓表格更寬 */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>產品列表</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              新增商品
            </button>
          </div>

          {/* 產品列表表格 */}
          <table className="table align-middle">
            <thead>
              <tr>
                <th>縮圖</th>
                <th>產品名稱</th>
                <th>分類</th>
                <th>單位</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="align-middle">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl}
                        alt={product.title}
                        className="img-thumbnail"
                        style={{ 
                          width: '80px',
                          height: '80px',
                          objectFit: 'contain'
                        }}
                      />
                    )}
                  </td>
                  <td className="align-middle">{product.title}</td>
                  <td className="align-middle">{product.category}</td>
                  <td className="align-middle">{product.unit}</td>
                  <td className="align-middle">{product.origin_price}</td>
                  <td className="align-middle">{product.price}</td>
                  <td className="align-middle">
                    <span 
                      className={`badge ${product.is_enabled ? 'bg-success' : 'bg-danger'}`}
                      style={{ fontSize: '0.9rem', padding: '8px 12px' }}  // 調整大小和間距
                    >
                      {product.is_enabled ? '啟用' : '未啟用'}
                    </span>
                  </td>
                  <td className="align-middle">
                    <button 
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => {
                        setTempProduct(product);
                        setShowDetailModal(true);
                      }}
                    >
                      查看
                    </button>
                    <button 
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(product)}
                    >
                      編輯
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 商品新增/編輯 Modal */}
          {showModal && (
            <div className="modal" style={{ display: 'block' }}>
              <div className="modal-dialog modal-lg"> {/* 使用 modal-lg 讓視窗更寬 */}
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {isEditing ? '編輯商品' : '新增商品'}
                    </h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={isEditing ? handleUpdate : handleAddProduct}>
                      <div className="row">
                        {/* 左側欄位 */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">商品名稱</label>
                            <input
                              type="text"
                              className="form-control"
                              name="title"
                              value={newProduct.title}
                              onChange={handleProductChange}
                              required
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">商品描述</label>
                            <textarea
                              className="form-control"
                              name="description"
                              value={newProduct.description}
                              onChange={handleProductChange}
                              rows={3}
                              required
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">商品內容</label>
                            <textarea
                              className="form-control"
                              name="content"
                              value={newProduct.content}
                              onChange={handleProductChange}
                              rows={3}
                              required
                            />
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">分類</label>
                              <input
                                type="text"
                                className="form-control"
                                name="category"
                                value={newProduct.category}
                                onChange={handleProductChange}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">單位</label>
                              <input
                                type="text"
                                className="form-control"
                                name="unit"
                                value={newProduct.unit}
                                onChange={handleProductChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">原價</label>
                              <input
                                type="number"
                                className="form-control"
                                name="origin_price"
                                value={newProduct.origin_price}
                                onChange={handleProductChange}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">售價</label>
                              <input
                                type="number"
                                className="form-control"
                                name="price"
                                value={newProduct.price}
                                onChange={handleProductChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label d-block">商品狀態</label>
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="is_enabled"
                                id="enabled"
                                value="1"
                                checked={newProduct.is_enabled === 1}
                                onChange={(e) => setNewProduct(prev => ({
                                  ...prev,
                                  is_enabled: parseInt(e.target.value)
                                }))}
                              />
                              <label 
                                className="form-check-label text-success" 
                                htmlFor="enabled"
                              >
                                啟用
                              </label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="is_enabled"
                                id="disabled"
                                value="0"
                                checked={newProduct.is_enabled === 0}
                                onChange={(e) => setNewProduct(prev => ({
                                  ...prev,
                                  is_enabled: parseInt(e.target.value)
                                }))}
                              />
                              <label 
                                className="form-check-label text-danger" 
                                htmlFor="disabled"
                              >
                                未啟用
                              </label>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">商品圖片</label>
                            <div className="input-group">
                              <input
                                type="file"
                                className="form-control"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleImageUpload}
                              />
                              {newProduct.imageUrl && (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => setNewProduct(prev => ({
                                    ...prev,
                                    imageUrl: '',
                                    imagePreview: ''
                                  }))}
                                >
                                  移除
                                </button>
                              )}
                            </div>
                            {newProduct.imagePreview && (
                              <div className="mt-2">
                                <img
                                  src={newProduct.imagePreview}
                                  alt="預覽圖"
                                  style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    objectFit: 'contain'
                                  }}
                                />
                              </div>
                            )}
                            <small className="text-muted">
                              * 僅支援 jpg、jpeg 與 png 格式，檔案大小限制為 3MB 以下
                            </small>
                          </div>
                        </div>

                        {/* 右側圖片欄位 */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">其他圖片網址（多個網址請用逗號分隔）</label>
                            <textarea
                              className="form-control mb-2"
                              name="imagesUrl"
                              value={newProduct.imagesUrl?.join(', ')}
                              onChange={handleProductChange}
                              rows={3}
                              placeholder="請輸入圖片網址，多個網址請用逗號分隔"
                            />
                            <div className="row g-2">
                              {newProduct.imagesUrl?.map((url, index) => (
                                <div key={index} className="col-6">
                                  <img 
                                    src={url}
                                    alt={`圖片 ${index + 1}`}
                                    className="img-thumbnail"
                                    style={{ 
                                      width: '100%',
                                      height: '100px',
                                      objectFit: 'contain'
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={handleCloseModal}
                        >
                          關閉
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                        >
                          {isEditing ? '更新商品' : '新增商品'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 查看商品細節 Modal */}
          {showDetailModal && tempProduct && (
            <div className="modal" style={{ display: 'block' }}>
              <div className="modal-dialog modal-lg"> {/* 使用 modal-lg 讓視窗更寬 */}
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">商品細節</h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setShowDetailModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      {/* 左側圖片 */}
                      <div className="col-md-6">
                        <img 
                          src={tempProduct.imageUrl} 
                          alt={tempProduct.title}
                          className="img-fluid rounded"
                          style={{ 
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain'
                          }}
                        />
                        {/* 其他圖片預覽 */}
                        {tempProduct.imagesUrl && tempProduct.imagesUrl.length > 0 && (
                          <div className="row mt-3">
                            {tempProduct.imagesUrl.map((url, index) => (
                              <div key={index} className="col-3">
                                <img 
                                  src={url} 
                                  alt={`其他圖片 ${index + 1}`}
                                  className="img-thumbnail"
                                  style={{ 
                                    width: '100%',
                                    height: 'auto'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* 右側商品資訊 */}
                      <div className="col-md-6">
                        <h3 className="mb-3">{tempProduct.title}</h3>
                        
                        <div className="mb-3">
                          <h5 className="text-muted">商品描述</h5>
                          <p>{tempProduct.description}</p>
                        </div>
                        
                        <div className="mb-3">
                          <h5 className="text-muted">商品內容</h5>
                          <p>{tempProduct.content}</p>
                        </div>
                        
                        <div className="row mb-3">
                          <div className="col-6">
                            <h5 className="text-muted">分類</h5>
                            <p>{tempProduct.category}</p>
                          </div>
                          <div className="col-6">
                            <h5 className="text-muted">單位</h5>
                            <p>{tempProduct.unit}</p>
                          </div>
                        </div>
                        
                        <div className="row mb-3">
                          <div className="col-6">
                            <h5 className="text-muted">原價</h5>
                            <p className="text-decoration-line-through">
                              NT$ {tempProduct.origin_price}
                            </p>
                          </div>
                          <div className="col-6">
                            <h5 className="text-muted">特價</h5>
                            <p className="text-danger fw-bold">
                              NT$ {tempProduct.price}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h5 className="text-muted">商品狀態</h5>
                          <p>
                            <span className={`badge ${tempProduct.is_enabled ? 'bg-success' : 'bg-danger'}`}>
                              {tempProduct.is_enabled ? '啟用' : '未啟用'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowDetailModal(false)}
                    >
                      關閉
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        handleEdit(tempProduct);
                        setShowDetailModal(false);
                      }}
                    >
                      編輯商品
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 在表格下方加入分頁元件 */}
          {pagination && (
            <Pagination 
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        // 未登入狀態的 UI：登入表單
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
