"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ToastContainer } from 'react-toastify';
import { usePathname } from 'next/navigation'
import { MainNav } from '@/components/dashboard/layout/main-nav';
import { SideNav } from '@/components/dashboard/layout/side-nav';
import { config } from '@/config';
import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
}

const toTitleCase = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const currentPath : string = usePathname();
  const pageTitle = currentPath.split('/dashboard')[1].replaceAll('/', ' ').toUpperCase() || 'Page Title';
  const title = `${toTitleCase(pageTitle)} | ${config.site.name}`;

  const metadata = { title } satisfies Metadata;

  React.useEffect(() => {
    document.title = metadata.title; // Update document title
  }, [metadata.title]);

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
}
