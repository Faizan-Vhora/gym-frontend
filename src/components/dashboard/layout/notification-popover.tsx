'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CustomLoader } from '@/utils/loader';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ChatText as ChatTextIcon } from '@phosphor-icons/react/dist/ssr/ChatText';
import { EnvelopeSimple as EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import Swal from 'sweetalert2';

import axiosInstance from '@/lib/axios';
import { dayjs } from '@/lib/dayjs';
import { NotificationEntry } from '@/components/notification/notification-table';

export interface NotificationsPopoverProps {
  anchorEl: null | Element;
  onClose?: () => void;
  open?: boolean;
}

export function NotificationsPopover({
  anchorEl,
  onClose,

  open = false,
}: NotificationsPopoverProps): React.JSX.Element {
  const [notifications, setNotifications] = React.useState<NotificationEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const getNotificationListData = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<{ data: NotificationEntry[] }>('/notification/my/unread');

      setNotifications(response.data.data);
    } catch (error) {
      await Swal.fire('Error!', 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = async () => {
    try {
      // Call your API endpoint to mark all notifications as read
      await axiosInstance.patch('/notification/mark-all-read'); // Adjust the endpoint as needed
      await getNotificationListData(); // Refresh notifications after marking all as read
    } catch (error: unknown) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
      await Swal.fire('Error!', 'Failed to mark all notifications as read.', 'error'); // Error handling
    }
  };

  React.useEffect(() => {
    if (open) {
      void getNotificationListData();
    }
  }, [open]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '380px' } } }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="h6">Notifications</Typography>
        <Tooltip title="Mark all as read">
          <IconButton edge="end" onClick={markAllAsRead}>
            <EnvelopeSimpleIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {notifications.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2">There are no notifications</Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: '270px', overflowY: 'auto' }}>
          <List disablePadding>
            {notifications.map((notification, index) => (
              <NotificationItem
                divider={index < notifications.length - 1}
                key={notification.id}
                notification={notification}
                onRemove={getNotificationListData}
              />
            ))}
          </List>
          {loading && <CustomLoader />}
        </Box>
      )}
    </Popover>
  );
}

interface NotificationItemProps {
  divider?: boolean;
  notification: NotificationEntry;
  onRemove: () => void;
}

function NotificationItem({ divider, notification, onRemove }: NotificationItemProps): React.JSX.Element {
  const handleRemove = async () => {
    const payload = {
      isRead: true,
    };

    try {
      // Call your API endpoint to mark the notification as read
      await axiosInstance.patch(`/notification/${notification.id}`, payload); // Adjust the endpoint as needed
      // Call onRemove to remove the notification from the UI if API call is successful
      onRemove();
    } catch (error: unknown) {
      error instanceof Error ? error.message : 'An unexpected error occurred';
      await Swal.fire('Error!', 'Failed to mark notification as read.', 'error'); // Error handling
    }
  };
  return (
    <ListItem divider={divider} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <NotificationContent notification={notification} unread={handleRemove} />
      <Tooltip title="Remove">
        <IconButton edge="end" onClick={handleRemove} size="small">
          <XIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
}

interface NotificationContentProps {
  notification: NotificationEntry;
  unread: () => void;
}

function NotificationContent({ notification, unread }: NotificationContentProps): React.JSX.Element {
  const router = useRouter();
  return (
    <Stack className="Notification" direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Avatar>
        <ChatTextIcon fontSize="var(--Icon-fontSize)" />
      </Avatar>
      <div
        onClick={() => {
          router.push(notification?.redirectionPath);
          unread();
        }}
      >
        <Typography variant="subtitle2">{notification?.title}</Typography>
        <Typography variant="body2">{notification?.message}</Typography>
        <Typography color="text.secondary" variant="caption">
          {dayjs(notification.createdAt).format('MMM D, hh:mm A')}
        </Typography>
      </div>
    </Stack>
  );
}
