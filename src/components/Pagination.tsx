import { PaginationType } from '../types';

interface PaginationProps {
  pagination: PaginationType;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, currentPage, onPageChange }: PaginationProps) => {
  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${!pagination.has_pre ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.has_pre}
          >
            上一頁
          </button>
        </li>
        {[...Array(pagination.total_pages)].map((_, index) => (
          <li 
            key={index} 
            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(index + 1)}
            >
              {index + 1}
            </button>
          </li>
        ))}
        <li className={`page-item ${!pagination.has_next ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.has_next}
          >
            下一頁
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 