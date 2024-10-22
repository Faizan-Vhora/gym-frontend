export const paths = {
  home: '/',

  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  dashboard: {
    dashboard: '/admin/dashboard',
    account: '/admin/account',
    calendar: '/admin/calendar',
    changePassword: '/admin/change-password',
    integrations: '/admin/integrations',
    settings: '/admin/settings'
  },

  faq: {
    faq: '/admin/faq',
    faqForm: (id?: number) => id ? `/admin/faq/form?id=${id}` : '/admin/faq/form',
  },

  discount:{
    discount: '/admin/discount',
    discountForm: (id?: number) => id ? `/admin/discount/form?id=${id}` : '/admin/discount/form',
  },
  cms: {
    cms: '/admin/cms',
    cmsForm: (id?: number) => `/admin/cms/form?id=${id}`,
  },
  experties: {
    experties: '/admin/expertise',
    expertiesForm: (id?: number) => id ? `/admin/expertise/form/${id}` : '/admin/expertise/form',
  },

  customers: {
    customers: '/admin/customers',
    customersForm: (id?: number) => `/admin/customers/form/${id}`,
  },


  trainers: {
    trainers: '/admin/trainers',
    trainersForm: (id?: number) => `/admin/trainers/form/${id}`
  },

  membershipPlan: {
    membershipPlan: '/admin/membership-plan',
    PlanForm: (id?: number) => `/admin/membership-plan/form/${id}`
  },


  support: {
    supportList: '/admin/support',
  },

  checkIn: {
    checkIn: '/admin/check-in',
    CheckInForm: (id?: number) => `/admin/check-in/form/${id}`
  },
  // services: {
  //   services: '/admin/services',
  //   ServicesForm: (id?: number) => `/admin/services/form/${id}`
  // },

  bookings: {
    bookingsList: '/admin/bookings',
    bookingsView: (id?: number) => `/admin/bookings/view/${id}`,
  },

  notification: {
    notificationList: '/admin/notification',

  },

  errors: {
    notFound: '/errors/not-found',
  },
} as const;
