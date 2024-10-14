'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, CardActions, Typography } from '@mui/material';
import omit from 'lodash/omit';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '@/lib/axios';

const CustomEditor = dynamic(() => import('@/components/ckeditor'), { ssr: false });

interface CmsData {
  title: string;
  text: string;
}

export default function EditPage(): React.JSX.Element {
  const [cmsData, setCmsData] = React.useState<CmsData>({} as CmsData);
  const [content, setContent] = React.useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const cmsId = searchParams.get('id');

  React.useEffect(() => {
    const fetchContent = async (): Promise<void> => {
      try {
        const response = await axiosInstance.get<{ data: CmsData }>(`/cms/${cmsId}`);
        const fetchedCmsData = response.data.data;
        if (fetchedCmsData) {
          setCmsData(fetchedCmsData);
          setContent(fetchedCmsData.text);
        } else {
          // Handle error gracefully
        }
      } catch (error) {
        // Handle error gracefully
      }
    };

    if (cmsId) {
      fetchContent()
        .then(() => {
          // Handle successful fetch if necessary
        })
        .catch((error: unknown) => {
          error instanceof Error ? error.message : 'An unexpected error occurred';
        });
    }
  }, [cmsId]);

  const handleSaveClick = async (): Promise<void> => {
    try {
      const updatedPayload = omit(cmsData, ['text']) as CmsData;
      updatedPayload.text = content;
      await axiosInstance.put(`/cms/${cmsId}`, updatedPayload);
      router.push('/dashboard/cms'); // Awaiting to ensure that routing is complete
    } catch (error) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit {cmsData.title}
      </Typography>
      <CustomEditor
        data={content}
        onChange={(data) => {
          setContent(data);
        }}
      />

      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Box sx={{ mt: 3 }}>
          <Button
            className="common-button"
            variant="contained"
            color="primary"
            onClick={async () => {
              await handleSaveClick();
            }}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              router.push('/dashboard/cms');
            }}
            sx={{
              borderColor: '#d0021b',
              color: '#d0021b',
              marginLeft: '15px',
              transform: 'skewX(-20deg)',
              '&:hover': {
                borderColor: 'darkred',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </CardActions>
      <ToastContainer />
    </Box>
  );
}
