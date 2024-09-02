'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Box, Button, CardActions, Typography } from '@mui/material';
import { omit } from 'lodash';

import axiosInstance from '@/lib/axios';

export default function EditPage() {
  const [cmsData, setCmsData] = React.useState<any>({});
  const [content, setContent] = React.useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const cmsId = searchParams.get('id');

  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axiosInstance.get(`/cms/${cmsId}`);
        let cmsData = response?.data?.data;
        if (cmsData) {
          setCmsData(cmsData);
          setContent(cmsData.text);
        } else {
          console.error('Failed to fetch content:');
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      }
    };

    if (cmsId) {
      fetchContent();
    }
  }, [cmsId]);

  const handleSaveClick = async () => {
    try {
      const updatedPayload = omit(cmsData, ['text']); // Remove 'text' key from cmsData
      updatedPayload.text = content; // Add the updated content
      await axiosInstance.put(`/cms/${cmsId}`, updatedPayload);
      router.push('/dashboard/cms'); // Redirect back after saving
    } catch (error) {
      console.error('Failed to save content:', error);
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
          <Button className="common-button" variant="contained" color="primary" onClick={handleSaveClick}>
            Save Changes
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard/cms')}
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
