'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';
import { FaqEntry, FaqStatus, FaqType } from '@/components/dashboard/faq/faq-tables';

// Define your validation schemas
const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  type: z.enum([FaqType.General, FaqType.User, FaqType.Trainer]).optional(),
  status: z.enum([FaqStatus.Active, FaqStatus.Inactive, FaqStatus.Archived]).optional(),
});

interface FaqFormProps {
  initialData?: FaqEntry;
  onSave: (faq: FaqEntry) => void;
}

export default function FaqForm({ initialData, onSave = () => {} }: FaqFormProps): React.JSX.Element {
  const [faq, setFaq] = React.useState<FaqEntry>(
    initialData || {
      id: 0,
      question: '',
      answer: '',
      type: FaqType.General,
      status: FaqStatus.Active,
    }
  );
  const [errors, setErrors] = React.useState<z.ZodFormattedError<z.object>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const faqId = searchParams.get('id');

  React.useEffect(() => {
    if (faqId) {
      axiosInstance
        .get(`/faq/${faqId}`)
        .then((response) => {
          setFaq(response.data.data);
        })
        .catch((error) => console.error('Error fetching FAQ:', error));
    }
  }, [faqId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFaq((prevFaq) => ({
      ...prevFaq,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFaq((prevFaq) => ({
      ...prevFaq,
      [name as string]: value as string,
    }));
  };

  const validate = (): boolean => {
    try {
      faqSchema.parse(faq);
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.format());
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const method = faq.id ? 'put' : 'post';
      const url = faq.id ? `/faq/${faq.id}` : '/faq';

      await axiosInstance({
        method: method,
        url: url,
        data: faq,
      });

      onSave(faq);
      console.log('Successfully saved');
      router.replace('/dashboard/faq');
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  return (
    <Stack spacing={4} className="p-6 bg-white rounded-lg shadow-md">
      <Typography variant="h4" className="text-gray-700">
        {faqId ? 'Edit FAQ' : 'Create FAQ'}
      </Typography>

      <TextField
        label="Question"
        name="question"
        value={faq.question}
        onChange={handleInputChange}
        fullWidth
        error={!!errors.question}
        helperText={errors.question?.message}
        className="my-4"
      />

      <TextField
        label="Answer"
        name="answer"
        value={faq.answer}
        onChange={handleInputChange}
        fullWidth
        error={!!errors.answer}
        helperText={errors.answer?.message}
        className="my-4"
        rows={5}
      />
      <FormControl variant="outlined" fullWidth>
      <InputLabel>Type</InputLabel>
      <Select label="Type" name="type" value={faq.type} onChange={handleSelectChange} fullWidth className="my-4">
        <MenuItem value={FaqType.General}>General</MenuItem>
        <MenuItem value={FaqType.User}>User</MenuItem>
        <MenuItem value={FaqType.Trainer}>Trainer</MenuItem>
      </Select>
     </FormControl>
      <FormControl variant="outlined" fullWidth>
      <InputLabel>Status</InputLabel>
      <Select label="Status" name="status" value={faq.status} onChange={handleSelectChange} fullWidth className="my-4">
        <MenuItem value={FaqStatus.Active}>Active</MenuItem>
        <MenuItem value={FaqStatus.Inactive}>Inactive</MenuItem>
        <MenuItem value={FaqStatus.Archived}>Archived</MenuItem>
      </Select>
      </FormControl>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button className="common-button" type="submit" variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button  variant="outlined" onClick={() => router.push('/dashboard/faq')}
           sx={{
            borderColor: '#d0021b',
            color: '#d0021b',
            transform: 'skewX(-20deg)',
            '&:hover': {
              borderColor: 'darkred',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
            },
          }}>
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
}
