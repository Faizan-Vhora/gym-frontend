import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'members', title: 'Members', href: paths.customers.customers, icon: 'users' },
  { key: 'trainers', title: 'Trainers', href: paths.trainers.trainers, icon: 'users' },
  
  { key: 'cms', title: 'CMS', href: paths.cms.cms, icon: 'user-circle-gear' },
  { key: 'faq', title: 'FAQ', href: paths.faq.faq, icon: 'chat-centered-dots' },
  { key: 'experties', title: 'Experties', href: paths.experties.experties, icon: 'user-check' },
  // { key: 'trainer-package', title: 'TrainerPacakge', href: paths.trainerPackage.trainerPackage, icon: 'currency-circle-dollar' },
  { key: 'discount', title: 'Discount', href: paths.discount.discount, icon: 'tag' },
  { key: 'contact-us', title: 'Contact Us', href: paths.contactus.contact_us, icon: 'headset' },
  // { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  // { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
