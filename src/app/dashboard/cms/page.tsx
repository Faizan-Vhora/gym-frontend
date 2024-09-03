'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, IconButton, Typography } from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';

import axiosInstance from '@/lib/axios';

interface CmsItem {
  id: number;
  title: string;
  text: string;
}

interface CmsSectionProps {
  id: number;
  title: string;
  content: string;
}

function CmsSection({ id, title, content }: CmsSectionProps): React.JSX.Element {
  const router = useRouter();

  const handleEditClick = (): void => {
    router.push(`/dashboard/cms/form?id=${id}`);
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
    const fetchData = async (): Promise<void> => {
      try {
        const response = await axiosInstance.get<{ data: { items: CmsItem[] } }>('/cms');
        const items = response.data.data.items;
        const aboutUsItem = items.find((item) => item.title === 'About Us');
        const termsItem = items.find((item) => item.title === 'Terms and Conditions');

        if (aboutUsItem) {
          setAboutUsContent(aboutUsItem.text);
          setAboutUsId(aboutUsItem.id);
        }
        if (termsItem) {
          setTermsContent(termsItem.text);
          setTermsId(termsItem.id);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          // console.error('Failed to fetch CMS content:', error);
        }
      }
    };

    void fetchData();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      {aboutUsId !== null && <CmsSection id={aboutUsId} title="About Us" content={aboutUsContent} />}
      {termsId !== null && <CmsSection id={termsId} title="Terms and Conditions" content={termsContent} />}
      {/* Add more sections as needed */}
    </Box>
  );
}
