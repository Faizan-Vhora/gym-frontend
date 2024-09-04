// CmsPage.tsx
'use client';

import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';

import axiosInstance from '@/lib/axios';
import CmsSection from '@/components/dashboard/cms/cms-section'; // Adjust the path as needed

interface CmsItem {
  id: number;
  title: string;
  text: string;
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
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">CMS Management</Typography>
        </Stack>
      </Stack>
      <Box sx={{ padding: 4 }}>
        {aboutUsId !== null && <CmsSection id={aboutUsId} title="About Us" content={aboutUsContent} />}
        {termsId !== null && <CmsSection id={termsId} title="Terms and Conditions" content={termsContent} />}
        {/* Add more sections as needed */}
      </Box>
    </Stack>
  );
}
