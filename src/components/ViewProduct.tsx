import { Product } from "../types";

interface ViewProductProps {
  product: Product;
  show: boolean;
  onClose: () => void;
}

const ViewProduct = ({ product, show, onClose }: ViewProductProps) => {
  if (!show) return null;

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">商品詳細資訊</h5>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* 左側圖片區域 */}
              <div className="col-md-6 border-end">
                <div className="main-image mb-3">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="img-fluid rounded shadow-sm"
                  />
                </div>
                {product.imagesUrl && product.imagesUrl.length > 0 && (
                  <div className="other-images">
                    <h6 className="text-muted mb-2">其他圖片</h6>
                    <div className="row g-2">
                      {product.imagesUrl.map((url, index) => (
                        <div key={index} className="col-3">
                          <img 
                            src={url} 
                            alt={`其他圖片 ${index + 1}`}
                            className="img-thumbnail"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 右側資訊區域 */}
              <div className="col-md-6">
                {/* 基本資訊 */}
                <div className="basic-info mb-4">
                  <h3 className="mb-3">{product.title}</h3>
                  <div className="info-grid">
                    <div className="row mb-2">
                      <div className="col-4 text-muted">商品分類</div>
                      <div className="col-8">{product.category}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-4 text-muted">商品單位</div>
                      <div className="col-8">{product.unit}</div>
                    </div>
                  </div>
                </div>

                {/* 價格資訊 */}
                <div className="price-info mb-4 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">原價</small>
                      <div className="text-decoration-line-through">NT$ {product.origin_price}</div>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">特價</small>
                      <div className="h4 text-danger mb-0">NT$ {product.price}</div>
                    </div>
                  </div>
                </div>

                {/* 商品描述 */}
                <div className="description mb-4">
                  <h6 className="border-bottom pb-2">商品描述</h6>
                  <p className="text-muted">{product.description}</p>
                </div>

                {/* 商品內容 */}
                <div className="content mb-4">
                  <h6 className="border-bottom pb-2">商品內容</h6>
                  <p className="text-muted">{product.content}</p>
                </div>

                {/* 商品狀態 */}
                <div className="status mb-4">
                  <div className="d-flex justify-content-center align-items-center mb-2">
                    <span className="me-2">商品狀態:</span>
                    <span className={`badge ${product.is_enabled ? 'bg-success' : 'bg-danger'}`}>
                      {product.is_enabled ? '啟用' : '未啟用'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct; 