'use client';

import React from 'react';
// import { formatAmount, formatHours } from '@/utils/converter';
// import { CustomLoader } from '@/utils/loader';
import {
  Card,
  // Divider,
  // Paper,
  Stack,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
  Typography,
} from '@mui/material';

// import { Barbell } from '@phosphor-icons/react';
// import { toast } from 'react-toastify';

// import axiosInstance from '@/lib/axios';
// import CommonTablePagination from '@/components/dashboard/reports/pagination'; // Adjust the import path as necessary

// import { SearchFilter } from '@/components/dashboard/reports/seach-filter';
// import { Trainer, TrainerExpertise } from '@/components/dashboard/trainer/trainer-table';
// import tableCss from '@/styles/table-css';

// // Define Trainer interface to specify the structure of trainer data

// // Define ApiResponse interface for the expected API response structure
// interface ApiResponse {
//   success: boolean;
//   message: string;
//   data: {
//     items: Trainer[];
//     meta: {
//       totalItems: number;
//       itemCount: number;
//       itemsPerPage: number;
//       totalPages: number;
//       currentPage: number;
//     };
//   };
//   errors: {};
// }

const MembershipReport: React.FC = () => {
  // const [data, setData] = useState<Trainer[]>([]);

  // // const [search, setSearch] = React.useState<string>('');
  // const [currentPage, setCurrentPage] = useState<number>(0);
  // const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  // const [totalItems, setTotalItems] = useState<number>(0);

  // Function to fetch data

  return (
    <>
      <Card>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }} padding={3}>
          <Typography variant="h5" style={{ fontFamily: '"Audiowide", sans-serif' }} sx={{ marginBottom: '10px' }}>
            Membership Report
          </Typography>
          {/* <SearchFilter onSearchChange={handleSearchChange} /> */}
        </Stack>
        Coming Soon
      </Card>
    </>
  );
};

export default MembershipReport;
