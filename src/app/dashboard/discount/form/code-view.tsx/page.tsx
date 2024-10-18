import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import axiosInstance from '@/lib/axios';

const CodeNameTable = () => {
  const searchParams = useSearchParams();
  const codeName = searchParams.get('codeName');
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  interface UserData {
    id: number;
    fullName: string;
    email: string;
    memberId: number;
    phoneNumber: string;
    usageCount: number;
  }

  useEffect(() => {
    if (codeName) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get<{ data: UserData }>(`/discount/user-list/${codeName}`); // Adjust the endpoint accordingly
          // Wrap the single UserData object in an array
          setData([response.data.data]); // Set data as an array containing the UserData object
        } catch (err: unknown) {
          err instanceof Error ? err.message : 'An unexpected error occurred';
        } finally {
          setLoading(false);
        }
      };

      void fetchData();
    }
  }, [codeName]);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            {/* Add more table headers as needed */}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.memberId}</TableCell>
              <TableCell>{item.fullName}</TableCell>
              <TableCell>{item.email}</TableCell>
              {/* Add more table cells as needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {loading && <CustomLoader />}
    </TableContainer>
  );
};

export default CodeNameTable;
