module.exports = {
  ROLES: {
    USER: 'user',
    CELEBRITY: 'celebrity',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },
  
  LOGIN_METHODS: {
    OTP: 'otp',
    PASSWORD: 'password',
    BOTH: 'both'
  },
  
  OTP_TYPES: {
    LOGIN: 'login',
    REGISTER: 'register',
    PASSWORD_RESET: 'password_reset',
    VERIFY_PHONE: 'verify_phone',
    VERIFY_EMAIL: 'verify_email'
  },
  
  VERIFICATION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended'
  },
  
  ADDRESS_VERIFICATION_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
  },
  
  AVAILABILITY_STATUS: {
    AVAILABLE: 'available',
    BUSY: 'busy',
    ON_LEAVE: 'on_leave',
    NOT_AVAILABLE: 'not_available'
  },
  
  EVENT_TYPES: {
    APPEARANCE: 'appearance',
    LIVE_PERFORMANCE: 'live_performance',
    CORPORATE_EVENT: 'corporate_event',
    PRIVATE_EVENT: 'private_event',
    VIRTUAL_APPEARANCE: 'virtual_appearance',
    PROMOTION: 'promotion'
  },
  
  GALLERY_EVENT_TYPES: {
    APPEARANCE: 'appearance',
    PERFORMANCE: 'performance',
    HOSTING: 'hosting',
    AWARD_SHOW: 'award_show',
    CHARITY: 'charity',
    CORPORATE: 'corporate',
    PRIVATE: 'private',
    VIRTUAL: 'virtual',
    CONCERT: 'concert',
    FESTIVAL: 'festival',
    OTHER: 'other'
  },
  
  GALLERY_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },
  
  MEDIA_TYPES: {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document',
    LINK: 'link'
  },
  
  BOOKING_STATUS: {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    PAYMENT_PENDING: 'payment_pending',
    PAYMENT_COMPLETED: 'payment_completed',
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    PAYMENT_HELD: 'payment_held',
    PAYMENT_RELEASED: 'payment_released',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
  },
  
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    HELD: 'held',
    RELEASED: 'released'
  },
  
  PAYMENT_METHODS: {
    CARD: 'card',
    UPI: 'upi',
    NET_BANKING: 'net_banking',
    WALLET: 'wallet'
  },
  
  TRANSACTION_TYPES: {
    CREDIT: 'credit',
    DEBIT: 'debit'
  },
  
  TRANSACTION_CATEGORIES: {
    BOOKING_PAYMENT: 'booking_payment',
    COMMISSION: 'commission',
    REFUND: 'refund',
    ESCROW_HOLD: 'escrow_hold',
    ESCROW_RELEASE: 'escrow_release',
    PLATFORM_FEE: 'platform_fee',
    BONUS: 'bonus'
  },
  
  NOTIFICATION_TYPES: {
    BOOKING: 'booking',
    PAYMENT: 'payment',
    SYSTEM: 'system',
    PROMOTIONAL: 'promotional',
    REMINDER: 'reminder'
  },
  
  DISPUTE_STATUS: {
    OPEN: 'open',
    UNDER_REVIEW: 'under_review',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
  },
  
  DISPUTE_TYPES: {
    PAYMENT: 'payment',
    DELIVERY: 'delivery',
    QUALITY: 'quality',
    OTHER: 'other'
  }
};
