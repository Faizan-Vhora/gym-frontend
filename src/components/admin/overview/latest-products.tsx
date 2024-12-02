import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date-utils';
import { CustomLoader } from '@/utils/loader';
import { CardActions, Chip } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import dayjs from 'dayjs';

import axiosInstance from '@/lib/axios';

import { NoDataPlaceholder } from './no-data-placeholder';

export interface User {
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

export function IncompleteProfiles(): React.JSX.Element {
  const router = useRouter();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  interface IncompleteMemberResponse {
    id: number;
    fullName: string;
    email: string;
    profileImageUrl: string | '';
    createdAt: string;
    userType: number;
  }

  React.useEffect(() => {
    const fetchIncompleteProfiles = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ data: IncompleteMemberResponse[] }>(
          '/deshboard/incomplete-profiles'
        );

        const totalIncompleteMembersData = response.data.data;

        // Map the response to match the structure required by LatestProducts
        const mappedMembers = totalIncompleteMembersData.map((member) => ({
          id: member.id,
          name: member?.fullName,
          image: member?.profileImageUrl || '/assets/User@3x-1.png', // Provide default image if none exists
          createdAt: dayjs(member?.createdAt).format('MMM D, YYYY'), // Convert string to Date object
          userType: member?.userType,
        }));

        // Set the mapped data into products state
        setUsers(mappedMembers);
      } catch (error) {
        error instanceof Error ? error.message : 'An unexpected error occurred';
      } finally {
        setLoading(false);
      }
    };

    void fetchIncompleteProfiles();
  }, []);

  const handleRedirect = (id: number, userType: number) => {
    // Redirect to the member detail page with the specific member's id
    if (userType === 2) {
      router.push(`/admin/trainers/form?id=${id}`);
    } else if (userType === 3) {
      router.push(`/admin/customers/form?id=${id}`);
    }
  };

  return (
    <Card>
      <Card sx={{ height: '520px', overflowY: 'scroll' }}>
        <CardHeader style={{ fontFamily: '"Audiowide", sans-serif !important' }} title="Incomplete Profiles" />
        <Divider />
        <List>
          {users?.length === 0 ? (
            // <ListItem>
            //   <ListItemText
            //     primary={
            //       <Typography variant="body2" style={{ fontFamily: '"Audiowide", sans-serif' }} color="text.secondary">
            //         No Incomplete Profiles available
            //       </Typography>
            //     }
            //     sx={{ textAlign: 'center', width: '100%' }}
            //   />
            // </ListItem>
            <ListItem sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10%' }}>
              <NoDataPlaceholder sx={{}} />
            </ListItem>
          ) : (
            users?.map((product, index) => (
              <ListItem
                divider={index < users?.length - 1}
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
                  secondary={`Created ${formatDate(product.createdAt)}`}
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
        {loading && <CustomLoader />}
      </Card>
      <Divider />

      <CardActions sx={{ justifyContent: 'flex-end' }}>
        {/* <Button
          color="inherit"
          style={{ fontFamily: '"Audiowide", sans-serif' }}
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          onClick={() => {
            router.push('/admin/customers');
          }}
        >
          Overview
        </Button>

        <Button
          color="inherit"
          style={{ fontFamily: '"Audiowide", sans-serif' }}
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          onClick={() => {
            router.push('/admin/customers');
          }}
        >
          Overview
        </Button> */}
      </CardActions>
    </Card>
  );
}
