import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Barbell as BarbellIcon } from '@phosphor-icons/react/dist/ssr/Barbell';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { CalendarCheck as CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { ChartLine as ChartLineIcon } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { ChatCenteredDots as ChatCenteredDotsIcon } from '@phosphor-icons/react/dist/ssr/ChatCenteredDots';
import { ChatsCircle as ChatsCircleIcon } from '@phosphor-icons/react/dist/ssr/ChatsCircle';
import { ClockUser as ClockUserIcon } from '@phosphor-icons/react/dist/ssr/ClockUser';
import { CrownSimple as CrownSimpleIcon } from '@phosphor-icons/react/dist/ssr/CrownSimple';
import { Gear as GearIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { Headset as HeadsetIcon } from '@phosphor-icons/react/dist/ssr/Headset';
import { MoneyWavy as MoneyWavyIcon } from '@phosphor-icons/react/dist/ssr/MoneyWavy';
import { Notepad as NotepadIcon } from '@phosphor-icons/react/dist/ssr/Notepad';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { SketchLogo as SketchLogoIcon } from '@phosphor-icons/react/dist/ssr/SketchLogo';
import { Tag as TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';
import { TextAlignLeft as TextAlignLeftIcon } from '@phosphor-icons/react/dist/ssr/TextAlignLeft';
import { Translate as TranslateIcon } from '@phosphor-icons/react/dist/ssr/Translate';
import { Truck as TruckIcon } from '@phosphor-icons/react/dist/ssr/Truck';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { UserCheck as UserCheckIcon } from '@phosphor-icons/react/dist/ssr/UserCheck';
import { UserCircleGear as UserCircleGearIcon } from '@phosphor-icons/react/dist/ssr/UserCircleGear';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

export const navIcons = {
  'calendar-check': CalendarCheckIcon,
  'chart-pie': ChartPieIcon,
  'chats-circle': ChatsCircleIcon,
  'chart-line': ChartLineIcon,
  'sign-out': SignOutIcon,
  'text-align-left': TextAlignLeftIcon,
  diamond: SketchLogoIcon,
  'money-wavy': MoneyWavyIcon,
  'clock-user': ClockUserIcon,
  'chat-centered-dots': ChatCenteredDotsIcon,
  'crown-simple': CrownSimpleIcon,
  tag: TagIcon,
  bell: BellIcon,
  'user-check': UserCheckIcon,
  'user-circle-gear': UserCircleGearIcon,
  barbell: BarbellIcon,
  notepad: NotepadIcon,
  headset: HeadsetIcon,
  gear: GearIcon,
  translate: TranslateIcon,
  truck: TruckIcon,
  upload: UploadIcon,
  users: UsersIcon,
} as Record<string, Icon>;
