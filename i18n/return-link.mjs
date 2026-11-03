export function appReturnLink(params) {
  const plan = params.get('plan') === 'annual' ? 'yearly' : params.get('plan');
  const safePlan = ['monthly', 'yearly', 'lifetime'].includes(plan) ? plan : 'lifetime';
  const requestedScheme = params.get('returnScheme');
  const scheme = ['meerkatta', 'meerkatta-debug'].includes(requestedScheme) ? requestedScheme : 'meerkatta';
  const query = new URLSearchParams({plan:safePlan});
  if (params.get('sandbox') === '1') query.set('sandbox', '1');
  return `${scheme}://checkout/success?${query}`;
}
