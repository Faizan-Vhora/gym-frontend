'use client';

import * as React from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Box, Button, Card, Typography } from '@mui/material';

import axiosInstance from '@/lib/axios'; // Adjust import if needed

interface CmsSectionProps {
  title: string;
  content: string;
  onSave: (newContent: string) => void;
}

function CmsSection({ title, content, onSave }: CmsSectionProps): React.JSX.Element {
  const [editableContent, setEditableContent] = React.useState(content);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (!isEditing) {
      setEditableContent(content); // Update editableContent when content changes
    }
  }, [content, isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onSave(editableContent);
    setIsEditing(false);
  };

  return (
    <Card sx={{ marginBottom: 2, padding: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {isEditing ? (
        <Box sx={{ marginTop: 2 }}>
          <CKEditor
            editor={ClassicEditor}
            data={editableContent}
            onChange={(event, editor) => {
              const data = editor.getData();
              setEditableContent(data);
            }}
            config={{
              toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'],
            }}
          />
          <Box sx={{ marginTop: 2 }}>
            <Button className="common-button" variant="contained" color="error" onClick={handleSaveClick}>
              Save
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography sx={{ marginTop: 2 }}>{content}</Typography>
      )}
      {!isEditing && (
        <Box sx={{ marginTop: 2 }}>
          <Button className="common-button" variant="contained" color="error" onClick={handleEditClick}>
            Edit
          </Button>
        </Box>
      )}
    </Card>
  );
}

export function CmsPage(): React.JSX.Element {
  const [aboutUsContent, setAboutUsContent] = React.useState<string>('');
  const [termsContent, setTermsContent] = React.useState<string>('');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/cms'); // Adjust endpoint if needed
        const items = response.data.data.items;
        const aboutUsItem = items.find((item: any) => item.title === 'About Us');
        const termsItem = items.find((item: any) => item.title === 'Terms and Conditions');

        if (aboutUsItem) {
          setAboutUsContent(aboutUsItem.text);
        }
        if (termsItem) {
          setTermsContent(termsItem.text);
        }
      } catch (error) {
        console.error('Failed to fetch CMS content:', error);
        // Handle error (e.g., set error state, show message, etc.)
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <CmsSection title="About Us" content={aboutUsContent} onSave={(newContent) => setAboutUsContent(newContent)} />
      <CmsSection
        title="Terms and Conditions"
        content={termsContent}
        onSave={(newContent) => setTermsContent(newContent)}
      />
      {/* Add more sections as needed */}
    </Box>
  );
}

export default CmsPage;
