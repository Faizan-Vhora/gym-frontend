'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
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
  onMarkAllAsRead?: () => void;
  onRemoveOne?: (id: string) => void;
  open?: boolean;
}

export function NotificationsPopover({
  anchorEl,
  onClose,
  onMarkAllAsRead,
  onRemoveOne,
  open = false,
}: NotificationsPopoverProps): React.JSX.Element {
  const [notifications, setNotifications] = React.useState<NotificationEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const getNotificationListData = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      //   const qParams = {
      //     page: page + 1,
      //     limit: rowsPerPage,
      //     search: searchTerm,
      //     userType: fromFilter !== 'All' ? fromFilter : null,
      //   };

      const response = await axiosInstance.get<{ data: NotificationEntry[] }>('/notification/my/unread');

      setNotifications(response.data.data);
    } catch (error) {
      await Swal.fire('Error!', 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '380px' } } }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="h6">Notifications</Typography>
        <Tooltip title="Mark all as read">
          <IconButton edge="end" onClick={onMarkAllAsRead}>
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
                onRemove={() => {
                  onRemoveOne?.(String(notification.id));
                }}
              />
            ))}
          </List>
        </Box>
      )}
    </Popover>
  );
}

interface NotificationItemProps {
  divider?: boolean;
  notification: NotificationEntry;
  onRemove?: () => void;
}

function NotificationItem({ divider, notification, onRemove }: NotificationItemProps): React.JSX.Element {
  return (
    <ListItem divider={divider} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <NotificationContent notification={notification} />
      <Tooltip title="Remove">
        <IconButton edge="end" onClick={onRemove} size="small">
          <XIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
}

interface NotificationContentProps {
  notification: NotificationEntry;
}

function NotificationContent({ notification }: NotificationContentProps): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Avatar>
        <ChatTextIcon fontSize="var(--Icon-fontSize)" />
      </Avatar>
      <div>
        <Typography variant="subtitle2">{notification?.title}</Typography>
        <Typography variant="body2">{notification?.message}</Typography>
        <Typography color="text.secondary" variant="caption">
          {dayjs(notification.createdAt).format('MMM D, hh:mm A')}
        </Typography>
      </div>
    </Stack>
  );
}

//   return <div />;
// }
