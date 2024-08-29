'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Stack, Typography } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { TrainerFilter } from '@/components/dashboard/trainer-package/trainer-package-filter';
import { TrainerEntry, TrainerTable } from '@/components/dashboard/trainer-package/trainer-package-table';

const initialTrainers: TrainerEntry[] = [
  {
    id: 1,
    trainer_id: 'TR001',
    package_name: 'Basic Fitness Package',
    package_description: 'A basic package for beginners.',
    price: 100,
    currency: 'USD',
    duration: 'Per Month',
    status: 'Active',
    createdAt: new Date(),
  },
  // Add more initial data as needed
];

export default function TrainerManagementPage(): React.JSX.Element {
  const [trainers, setTrainers] = React.useState<TrainerEntry[]>(initialTrainers);
  const [filteredTrainers, setFilteredTrainers] = React.useState<TrainerEntry[]>(initialTrainers);
  const [filterType, setFilterType] = React.useState<string>('All');
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const router = useRouter();

  React.useEffect(() => {
    const applyFilter = () => {
      if (filterType === 'All') {
        setFilteredTrainers(trainers);
      } else {
        setFilteredTrainers(trainers.filter((trainer) => trainer.status === filterType));
      }
    };
    applyFilter();
  }, [filterType, trainers]);

  const handleAddClick = () => {
    router.push('/dashboard/trainer-package/form');
  };

  const handleEdit = (id: number) => {
    const trainerToEdit = trainers.find((trainer) => trainer.id === id);
    if (trainerToEdit) {
      router.push(`/dashboard/trainer-package   /form/${id}`);
    }
  };

  const handleSave = (newTrainer: TrainerEntry) => {
    if (newTrainer.id) {
      setTrainers(trainers.map((trainer) => (trainer.id === newTrainer.id ? newTrainer : trainer)));
    } else {
      setTrainers([...trainers, newTrainer]);
    }
    router.push('/dashboard/trainer'); // Navigate back to the Trainer management page
  };

  const handleDelete = (id: number) => {
    setTrainers(trainers.filter((trainer) => trainer.id !== id));
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Trainer Management</Typography>
        </Stack>
        <Button
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
          onClick={handleAddClick}
        >
          Add
        </Button>
      </Stack>
      <TrainerFilter onFilterChange={handleFilterChange} />
      <TrainerTable
        trainers={filteredTrainers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        page={page}
        rowsPerPage={rowsPerPage}
        totalEntries={filteredTrainers.length}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
      />
    </Stack>
  );
}
