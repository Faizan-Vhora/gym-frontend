'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, IconButton, Typography } from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';

import axiosInstance from '@/lib/axios';

interface CmsSectionProps {
  id: number; // Add ID prop
  title: string;
  content: string;
  onSave: (newContent: string) => void;
}

function CmsSection({ id, title, content, onSave }: CmsSectionProps): React.JSX.Element {
  const [isEditing, setIsEditing] = React.useState(false);
  const router = useRouter();

  const handleEditClick = () => {
    router.push(`/dashboard/cms/form?id=${id}`); // Pass ID to the edit page
  };

  return (
    <Card sx={{ marginBottom: 2, padding: 2, position: 'relative' }}>
      <Typography variant="h6">{title}</Typography>
      <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleEditClick}>
        <PencilSimple />
      </IconButton>
      <Box sx={{ marginTop: 2 }}>
        <Typography>{content}</Typography>
      </Box>
    </Card>
  );
}

export default function CmsPage(): React.JSX.Element {
  const [aboutUsContent, setAboutUsContent] = React.useState<string>('');
  const [termsContent, setTermsContent] = React.useState<string>('');
  const [aboutUsId, setAboutUsId] = React.useState<number | null>(null);
  const [termsId, setTermsId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/cms'); // Adjust endpoint if needed
        const items = response.data.data.items;
        const aboutUsItem = items.find((item: any) => item.title === 'About Us');
        const termsItem = items.find((item: any) => item.title === 'Terms and Conditions');

        if (aboutUsItem) {
          setAboutUsContent(aboutUsItem.text);
          setAboutUsId(aboutUsItem.id); // Set ID for About Us
        }
        if (termsItem) {
          setTermsContent(termsItem.text);
          setTermsId(termsItem.id); // Set ID for Terms and Conditions
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
      {aboutUsId !== null && (
        <CmsSection
          id={aboutUsId}
          title="About Us"
          content={aboutUsContent}
          onSave={(newContent) => setAboutUsContent(newContent)}
        />
      )}
      {termsId !== null && (
        <CmsSection
          id={termsId}
          title="Terms and Conditions"
          content={termsContent}
          onSave={(newContent) => setTermsContent(newContent)}
        />
      )}
      {/* Add more sections as needed */}
    </Box>
  );
}
