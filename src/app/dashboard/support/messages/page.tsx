'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatUtcToLocalDatetime } from '@/utils/date-utils';
import { CustomLoader } from '@/utils/loader';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  Grid,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

import axiosInstance from '@/lib/axios';
import type { SupportEntry, SupportTicketMessageEntry } from '@/components/dashboard/support/support-table';

// Dynamically import the CKEditor
const CustomEditor = dynamic(() => import('@/components/ckeditor'), { ssr: false });

export interface SupportTicketMessagePayloadDataI {
  message: string;
}

// Define validation schemas
const supportSchema = z.object({
  ticketMessage: z.string().optional(), // Message validation
});

type SupportTicketMessageInputs = z.infer<typeof supportSchema>;

export default function SupportForm(): React.JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [supportTicket, setSupportTicket] = useState<SupportEntry | null>(null);
  const [supportTicketMessages, setTicketMessages] = useState<SupportTicketMessageEntry[]>([]);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<SupportTicketMessageInputs>({
    resolver: zodResolver(supportSchema),
    mode: 'onBlur',
  });

  const [ticketMessage, setTicketMessage] = useState<string>(''); // Form fields
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportTicketMessages]);

  useEffect(() => {
    if (id) {
      void getTicketDetails();
      void getTicketMessages();
    }
  }, [id]);

  const getTicketDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<{ data: SupportEntry }>(`/support-ticket/${id}`);
      setSupportTicket(response.data.data);
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setLoading(false);
    }
  };

  const getTicketMessages = async () => {
    setLoading(true);
    const qParams = { pagination: false };
    try {
      const response = await axiosInstance.get<{ data: SupportTicketMessageEntry[] }>(`/support-ticket/${id}/message`, {
        params: qParams,
      });
      setTicketMessages(response.data.data);
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setLoading(false);
    }
  };

  // Manually handle CKEditor input change and trigger validation
  const handleEditorChange = async (data: string) => {
    setTicketMessage(data);
    setValue('ticketMessage', data, { shouldValidate: true });
    await trigger('ticketMessage');
  };

  const onSubmit = async (formData: SupportTicketMessageInputs): Promise<void> => {
    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const url = `/support-ticket/${id}/message`;
      const data: SupportTicketMessagePayloadDataI = { message: formData.ticketMessage || '' };

      await axiosInstance.post(url, data);
      toast.success('Support ticket message saved successfully');
      setTicketMessage('');
      await getTicketMessages();
    } catch (err: unknown) {
      err instanceof Error ? err.message : 'An unexpected error occurred';
      setError('Failed to save support ticket details.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (!supportTicket && id) {
    return <div>{loading && <CustomLoader />}</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
      <Card>
        <CardHeader
          style={{ fontFamily: '"Audiowide", sans-serif' }}
          sx={{ padding: '20px' }}
          title={`Support Ticket #${supportTicket?.id} - ${supportTicket?.user?.fullName}
            ${formatUtcToLocalDatetime(supportTicket?.createdAt || null)}`}
        />

        <CardContent>
          <Typography>{supportTicket?.subject}</Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            dangerouslySetInnerHTML={{ __html: supportTicket?.description || '' }}
          />

          {/* Old Messages in Card */}
          {supportTicketMessages?.length ? (
            <Card sx={{ mb: 5, height: '450px', overflowY: 'auto' }}>
              <CardHeader style={{ fontFamily: '"Audiowide", sans-serif' }} title="Messages" />
              <CardContent>
                <Grid container direction="column">
                  {supportTicketMessages.map((tMessage, index) => (
                    <Grid item key={index} xs={12}>
                      <Card sx={{ mb: 2, width: 'fit-content' }}>
                        <CardContent sx={{ padding: '10px 20px' }}>
                          <Typography variant="body2" color="textSecondary">
                            {tMessage.createdBy?.fullName} - {formatUtcToLocalDatetime(tMessage.createdAt)}
                          </Typography>
                          <Typography
                            sx={{ overflowWrap: 'anywhere' }}
                            dangerouslySetInnerHTML={{ __html: tMessage.message }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  <div ref={messagesEndRef} />
                </Grid>
              </CardContent>
            </Card>
          ) : null}

          {/* New Message Input */}
          <Card>
            <CardHeader
              style={{ fontFamily: '"Audiowide", sans-serif' }}
              sx={{ padding: '20px 20px 0px 26px' }}
              title="Reply"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ paddingTop: '0px' }}>
                  <FormControl fullWidth required error={Boolean(errors.ticketMessage)}>
                    <CustomEditor
                      customePlaceholder="Type your message here..."
                      data={ticketMessage}
                      onChange={handleEditorChange}
                    />
                    {errors.ticketMessage && (
                      <FormHelperText className="massge-input">{errors.ticketMessage.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button
                className="common-button"
                variant="contained"
                type="submit"
                sx={{ mr: 2 }}
                disabled={isSubmitting || ticketMessage.length === 0}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  router.push('/dashboard/support');
                }}
                sx={{
                  borderColor: '#d0021b',
                  color: '#d0021b',
                  '&:hover': {
                    borderColor: 'darkred',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  },
                }}
              >
                Back
              </Button>
            </CardActions>
          </Card>
        </CardContent>
      </Card>

      {loading && <CustomLoader />}
      {error && <Alert severity="error">{error}</Alert>}

      <ToastContainer />
    </Box>
  );
}
