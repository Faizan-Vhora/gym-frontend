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
    <>
      <Typography style={{ fontFamily: '"Audiowide", sans-serif' }} variant="h5">
        {title}
      </Typography>
      <Card
        sx={{
          marginBottom: 5,
          padding: 10,
          position: 'relative',
          marginTop: 2,
          maxHeight: '300px', // Adjust the height as needed
          overflowY: 'scroll',
          // overflow:'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textWrap: 'wrap',
        }}
      >
        <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleEditClick}>
          <PencilSimple />
        </IconButton>
        <Box
          sx={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Card>
    </>
  );
};

export default CmsSection;
