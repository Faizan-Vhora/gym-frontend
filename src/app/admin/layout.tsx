'use client';

import * as React from 'react';
import { Metadata } from 'next';
import { usePathname, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ToastContainer } from 'react-toastify';

import { config } from '@/config';
import { MainNav } from '@/components/admin/layout/main-nav';
import { SideNav } from '@/components/admin/layout/side-nav';
import PushNotificationComponent from './push-notification/PushNotificationComponent';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const pathToPageTitle = (currentPath: string): string => {
  const segments = currentPath.split('/admin')[1]?.split('/').filter(Boolean) || [];

  const capitalizeWords = (str: string): string => {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return segments.map((segment) => capitalizeWords(segment)).join(' | ');
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const searchParams = useSearchParams();
  const currentPath = usePathname();

  const updatedPath = currentPath.replace('form', searchParams.get('id') ? 'edit' : 'add');
  const pageTitle = pathToPageTitle(updatedPath) || null;
  const title = pageTitle ? `${pageTitle} | ${config.site.name}` : config.site.name;
  const metadata = { title } satisfies Metadata;

  React.useEffect(() => {
    document.title = metadata.title; // Update document title
  }, [metadata.title]); // Depend on title only

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--MainNav-zIndex': 1000,
            '--SideNav-width': '280px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />
      <PushNotificationComponent />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        <SideNav />
        <Box
          className="dashboard"
          sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}
        >
          <MainNav />
          <main>
            <Container maxWidth="xl" sx={{ py: '64px' }}>
              {children}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </Container>
          </main>
        </Box>
      </Box>
    </>
  );
};

export default AdminLayout;
