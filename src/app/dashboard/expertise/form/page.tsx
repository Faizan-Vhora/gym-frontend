'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { REGEX_VALIDATION } from '@/utils/constant';
import { CustomLoader } from '@/utils/loader';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';
import CustomEditor from '@/components/ckeditor';

const expertiseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .regex(REGEX_VALIDATION.FULL_NAME, 'Title should not contain numbers or special characters'),
  description: z.string().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type ExpertiseFormData = z.infer<typeof expertiseSchema>;

interface ExpertiseEntry extends ExpertiseFormData {
  id?: number;
  createdAt?: Date;
}

export default function ExpertiseForm(): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [expertise, setExpertise] = React.useState<ExpertiseEntry>();
  const [editorContent, setEditorContent] = React.useState<string>(''); // State for the editor content
  const router = useRouter();
  const searchParams = useSearchParams();
  const expertiseId = searchParams.get('id');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue, // Import setValue to update form state
  } = useForm<ExpertiseFormData>({
    resolver: zodResolver(expertiseSchema),
    defaultValues: {
      title: '',
      description: '', // Default description value
      status: 'active',
    },
  });

  React.useEffect(() => {
    if (expertiseId) {
      setLoading(true);
      axiosInstance
        .get<{ data: ExpertiseEntry }>(`/expertise/${expertiseId}`)
        .then((response) => {
          reset(response.data.data);
          setExpertise(response.data.data);
          setEditorContent(response.data.data.description || ''); // Set the editor content
        })
        .catch((error: unknown) => {
          error instanceof Error ? error.message : 'An unexpected error occurred';
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [expertiseId, reset]);

  const onSubmit = async (data: ExpertiseFormData): Promise<void> => {
    setLoading(true);
    try {
      const method = expertiseId ? 'put' : 'post';
      const url = expertiseId ? `/expertise/${expertiseId}` : '/expertise';

      await axiosInstance({
        method,
        url,
        data: { ...data, description: editorContent }, // Include the editor content
      });

      toast.success(`Expertise ${expertiseId ? 'updated' : 'created'} successfully`);
      router.push('/dashboard/expertise');
    } catch (error: unknown) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title={expertiseId ? 'Edit Expertise' : 'Create Expertise'} />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Title Field */}
            <Grid item xs={4}>
              <FormControl fullWidth required error={Boolean(errors.title)}>
                <InputLabel htmlFor="title">Title</InputLabel>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => <OutlinedInput {...field} id="title" label="Title" />}
                />
                {errors.title && <FormHelperText>{errors.title.message}</FormHelperText>}
              </FormControl>
            </Grid>
            {/* Description Field */}
            <Grid item xs={9}>
              <InputLabel>Description</InputLabel>
              <FormControl fullWidth error={Boolean(errors.description)}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <CustomEditor
                      data={editorContent}
                      onChange={(data) => {
                        setEditorContent(data); // Update local editor state
                        setValue('description', data); // Update react-hook-form state
                      }}
                    />
                  )}
                />
                {errors.description && <FormHelperText>{errors.description.message}</FormHelperText>}
              </FormControl>
            </Grid>
            {/* Action Buttons */}
            <Grid item xs={12} container spacing={2} justifyContent="flex-end">
              <Grid item>
                <Button type="submit" variant="contained" disabled={loading} className="common-button">
                  Save
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => {
                    router.push('/dashboard/expertise');
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
              </Grid>
            </Grid>
            {/* Loader */}
            {loading && (
              <Grid item xs={12}>
                <CustomLoader />
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>
      <ToastContainer />
    </Card>
  );
}
