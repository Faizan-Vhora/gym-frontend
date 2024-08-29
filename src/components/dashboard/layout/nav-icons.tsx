import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { ChatCenteredDots } from '@phosphor-icons/react/dist/ssr/ChatCenteredDots';
import { CurrencyCircleDollar } from '@phosphor-icons/react/dist/ssr/CurrencyCircleDollar';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { Headset } from '@phosphor-icons/react/dist/ssr/Headset';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { Tag } from '@phosphor-icons/react/dist/ssr/Tag';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UserCheck } from '@phosphor-icons/react/dist/ssr/UserCheck';
import { UserCircleGear } from '@phosphor-icons/react/dist/ssr/UserCircleGear';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'chat-centered-dots': ChatCenteredDots,
  'user-circle-gear': UserCircleGear,
  'user-check': UserCheck,
  'currency-circle-dollar': CurrencyCircleDollar,
  tag: Tag,
  headset: Headset,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
