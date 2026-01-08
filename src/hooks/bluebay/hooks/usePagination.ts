
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

// Overload for array-based pagination
export function usePagination<T>(items: T[], initialPageSize?: number): {
  paginatedItems: T[];
  paginationState: PaginationState;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  changePageSize: (newSize: number) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  pageSize: number;
  updateTotalCount: (count: number) => void;
};

// Overload for manual pagination (page size only)
export function usePagination(initialPageSize: number): {
  paginatedItems: unknown[];
  paginationState: PaginationState;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  changePageSize: (newSize: number) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  pageSize: number;
  updateTotalCount: (count: number) => void;
};

// Implementation
export function usePagination<T>(
  itemsOrPageSize: T[] | number,
  initialPageSize: number = 10
) {
  const isArrayMode = Array.isArray(itemsOrPageSize);
  const items = isArrayMode ? itemsOrPageSize : [];
  const defaultPageSize = isArrayMode ? initialPageSize : (itemsOrPageSize as number);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [manualTotalCount, setManualTotalCount] = useState(0);

  const totalItems = isArrayMode ? items.length : manualTotalCount;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedItems = useMemo(() => {
    if (!isArrayMode) return [];
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize, isArrayMode]);

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

  const updateTotalCount = useCallback((count: number) => {
    setManualTotalCount(count);
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
    currentPage,
    pageSize,
    updateTotalCount,
  };
}
