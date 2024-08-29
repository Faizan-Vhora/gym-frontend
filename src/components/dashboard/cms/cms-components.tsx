import * as React from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Box, Button, Card, Divider, Typography } from '@mui/material';

interface CmsPageProps {
  aboutUs: string;
  termsAndConditions: string;
  onUpdateAboutUs: (value: string) => void;
  onUpdateTermsAndConditions: (value: string) => void;
}

export function CmsPage({
  aboutUs,
  termsAndConditions,
  onUpdateAboutUs,
  onUpdateTermsAndConditions,
}: CmsPageProps): React.JSX.Element {
  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Us
        </Typography>
        <CKEditor
          editor={ClassicEditor}
          data={aboutUs}
          onChange={(event, editor) => {
            const data = editor.getData();
            onUpdateAboutUs(data);
          }}
          config={{
            toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'],
          }}
        />
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Terms and Conditions
        </Typography>
        <CKEditor
          editor={ClassicEditor}
          data={termsAndConditions}
          onChange={(event, editor) => {
            const data = editor.getData();
            onUpdateTermsAndConditions(data);
          }}
          config={{
            toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'],
          }}
        />
        <Box sx={{ mt: 3 }}>
          <Button className="common-button" variant="contained" color="primary" fullWidth>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
