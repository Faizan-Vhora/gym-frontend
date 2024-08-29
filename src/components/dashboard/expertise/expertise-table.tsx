import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { PencilSimple, ToggleLeft, ToggleRight, Trash } from '@phosphor-icons/react';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

export interface ExpertiseEntry {
  id: number;
  title: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface ExpertiseTableProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  handleToggleStatus: (id: number) => void;
}

export function ExpertiseTable({
  onEdit,
  onDelete,
  handleToggleStatus = () => {},
}: ExpertiseTableProps): React.JSX.Element {
  const [entries, setEntries] = useState<ExpertiseEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const schema = z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      status: z.enum(['active', 'inactive']),
      createdAt: z.string().transform((str) => new Date(str)),
    })
  );

  useEffect(() => {
    axiosInstance
      .get('/expertise')
      .then((response) => {
        const data = response.data.data.items;
        try {
          const parsedData = schema.parse(data);
          setEntries(parsedData);
        } catch (e) {
          console.error('Validation error:', e);
          setError('Failed to load data due to validation error.');
        }
      })
      .catch((err) => {
        console.error('Error fetching expertise:', err);
        setError('Failed to load data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body1">No data found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.title}</TableCell>
                <TableCell>{entry.status}</TableCell>
                <TableCell>{entry.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(entry.id)}>
                    <PencilSimple />
                  </IconButton>
                  <IconButton onClick={() => onDelete(entry.id)}>
                    <Trash />
                  </IconButton>
                  <IconButton onClick={() => handleToggleStatus(entry.id)}>
                    {entry.status === 'active' ? <ToggleLeft /> : <ToggleRight />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
