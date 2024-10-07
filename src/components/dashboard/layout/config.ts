import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  // {
  //   key : 'group-0',
  //   items : [
      { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.dashboard, icon: 'chart-pie', items:[] },
      { key: 'members', title: 'Members', href: paths.customers.customers, icon: 'users', items:[] },
      { key: 'trainers', title: 'Trainers', href: paths.trainers.trainers, icon: 'users', items:[] },
      { key: 'booking', title: 'Booking', href: paths.dashboard.booking, icon: 'money-wavy', items:[] },
      { key: 'check-in', title: 'CheckIn', href: paths.checkIn.checkIn, icon: 'clock-user', items:[] },
      // { key: 'services', title: 'Service Management', href: paths.services.services, icon: 'users', items:[] },
      // { key: 'faq', title: 'FAQ', href: paths.faq.faq, icon: 'chat-centered-dots', items:[] },
      // { key: 'experties', title: 'Experties', href: paths.experties.experties, icon: 'user-check', items:[] },
      // { key: 'discount', title: 'Discount', href: paths.discount.discount, icon: 'tag', items:[] },
      // { key: 'contact-us', title: 'Contact Us', href: paths.contactus.contact_us, icon: 'headset', items:[] },
      { key: 'support', title: 'Support', href: paths.support.supportList, icon: 'headset', items:[] },


      {
        key: 'settings',
        title: 'Settings',
        icon: 'gear',
        items: [
          { key: 'settings:experties', title: 'Experties', href: paths.experties.experties, icon: 'user-check' },
          { key: 'membership-plan', title: 'Membership Plan', href: paths.membershipPlan.membershipPlan, icon: 'users', items:[] },
          { key: 'customers:discount', title: 'Discount', href: paths.discount.discount, icon: 'tag' },
          { key: 'settings:faq', title: 'FAQ', href: paths.faq.faq, icon: 'chat-centered-dots' },
          { key: 'cms', title: 'CMS', href: paths.cms.cms, icon: 'user-circle-gear', items:[] },
        ],
      },

      // { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
      // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
      // { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
      // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },

  //   ]
  // }

] satisfies NavItemConfig[];





