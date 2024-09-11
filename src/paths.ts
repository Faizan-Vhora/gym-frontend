export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  faq: {
    faq: '/dashboard/faq',
    faqForm: (id?: number) => id ? `/dashboard/faq/form?id=${id}` : '/dashboard/faq/form',
  },
  contactus: {
    contact_us: '/dashboard/contact-us',
  },
  discount:{
    discount: '/dashboard/discount',
    discountForm: (id?: number) => id ? `/dashboard/discount/form?id=${id}` : '/dashboard/discount/form',
  },
  cms: {
    cms: '/dashboard/cms',
    cmsEditPage: (id?: number) => `/dashboard/cms/form?id=${id}`,
  },
  experties: {
    experties: '/dashboard/expertise',
    expertiesForm: (id?: number) => id ? `/dashboard/expertise/form/${id}` : '/dashboard/expertise/form',
  },

  customers: {
    customers: '/dashboard/customers',
    customersForm: (id?: number) => `/dashboard/customers/form/${id}`,
  },

  trainers: {
    trainers: '/dashboard/trainers',
    trainersForm: (id?: number) => `/dashboard/trainers/form/${id}`
  },

  dashboard: {
    dashboard: '/dashboard',
    account: '/dashboard/account',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings'
  },
  errors: {
    notFound: '/errors/not-found',
  },
} as const;
