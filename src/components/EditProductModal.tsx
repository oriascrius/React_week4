import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { Product, NewProduct } from "../types";
import axios from "axios";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const API_BASE = import.meta.env.VITE_API_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const ReactSwal = withReactContent(Swal);

interface ProductModalProps {
    showModal: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editProduct?: Product;
}

const ProductModal = ({ showModal, onClose, onSuccess, editProduct }: ProductModalProps) => {
    const [formData, setFormData] = useState<NewProduct>({
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

    useEffect(() => {
        if (editProduct) {
            setFormData({
                title: editProduct.title,
                category: editProduct.category,
                origin_price: editProduct.origin_price,
                price: editProduct.price,
                unit: editProduct.unit || "",
                description: editProduct.description || "",
                content: editProduct.content || "",
                is_enabled: editProduct.is_enabled,
                imageUrl: editProduct.imageUrl,
                imagesUrl: editProduct.imagesUrl || [],
                imagePreview: editProduct.imageUrl,
                imagesPreview: editProduct.imagesUrl || []
            });
        }
    }, [editProduct]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const url = editProduct
                ? `${API_BASE}/api/${API_PATH}/admin/product/${editProduct.id}`
                : `${API_BASE}/api/${API_PATH}/admin/product`;

            const method = editProduct ? 'put' : 'post';

            const response = await axios[method](url, {
                data: formData
            });

            if (response.data.success) {
                ReactSwal.fire({
                    title: '成功！',
                    text: editProduct ? '商品已更新' : '商品已新增',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                });
                onSuccess();
                onClose();
            }
        } catch (error) {
            ReactSwal.fire({
                title: '錯誤！',
                text: '操作失敗，請稍後再試',
                icon: 'error',
                confirmButtonText: '確定'
            });
            console.error('提交失敗:', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file-to-upload', file);

        try {
            const response = await axios.post(
                `${API_BASE}/api/${API_PATH}/admin/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    imageUrl: response.data.imageUrl
                }));
                ReactSwal.fire({
                    title: '成功！',
                    text: '圖片上傳成功',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            ReactSwal.fire({
                title: '錯誤！',
                text: '圖片上傳失敗',
                icon: 'error',
                confirmButtonText: '確定'
            });
            console.error('上傳圖片失敗:', error);
        }
    };

    if (!showModal) return null;

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">編輯商品</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="title">商品名稱</label>
                                        <input  
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            id="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="category">分類</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="category"
                                            id="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="unit">單位</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="unit"
                                            id="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="is_enabled">商品狀態</label>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <div className="form-check me-4">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="is_enabled"
                                                    id="enabled"
                                                    checked={formData.is_enabled === 1}
                                                    onChange={() => setFormData(prev => ({
                                                        ...prev,
                                                        is_enabled: 1
                                                    }))}
                                                />
                                                <label className="form-check-label" htmlFor="enabled">
                                                    <span className="text-success">✓ 啟用</span>
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="is_enabled"
                                                    id="disabled"
                                                    checked={formData.is_enabled === 0}
                                                    onChange={() => setFormData(prev => ({
                                                        ...prev,
                                                        is_enabled: 0
                                                    }))}
                                                />
                                                <label className="form-check-label" htmlFor="disabled">
                                                    <span className="text-danger">✗ 不啟用</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="origin_price">原價</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="origin_price"
                                            id="origin_price"
                                            min={0}
                                            value={formData.origin_price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">售價</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            id="price"
                                            min={0}
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="description">商品描述</label>
                                        <textarea
                                            className="form-control"
                                            name="description"
                                            id="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="content">商品內容</label>
                                        <textarea
                                            className="form-control"
                                            name="content"
                                            id="content"
                                            value={formData.content}
                                            onChange={handleChange}
                                            rows={3}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="imageUrl">主要圖片</label>
                                        <input
                                            type="file"
                                            id="imageUrl"
                                            className="form-control mb-2"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        <input
                                            type="text"
                                            id="imageUrl"
                                            className="form-control mb-2"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleChange}
                                            placeholder="或直接輸入圖片連結"
                                        />
                                        {formData.imageUrl && (
                                            <img 
                                                src={formData.imageUrl} 
                                                alt="主要圖片預覽"
                                                className="img-fluid mb-3 rounded"
                                                style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="imagesUrl">其他圖片</label>
                                        <input
                                            type="text"
                                            id="imagesUrl"
                                            className="form-control mb-2"
                                            name="imagesUrl"
                                            value={(formData.imagesUrl || []).join(',')}
                                            onChange={(e) => {
                                                const urls = e.target.value.split(',').filter(url => url.trim());
                                                setFormData(prev => ({
                                                    ...prev,
                                                    imagesUrl: urls
                                                }));
                                            }}
                                            placeholder="請輸入圖片連結，多個連結請用逗號分隔"
                                        />
                                        {(formData.imagesUrl || []).length > 0 && (
                                            <div className="row g-2">
                                                {(formData.imagesUrl || []).map((url, index) => (
                                                    <div key={index} className="col-6">
                                                        <img 
                                                            src={url} 
                                                            alt={`其他圖片 ${index + 1}`}
                                                            className="img-thumbnail"
                                                            style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                關閉
                            </button>
                            <button type="submit" className="btn btn-primary">
                                更新
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductModal; 