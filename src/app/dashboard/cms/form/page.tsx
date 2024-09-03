'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Box, Button, CardActions, Typography } from '@mui/material';
import omit from 'lodash/omit';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '@/lib/axios';

interface CmsData {
  title: string;
  text: string;
  // add other relevant fields
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
          let errorMessage: string;
          if (typeof error === 'string') {
            errorMessage = error;
          } else {
            // Handle other types of errors, or set a generic message
            errorMessage = 'An unexpected error occurred';
          }
          // Convert the Error object to a string
          toast.error(errorMessage);
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
      // Handle error gracefully
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit {cmsData.title}
      </Typography>
      <div style={{ height: '400px' }}>
        <CKEditor
          editor={ClassicEditor}
          data={content}
          onChange={(event, editor) => {
            const data = editor.getData();
            setContent(data);
          }}
          config={{
            toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'],
          }}
        />
      </div>

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
    </Box>
  );
}
