import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.dashboard, icon: 'chart-pie' },
  { key: 'members', title: 'Members', href: paths.customers.customers, icon: 'users' },
  { key: 'trainers', title: 'Trainers', href: paths.trainers.trainers, icon: 'users' },
  { key: 'membership-plan', title: 'Membership Plan', href: paths.membershipPlan.membershipPlan, icon: 'users' },
  { key: 'booking', title: 'Booking', href: paths.dashboard.booking, icon: 'money-wavy' },
  { key: 'check-in', title: 'CheckIn', href: paths.checkIn.checkIn, icon: 'clock-user' },
  // { key: 'services', title: 'Service Management', href: paths.services.services, icon: 'users' },
  { key: 'cms', title: 'CMS', href: paths.cms.cms, icon: 'user-circle-gear' },
  { key: 'faq', title: 'FAQ', href: paths.faq.faq, icon: 'chat-centered-dots' },
  { key: 'experties', title: 'Experties', href: paths.experties.experties, icon: 'user-check' },
  { key: 'discount', title: 'Discount', href: paths.discount.discount, icon: 'tag' },
  // { key: 'contact-us', title: 'Contact Us', href: paths.contactus.contact_us, icon: 'headset' },
  { key: 'support', title: 'Support', href: paths.support.supportList, icon: 'headset' },


  // {
  //   key: 'settings',
  //   title: 'Settings',
  //   icon: 'gear',
  //   items: [
  //     { key: 'settings:faq', title: 'FAQ', href: paths.faq.faq, icon: 'chat-centered-dots' },
  //     { key: 'settings:experties', title: 'Experties', href: paths.experties.experties, icon: 'user-check' },
  //     { key: 'customers:discount', title: 'Discount', href: paths.discount.discount, icon: 'tag' },
  //   ],
  // },

  // { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  // { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
