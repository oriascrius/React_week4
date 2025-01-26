import { Product } from "../types";
import axios from "axios";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const ReactSwal = withReactContent(Swal);
const API_BASE = import.meta.env.VITE_API_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

interface ProductActionsProps {
  product: Product;
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductActions = ({ product, onEdit, onView, onDelete }: ProductActionsProps) => {
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
        const response = await axios.delete(
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
          onDelete(id);
        }
      } catch (error) {
        ReactSwal.fire({
          title: '錯誤',
          text: '刪除失敗，請稍後再試',
          icon: 'error',
          confirmButtonText: '確定'
        });
      }
    }
  };

  return (
    <>
      <button 
        className="btn btn-primary btn-sm me-2"
        onClick={() => onView(product)}
      >
        查看
      </button>
      <button 
        className="btn btn-warning btn-sm me-2"
        onClick={() => onEdit(product)}
      >
        編輯
      </button>
      <button 
        className="btn btn-danger btn-sm"
        onClick={() => handleDelete(product.id)}
      >
        刪除
      </button>
    </>
  );
};

export default ProductActions; 