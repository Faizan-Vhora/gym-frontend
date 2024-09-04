import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, IconButton, Typography } from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';

interface CmsSectionProps {
  id: number;
  title: string;
  content: string;
}

const CmsSection: React.FC<CmsSectionProps> = ({ id, title, content }) => {
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
      <Box
        sx={{
          marginTop: 2,
          maxHeight: '100px', // Adjust the height as needed
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Card>
  );
};

export default CmsSection;
