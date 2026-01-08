
import { useState, useMemo, useCallback } from "react";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export const usePagination = <T>(items: T[], initialPageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const paginationState: PaginationState = {
    currentPage,
    pageSize,
    totalItems,
    totalCount: totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToNextPage: nextPage,
    goToPreviousPage: prevPage,
  };

  return {
    paginatedItems,
    paginationState,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    setCurrentPage,
  };
};
