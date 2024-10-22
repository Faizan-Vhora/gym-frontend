import React from 'react';
import { TablePagination } from '@mui/material';

interface CommonTablePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const CommonTablePagination: React.FC<CommonTablePaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <TablePagination
      component="div"
      count={totalItems}
      page={currentPage}
      onPageChange={onPageChange}
      rowsPerPage={itemsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      labelRowsPerPage="Records per page"
      rowsPerPageOptions={[5, 10, 25]}
    />
  );
};

export default CommonTablePagination;
