'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';

import 'react-toastify/dist/ReactToastify.css';

import { FaqStatus, FaqType } from '@/components/dashboard/faq/faq-tables';
import type { FaqEntry } from '@/components/dashboard/faq/faq-tables';

// Define validation schemas
const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  type: z.enum([FaqType.General, FaqType.User, FaqType.Trainer]).optional(),
  status: z.enum([FaqStatus.Active, FaqStatus.Inactive, FaqStatus.Archived]).optional(),
});

type FaqFormInputs = z.infer<typeof faqSchema>;

export default function FaqForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [faq, setFaq] = useState<FaqFormInputs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FaqFormInputs>({
    resolver: zodResolver(faqSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (id) {
      axiosInstance
        .get<{ data: FaqEntry }>(`/faq/${id}`)
        .then((response) => {
          // Type assertion to ensure data conforms to FaqData
          const fetchedData: FaqEntry = response.data.data;
          setFaq(fetchedData);
        })
        .catch((err: unknown) => {
          let errorMessage: string;
          if (err instanceof Error) {
            errorMessage = err.message; // Safely access the message property
          } else {
            errorMessage = 'An unexpected error occurred'; // Fallback message
          }
          toast.error(errorMessage);
        });
    }
  }, [id]);

  useEffect(() => {
    if (faq) {
      setValue('question', faq.question);
      setValue('answer', faq.answer);
      setValue('type', faq.type);
      setValue('status', faq.status);
    }
  }, [faq, setValue]);

  const onSubmit = async (data: FaqFormInputs): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const method = id ? 'put' : 'post';
      const url = id ? `/faq/${id}` : '/faq';

      await axiosInstance({
        method,
        url,
        data,
      });
      toast.success('FAQ saved successfully');
      router.push('/dashboard/faq'); // Redirect to the listing page after successful save
    } catch (err: unknown) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message; // Safely access the message property
      } else {
        errorMessage = 'An unexpected error occurred'; // Fallback message
      }
      toast.error(errorMessage);
      setError('Failed to save FAQ details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!faq && id) {
    return <div>Loading...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={id ? 'Edit FAQ' : 'Create FAQ'} subheader="Fill in the FAQ details" />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <FormControl fullWidth required>
              <InputLabel>Question</InputLabel>
              <OutlinedInput {...register('question')} label="Question" error={Boolean(errors.question)} />
              {errors.question ? <FormHelperText>{errors.question.message}</FormHelperText> : null}
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Answer</InputLabel>
              <OutlinedInput {...register('answer')} label="Answer" multiline rows={4} error={Boolean(errors.answer)} />
              {errors.answer ? <FormHelperText>{errors.answer.message}</FormHelperText> : null}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select {...register('type')} label="Type" defaultValue={faq?.type || ''} error={Boolean(errors.type)}>
                <MenuItem value={FaqType.General}>{FaqType.General}</MenuItem>
                <MenuItem value={FaqType.User}>{FaqType.User}</MenuItem>
                <MenuItem value={FaqType.Trainer}>{FaqType.Trainer}</MenuItem>
              </Select>
              {errors.type ? <FormHelperText>{errors.type.message}</FormHelperText> : null}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                {...register('status')}
                label="Status"
                defaultValue={faq?.status || ''}
                error={Boolean(errors.status)}
              >
                <MenuItem value={FaqStatus.Active}>{FaqStatus.Active}</MenuItem>
                <MenuItem value={FaqStatus.Inactive}>{FaqStatus.Inactive}</MenuItem>
                <MenuItem value={FaqStatus.Archived}>{FaqStatus.Archived}</MenuItem>
              </Select>
              {errors.status ? <FormHelperText>{errors.status.message}</FormHelperText> : null}
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button className="common-button" variant="contained" type="submit" disabled={isSubmitting}>
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              router.push('/dashboard/faq');
            }}
            sx={{
              borderColor: '#d0021b',
              color: '#d0021b',
              transform: 'skewX(-20deg)',
              '&:hover': {
                borderColor: 'darkred',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
        </CardActions>
      </Card>
      {error && <div className="error-message">{error}</div>}
      <ToastContainer />
    </Box>
  );
}
