const pageConfig = document.body.dataset;
const forcedEnvironment = pageConfig.paddleEnvironment;
const environment = forcedEnvironment === 'sandbox'
  ? 'sandbox'
  : import.meta.env.VITE_PADDLE_ENV === 'production'
  ? 'production'
  : 'sandbox';

const isSandbox = environment === 'sandbox';
const token = isSandbox
  ? import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN
  : import.meta.env.VITE_PADDLE_PRODUCTION_CLIENT_TOKEN;

const placeholderTokens = new Set([
  'test_SANDBOX_CLIENT_TOKEN',
  'test_REPLACE_WITH_SANDBOX_CLIENT_TOKEN',
  'live_PRODUCTION_CLIENT_TOKEN',
]);

const sandboxPrices = {
  monthly: 'pri_01krsey3ptt24yhcks5djyqwc9',
  annual: 'pri_01krn3nvmqw7s44xzcmk85er6k',
  lifetime: 'pri_01krsezegwmg4zk362219e3n2e',
};

const configuredPrices = {
  monthly: import.meta.env.VITE_PADDLE_PRICE_MONTHLY || sandboxPrices.monthly,
  annual: import.meta.env.VITE_PADDLE_PRICE_ANNUAL || sandboxPrices.annual,
  lifetime: import.meta.env.VITE_PADDLE_PRICE_LIFETIME || sandboxPrices.lifetime,
};
const lifetimeDiscountCode = import.meta.env.VITE_PADDLE_LIFETIME_DISCOUNT_CODE || 'launch';

const params = new URLSearchParams(window.location.search);
const title = document.querySelector('#checkout-title');
const message = document.querySelector('#checkout-message');
const hasPaddleTransaction = params.has('_ptxn');
const checkoutDisabled = pageConfig.checkoutDisabled === 'true'
  && pageConfig.sandboxCheckout !== 'true'
  && !hasPaddleTransaction;

if (checkoutDisabled) {
  const releaseDate = pageConfig.releaseDate || 'July 11, 2026';
  setPaymentCopy(
    `Official release on ${releaseDate}`,
    'Public checkout is temporarily closed while we finish the app. For sandbox testing, use the sandbox checkout page.'
  );
} else if (!window.Paddle) {
  console.warn('Paddle.js did not load. Check the browser connection and content-security policy.');
  setPaymentCopy('Checkout could not load', 'Refresh this page, or email hello@meerkatta.com and we will help.');
} else if (!token || placeholderTokens.has(token)) {
  console.warn(`Missing ${environment} Paddle client-side token.`);
  setPaymentCopy('Checkout is not configured', 'Email hello@meerkatta.com and we will help you complete the purchase.');
} else {
  if (isSandbox) {
    window.Paddle.Environment.set('sandbox');
  }

  window.Paddle.Initialize({
    token,
    checkout: {
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en',
      },
    },
  });

  openCheckoutFromQuery();
}

function openCheckoutFromQuery() {
  // Paddle.js automatically opens transaction checkout when the URL contains
  // `_ptxn`. Keep that path for Paddle-hosted payment links.
  if (params.has('_ptxn')) return;

  const plan = checkoutPlan();
  const priceId = checkoutPriceId(plan);
  if (!priceId) {
    if (pageConfig.sandboxCheckout === 'true') {
      setPaymentCopy(
        'Choose a sandbox plan',
        'Pick one of the test checkout options below. Sandbox payments do not charge real payment methods.'
      );
      return;
    }

    setPaymentCopy('Choose a MeerKatta plan', 'Open this page from MeerKatta or meerkatta.com to start checkout.');
    return;
  }

  const checkout = {
    items: [{ priceId, quantity: 1 }],
    settings: {
      displayMode: 'overlay',
      theme: 'light',
      locale: 'en',
      variant: 'one-page',
      successUrl: checkoutSuccessUrl(plan),
    },
  };

  const discountCode = checkoutDiscountCode(plan);
  if (discountCode) {
    checkout.discountCode = discountCode;
    checkout.settings.allowDiscountRemoval = false;
  }

  const email = params.get('email')?.trim();
  if (email) {
    checkout.customer = { email };
  }

  const supabaseUserId = params.get('supabaseUserId')?.trim()
    || params.get('accountUserId')?.trim()
    || params.get('userId')?.trim();

  checkout.customData = {
    plan,
    checkoutEnvironment: environment,
    checkoutSource: pageConfig.sandboxCheckout === 'true' ? 'padsandbox' : 'pay',
    ...(supabaseUserId ? { supabaseUserId } : {}),
  };

  window.Paddle.Checkout.open(checkout);
}

function checkoutPlan() {
  return (params.get('plan') || '').trim().toLowerCase();
}

function checkoutPriceId(plan) {
  const directPrice = params.get('priceId')?.trim();
  if (directPrice?.startsWith('pri_')) return directPrice;

  if (plan === 'yearly') return configuredPrices.annual;
  return configuredPrices[plan] || null;
}

function checkoutDiscountCode(plan) {
  const directDiscountCode = params.get('discountCode')?.trim();
  if (directDiscountCode === 'none') return null;
  if (directDiscountCode) return directDiscountCode;
  return plan === 'lifetime' ? lifetimeDiscountCode : null;
}

function checkoutSuccessUrl(plan) {
  const successParams = new URLSearchParams({
    checkout: 'success',
    plan,
  });

  if (pageConfig.sandboxCheckout === 'true' || isSandbox) {
    successParams.set('sandbox', '1');
  }

  const successPath = pageConfig.successPath || '/welcome/';
  return `${window.location.origin}${successPath}?${successParams.toString()}`;
}

function setPaymentCopy(nextTitle, nextMessage) {
  if (title) title.textContent = nextTitle;
  if (message) message.textContent = nextMessage;
}
