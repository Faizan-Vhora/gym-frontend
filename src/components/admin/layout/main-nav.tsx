'use client';

import * as React from 'react';
import { NEXT_PUBLIC_PUSHER_KEY, NEXT_PUSHER_APP_CLUSTER, NEXT_PUSHER_CHANNEL, NEXT_PUSHER_EVENT } from '@/app-config';
import { Badge, Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { Bell } from '@phosphor-icons/react';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import Pusher from 'pusher-js';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { usePopover } from '@/hooks/use-popover';
import { NotificationEntry } from '@/components/admin/communication/notification-table';

import { MobileNav } from './mobile-nav';
import { NotificationsPopover } from './notification-popover';
import { UserPopover } from './user-popover';

// Define a type for the user object
interface User {
  profileImageUrl?: string;
  // Add other user properties if necessary
}

interface NotificationCountS {
  unreadCount: number;
}

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  // const [user, setUser] = React.useState<User | null>(null);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  const userPopover = usePopover<HTMLDivElement>();

  const notificationPopover = usePopover<HTMLDivElement>();

  const pusher = new Pusher(NEXT_PUBLIC_PUSHER_KEY, {
    cluster: NEXT_PUSHER_APP_CLUSTER,
  });

  const getNotificationListData = React.useCallback(async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<{ data: NotificationEntry[] }>('/notification/my/unread');
      const unreadCountForNotification = response.data.data.length;
      setUnreadCount(unreadCountForNotification);
    } catch (error) {
      await Swal.fire('Error!', 'Something went wrong.', 'error');
    }
  }, []);

  React.useEffect(() => {
    const channel = pusher.subscribe(NEXT_PUSHER_CHANNEL);

    channel.bind(NEXT_PUSHER_EVENT, () => {
      void getNotificationListData();
    });

    return () => {
      pusher.unsubscribe(NEXT_PUSHER_CHANNEL);
    };
  }, [unreadCount]);

  interface UserData {
    user: User;
  }

  interface NoticficationCount {
    notificationCount: NotificationCountS;
  }

  const userData = useSelector((data: UserData) => data);
  const notificationCount = useSelector((data: NoticficationCount) => data);

  React.useEffect(() => {
    // Retrieve user data from localStorage
    // const storedUser = localStorage.getItem('user');
    // const parsedUser = storedUser ? (JSON.parse(storedUser) as User) : null;
    // setUser(userData);

    void getNotificationListData();
  }, [unreadCount, userData]);

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title={'Notification'}>
              {unreadCount > 0 ? (
                <Badge badgeContent={notificationCount?.notificationCount?.unreadCount || unreadCount} color="error">
                  <IconButton onClick={notificationPopover.handleOpen}>
                    <Bell />
                  </IconButton>
                </Badge>
              ) : (
                <IconButton onClick={notificationPopover.handleOpen}>
                  <Bell />
                </IconButton>
              )}
            </Tooltip>

            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={userData.user?.profileImageUrl || '/assets/user-default.png'} // Use user image or fallback
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>

      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <NotificationsPopover
        anchorEl={notificationPopover.anchorRef.current}
        onClose={notificationPopover.handleClose}
        open={notificationPopover.open}
      />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
