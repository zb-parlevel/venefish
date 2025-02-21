type SubscriptionPlan = {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualTotal: number;
  features: string[];
  stripePriceId: {
    monthly: string | null;
    annual: string | null;
  };
};

export const SUBSCRIPTION_PLANS: Record<'core' | 'premium' | 'enterprise', SubscriptionPlan> = {
  core: {
    name: 'Basic Core',
    description: 'For companies getting started with PAR level MetaStudio',
    monthlyPrice: 0,
    annualPrice: 0,
    annualTotal: 0,
    features: [
      '10GB storage',
      '10GB Video/Audio traffic',
      'Unlimited users',
      'MetaStudio including:',
      'AI Agent (coming soon)',
      'Calendar planner',
      'Contacts',
      'Document drive',
      'Inbox',
      'Task tracker',
      'Team chat',
      'Virtual office'
    ],
    stripePriceId: {
      monthly: null,
      annual: null
    }
  },
  premium: {
    name: 'Premium Core',
    description: 'Perfect for growing companies wanting to be in more control',
    monthlyPrice: 124.99,
    annualPrice: 99.99,
    annualTotal: 1199.88,
    features: [
      '1TB storage',
      '500GB Video/Audio traffic',
      'Unlimited users',
      'All Basic Core features',
      'Premium including:',
      '3rd party integrations',
      'Advance analytics',
      'Custom domains',
      'Departmental workspaces',
      'Online support'
    ],
    stripePriceId: {
      monthly: 'price_1QuuwLBMiW8VqymP94tycekP',
      annual: 'price_1QuwbXBMiW8VqymPAniCdE1k'
    }
  },
  enterprise: {
    name: 'Enterprise Core',
    description: 'Perfect for companies wanting advanced security and support',
    monthlyPrice: 499.99,
    annualPrice: 399.99,
    annualTotal: 4799.88,
    features: [
      '10TB storage',
      '2TB Video/Audio traffic',
      'Unlimited users',
      'All Premium features',
      'Enterprise including:',
      '99.9% uptime',
      'Dedicated hardware',
      'Dedicated support',
      'E2E military grade encryption',
      'Federated SSO',
      'Identity and active directory protocol'
    ],
    stripePriceId: {
      monthly: 'price_1QuuwcBMiW8VqymPHT1zWr11',
      annual: 'price_1QuwdhBMiW8VqymPRynmaPc9'
    }
  }
} as const;
