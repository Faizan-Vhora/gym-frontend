import React from 'react';
import { useRouter } from 'next/navigation';
import { Chip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
// import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import type { SxProps } from '@mui/material/styles';
// import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
// import { DotsThreeVertical as DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import dayjs from 'dayjs';

export interface Product {
  id: number;
  image: string;
  name: string;
  createdAt: string;
  userType: number;
}

const userTypeStatus: Record<number, { label: string; color: 'warning' | 'success' }> = {
  2: { label: 'Trainer', color: 'warning' },
  3: { label: 'Member', color: 'success' },
};

export interface LatestProductsProps {
  products?: Product[];
  sx?: SxProps;
}

export function LatestProducts({ products = [], sx }: LatestProductsProps): React.JSX.Element {
  const router = useRouter();

  const handleRedirect = (id: number, userType: number) => {
    // Redirect to the member detail page with the specific member's id
    if (userType === 2) {
      router.push(`/dashboard/trainers/form?id=${id}`);
    } else if (userType === 3) {
      router.push(`/dashboard/customers/form?id=${id}`);
    }
  };

  return (
    <Card sx={{height:'520px',overflowY:'scroll'}}>
      <CardHeader title="Incomplete Profiles" />
      <Divider />
      <List>
        {products.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  No Incomplete Profiles available
                </Typography>
              }
              sx={{ textAlign: 'center', width: '100%' }}
            />
          </ListItem>
        ) : (
          products.map((product, index) => (
            <ListItem
              divider={index < products.length - 1}
              key={product.id}
              onClick={() => {
                handleRedirect(product.id, product.userType);
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemAvatar>
                {product.image ? (
                  <Box component="img" src={product.image} sx={{ borderRadius: 1, height: '48px', width: '48px' }} />
                ) : (
                  <Box
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'var(--mui-palette-neutral-200)',
                      height: '48px',
                      width: '48px',
                    }}
                  />
                )}
              </ListItemAvatar>
              <ListItemText
                primary={product.name}
                primaryTypographyProps={{ variant: 'subtitle1' }}
                secondary={`Created ${dayjs(product.createdAt).format('MMM D, YYYY')}`}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
              <Chip
                label={userTypeStatus[product.userType]?.label}
                color={userTypeStatus[product.userType]?.color}
                sx={{ ml: 2 }}
              />
            </ListItem>
          ))
        )}
      </List>
      {/* <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </CardActions> */}
    </Card>
  );
}
