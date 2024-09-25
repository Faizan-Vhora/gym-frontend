'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import axiosInstance from '@/lib/axios';
import { dayjs } from '@/lib/dayjs';
import { logger } from '@/lib/default-logger';
import { Option } from '@/components/core/option';
import { toast } from '@/components/core/toaster';

import { Customer } from '../customer/customers-table';
import { Trainer } from '../trainer/trainer-table';
import type { Event, EventPriority } from './types';

export interface EventCreateParams {
  trainer: string;
  customer: string;
  allDay: boolean;
  start: Date;
  end: Date;
  priority?: EventPriority;
}

export interface EventUpdateParams {
  trainer?: string;
  customer?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  priority?: EventPriority;
}

const schema = zod
  .object({
    trainer: zod.string().min(1, 'Trainer is required').max(255),
    customer: zod.string().min(1, 'Member is required').max(5000),
    start: zod.date(),
    end: zod.date(),
    allDay: zod.boolean(),
    priority: zod.string().max(255).optional(),
  })
  .refine((data) => data.start < data.end, { message: 'End date should be greater than start date', path: ['end'] });

type Values = zod.infer<typeof schema>;

function getDefaultValues({ event, range }: { event?: Event; range?: { start: Date; end: Date } }): Values {
  if (event) {
    return {
      trainer: event.trainer ?? '',
      customer: event.customer ?? '',
      start: event.start ? event.start : new Date(),
      end: event.end ? event.end : dayjs().add(30, 'minute').toDate(),
      allDay: event.allDay ?? false,
      priority: event.priority ?? 'low',
    };
  }

  if (range) {
    return { trainer: '', customer: '', start: range.start, end: range.end, allDay: false, priority: 'low' };
  }

  return {
    trainer: '',
    customer: '',
    start: new Date(),
    end: dayjs().add(30, 'minute').toDate(),
    allDay: false,
    priority: 'low',
  };
}

export interface EventDialogProps {
  action: 'create' | 'update';
  event?: Event;
  onClose?: () => void;
  onCreate?: (params: EventCreateParams) => void;
  onDelete?: (eventId: string) => void;
  onUpdate?: (eventId: string, params: EventUpdateParams) => void;
  open?: boolean;
  range?: { start: Date; end: Date };
}

export function EventDialog({
  action = 'create',
  event,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
  open = false,
  range,
}: EventDialogProps): React.JSX.Element {
  const [trainers, setTrainers] = React.useState<Trainer[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ defaultValues: getDefaultValues({ event, range }), resolver: zodResolver(schema) });

  interface ErrorDetail {
    code?: string;
    message?: string;
    // Add other fields if your API returns additional error details
  }

  interface TrainerResponseData {
    data: {
      items: Trainer[];
      meta: {
        totalItems: number;
      };
    };
    errors?: ErrorDetail;
  }

  const fetchTrainers = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // Define request parameters
      const params = {
        userType: 2, // Assuming userType 2 corresponds to trainers
      };

      // Perform the API call
      const response = await axiosInstance.get<TrainerResponseData>('/users', { params });

      // Access and handle response data
      const { items, meta } = response.data.data;
      if (Array.isArray(items)) {
        setTrainers(items); // `items` is of type `Trainer[]`
      } else {
        toast.error(
          `Unexpected response data format: ${response.data.errors ? JSON.stringify(response.data.errors) : 'No errors available'}`
        );
        setError('Unexpected data format.');
      }
    } catch (err) {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching trainers: ${err.message}`;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies for memoization

  React.useEffect(() => {
    const loadTrainers = async (): Promise<void> => {
      try {
        await fetchTrainers();
      } catch (err: unknown) {
        let errorMessage = 'Failed to load data.';
        if (err instanceof Error) {
          errorMessage = `Error fetching Trainers: ${err.message}`;
        }
        toast.error(errorMessage);
      }
    };

    // Immediately invoke the async function and handle the promise
    loadTrainers().catch((err: unknown) => {
      let errorMessage = 'Failed to load data.';
      if (err instanceof Error) {
        errorMessage = `Error fetching Trainers: ${err.message}`;
      }
      toast.error(errorMessage);
    });
  }, [fetchTrainers]);

  interface CustomerResponse {
    data: {
      items: Customer[];
      meta: { totalItems: number };
    };
  }

  const fetchCustomers = React.useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<CustomerResponse>('/users', {
        params: {
          userType: 3,
        },
      });
      setCustomers(response.data.data.items);
    } catch (error) {
      // Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to fetch customers: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []); // Include membershipFilter here

  React.useEffect(() => {
    // Define an async function and invoke it
    const loadCustomers = async (): Promise<void> => {
      try {
        await fetchCustomers();
      } catch (error: unknown) {
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else {
          // Handle other types of errors, or set a generic message
          errorMessage = 'An unexpected error occurred';
        }
        // Convert the Error object to a string
        toast.error(errorMessage);
      }
    };

    void loadCustomers();
  }, [fetchCustomers]);

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      try {
        const params = {
          trainer: values.trainer,
          customer: values.customer,
          end: values.end,
          start: values.start,
          allDay: values.allDay,
          priority: values.priority as EventPriority,
        } satisfies EventCreateParams | EventUpdateParams;

        if (action === 'update') {
          onUpdate?.(event!.id, params);
        } else {
          onCreate?.(params);
        }
      } catch (err) {
        logger.error(err);
        toast.error('Something went wrong!');
      }
    },
    [action, event, onCreate, onUpdate]
  );

  React.useEffect(() => {
    // Reset form when dialog data changes
    reset(getDefaultValues({ event, range }));
  }, [event, range, reset]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ p: 3 }}>
          <Typography sx={{ textAlign: 'center' }} variant="h5">
            {event ? 'Edit Booking' : 'Add Booking'}
          </Typography>
        </Box>
        <Stack spacing={2} sx={{ p: 3 }}>
          <Controller
            control={control}
            name="customer"
            render={({ field }) => (
              <FormControl error={Boolean(errors.customer)} fullWidth>
                <InputLabel required>Member</InputLabel>
                <Select {...field} label="Member" disabled={loading}>
                  <Option value="">
                    <em>Select a Member</em>
                  </Option>
                  {/* Dynamically render trainer names */}
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.fullName}
                    </Option>
                  ))}
                </Select>
                {errors.customer ? <FormHelperText>{errors.customer.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="trainer"
            render={({ field }) => (
              <FormControl error={Boolean(errors.trainer)} fullWidth>
                <InputLabel required>Trainer</InputLabel>
                <Select {...field} label="Trainer" disabled={loading}>
                  <Option value="">
                    <em>Select a Trainer</em>
                  </Option>
                  {/* Dynamically render trainer names */}
                  {trainers.map((trainer) => (
                    <Option key={trainer.id} value={trainer.id}>
                      {trainer.fullName}
                    </Option>
                  ))}
                </Select>
                {errors.trainer ? <FormHelperText>{errors.trainer.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="allDay"
            render={({ field }) => (
              <div>
                <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="All day" />
                {errors.allDay ? <FormHelperText error>{errors.allDay.message}</FormHelperText> : null}
              </div>
            )}
          />
          <Controller
            control={control}
            name="start"
            render={({ field }) => (
              <DateTimePicker
                format="MMM D, YYYY hh:mm A"
                label="Start date"
                onChange={(date) => {
                  field.onChange(date ? date.toDate() : null);
                }}
                slotProps={{ textField: { error: Boolean(errors.start), helperText: errors.start?.message } }}
                value={dayjs(field.value)}
              />
            )}
          />
          <Controller
            control={control}
            name="end"
            render={({ field }) => (
              <DateTimePicker
                format="MMM D, YYYY hh:mm A"
                label="End date"
                onChange={(date) => {
                  field.onChange(date ? date.toDate() : null);
                }}
                slotProps={{ textField: { error: Boolean(errors.end), helperText: errors.end?.message } }}
                value={dayjs(field.value)}
              />
            )}
          />
        </Stack>
        <Divider />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          {action === 'update' ? (
            <IconButton
              color="error"
              onClick={() => {
                onDelete?.(event!.id);
              }}
            >
              <TrashIcon />
            </IconButton>
          ) : (
            <div />
          )}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Confirm
            </Button>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
}
