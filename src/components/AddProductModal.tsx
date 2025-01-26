import { useState, FormEvent, ChangeEvent } from "react";
import { NewProduct } from "../types";
import axios from "axios";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const API_BASE = import.meta.env.VITE_API_URL;
const API_PATH = import.meta.env.VITE_API_PATH;
const ReactSwal = withReactContent(Swal);

interface AddProductModalProps {
    showModal: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddProductModal = ({ showModal, onClose, onSuccess }: AddProductModalProps) => {
    const initialFormState: NewProduct = {
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
    };

    const [formData, setFormData] = useState<NewProduct>(initialFormState);

    const resetForm = () => {
        setFormData(initialFormState);
        const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = '';
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${API_BASE}/api/${API_PATH}/admin/product`,
                { data: formData }
            );

            if (response.data.success) {
                ReactSwal.fire({
                    title: '成功！',
                    text: '商品已新增',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                });
                resetForm();
                onSuccess();
                onClose();
            }
        } catch (error) {
            ReactSwal.fire({
                title: '錯誤！',
                text: '新增失敗，請稍後再試',
                icon: 'error',
                confirmButtonText: '確定'
            });
            console.error('新增失敗:', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name === 'imagesUrl') {
            const urls = value.split(',').map(url => url.trim()).filter(url => url);
            setFormData(prev => ({
                ...prev,
                imagesUrl: urls
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? Number(value) : value
            }));
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, isMainImage = true) => {
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
                if (isMainImage) {
                    setFormData(prev => ({
                        ...prev,
                        imageUrl: response.data.imageUrl,
                        imagePreview: URL.createObjectURL(file)
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        imagesUrl: [...(prev.imagesUrl || []), response.data.imageUrl],
                        imagesPreview: [...(prev.imagesPreview || []), URL.createObjectURL(file)]
                    }));
                }
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
        }
    };

    if (!showModal) return null;

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">新增商品</h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white"
                            onClick={handleClose}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">商品名稱</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">分類</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="category"
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
                                        <label className="form-label">單位</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">商品狀態</label>
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
                                        <label className="form-label">原價</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="origin_price"
                                            value={formData.origin_price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">售價</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">產品描述</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">說明內容</label>
                                <textarea
                                    className="form-control"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows={3}
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">主要圖片</label>
                                <input
                                    type="file"
                                    className="form-control mb-2"
                                    onChange={(e) => handleImageUpload(e, true)}
                                    accept="image/*"
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="請輸入圖片連結"
                                />
                                {formData.imagePreview && (
                                    <img 
                                        src={formData.imagePreview} 
                                        alt="主要圖片預覽"
                                        className="img-fluid mt-2"
                                        style={{ maxHeight: '200px' }}
                                    />
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">其他圖片</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="imagesUrl"
                                    value={formData.imagesUrl?.join(',')}
                                    onChange={handleChange}
                                    placeholder="請輸入圖片連結，多個連結請用逗號分隔"
                                />
                                {(formData.imagesUrl || []).length > 0 && (
                                    <div className="row g-2 mt-2">
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
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                關閉
                            </button>
                            <button type="submit" className="btn btn-primary">
                                新增
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal; 