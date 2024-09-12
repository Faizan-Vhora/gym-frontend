import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import { ChangePasswordForm } from '@/components/dashboard/change-password/change-password';

export const metadata = { title: `Change Password | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function ChangePasswordPage(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid lg={10} md={12} xs={12}>
          <ChangePasswordForm />
        </Grid>
      </Grid>
    </Stack>
  );
}
