import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source = readFileSync(new URL('../pay/pay.js', import.meta.url), 'utf8').replaceAll('import.meta.env', 'env');
function checkout({search='?plan=yearly', dataset={}, env={}, missingSdk=false, initializeError=false, openError=false} = {}) {
  const title = {textContent:''};
  const message = {textContent:''};
  const retry = {hidden:true, addEventListener(_event, handler) { this.click = handler; }};
  const timers = new Map();
  const opens = [];
  const logs = [];
  let config, closes=0, reloads=0, environments=[];
  const Paddle = {
    Environment:{set:value => environments.push(value)},
    Initialize(value) { if (initializeError) throw new Error('SDK failed'); config = value; },
    Checkout:{
      open(value) { if (openError) throw new Error('Open failed'); opens.push(value); },
      close() { closes++; config?.eventCallback({name:'checkout.closed'}); },
    },
  };
  runInNewContext(source, {
    env, URLSearchParams,
    console:{warn:(...args) => logs.push(args)},
    setTimeout(handler) { const key = {}; timers.set(key, handler); return key; },
    clearTimeout:key => timers.delete(key),
    document:{body:{dataset}, querySelector:selector => ({'#checkout-title':title, '#checkout-message':message, '#checkout-retry':retry})[selector]},
    window:{Paddle:missingSdk?undefined:Paddle, location:{origin:'https://meerkatta.com', search, reload() { reloads++; }}},
  });
  return {title,message,retry,timers,opens,logs,environments,get config(){return config;},get closes(){return closes;},get reloads(){return reloads;},event:name => config.eventCallback({name})};
}

test('Approved live prices, metadata, customer prefill and return scheme survive recovery', () => {
  for (const [plan,price] of Object.entries({monthly:'pri_01kw6arnrm45wz6cvspds1cxej',yearly:'pri_01kw6at943hce5922bdw52e0bh',annual:'pri_01kw6at943hce5922bdw52e0bh',lifetime:'pri_01kw6am7fp2zvg5jztgd7qmasp'})) {
    const c = checkout({search:`?plan=${plan}&priceId=pri_unapproved&email=test%40example.com&supabaseUserId=account-fixture&returnScheme=meerkatta-debug`});
    assert.ok(c.config.token.startsWith('live_'));
    assert.equal(c.opens[0].items[0].priceId,price);
    assert.equal(c.opens[0].customer.email,'test@example.com');
    assert.equal(c.opens[0].customData.supabaseUserId,'account-fixture');
    assert.equal(c.opens[0].customData.plan,plan);
    assert.ok(c.opens[0].settings.successUrl.includes('returnScheme=meerkatta-debug'));
    assert.equal(c.opens[0].discountCode,plan==='lifetime'?'launch':undefined);
    c.event('checkout.error');
    assert.equal(c.retry.hidden,false);
    assert.equal(c.timers.size,0);
    c.retry.click();
    assert.equal(c.opens.length,2);
    assert.equal(JSON.stringify(c.opens[1]),JSON.stringify(c.opens[0]));
    assert.equal(c.logs.length,0);
  }
});

test('Loaded checkout clears the timer; close permits one deliberate reopening', () => {
  const c = checkout();
  c.retry.click();
  assert.equal(c.opens.length,1);
  c.event('checkout.loaded');
  assert.equal(c.timers.size,0);
  assert.equal(c.title.textContent,'Secure checkout is ready');
  c.event('checkout.closed');
  assert.equal(c.title.textContent,'Checkout closed');
  assert.equal(c.retry.hidden,false);
  c.retry.click();c.retry.click();
  assert.equal(c.opens.length,2);
});

test('Timeout and synchronous SDK failures expose recovery without automatic retries', () => {
  const c = checkout();
  [...c.timers.values()][0]();
  assert.match(c.title.textContent,/longer than expected/);
  assert.equal(c.retry.hidden,false);
  assert.equal(c.opens.length,1);
  for (const options of [{initializeError:true},{openError:true}]) {
    const failed = checkout(options);
    assert.equal(failed.title.textContent,'Checkout could not open');
    assert.equal(failed.retry.hidden,false);
    assert.equal(failed.timers.size,0);
  }
});

test('Unavailable SDK retries by reloading; disabled or invalid plans stay closed', () => {
  const absent = checkout({missingSdk:true});
  assert.equal(absent.title.textContent,'Checkout could not load');
  absent.retry.click();assert.equal(absent.reloads,1);
  for (const c of [checkout({dataset:{checkoutDisabled:'true'}}),checkout({search:'?plan=constructor'}),checkout({search:'?plan=unknown'})]) {
    assert.equal(c.opens.length,0);
    assert.equal(c.retry.hidden,true);
    assert.equal(c.timers.size,0);
  }
});

test('Payment decline keeps the provider form open; completion never offers a second payment', () => {
  const c = checkout();
  c.event('checkout.loaded');c.event('checkout.payment.failed');
  assert.equal(c.closes,0);
  assert.equal(c.retry.hidden,true);
  c.event('checkout.completed');c.event('checkout.closed');c.event('checkout.payment.failed');c.retry.click();
  assert.equal(c.title.textContent,'Payment complete');
  assert.equal(c.retry.hidden,true);
  assert.equal(c.opens.length,1);
});

test('Transaction links auto-open initially and retry the same transaction, not a new plan', () => {
  const c = checkout({search:'?_ptxn=txn_fixture&plan=lifetime'});
  assert.ok(c.config);
  assert.equal(c.opens.length,0);
  c.event('checkout.error');c.retry.click();
  assert.equal(c.opens.length,1);
  assert.equal(c.opens[0].transactionId,'txn_fixture');
  assert.equal(c.opens[0].items,undefined);
});

test('Sandbox-only price overrides and environment stay sandbox-only', () => {
  const c = checkout({search:'?plan=monthly&priceId=pri_sandbox_fixture',dataset:{paddleEnvironment:'sandbox',sandboxCheckout:'true'}});
  assert.ok(c.config.token.startsWith('test_'));
  assert.deepEqual(c.environments,['sandbox']);
  assert.equal(c.opens[0].items[0].priceId,'pri_sandbox_fixture');
  assert.ok(c.opens[0].settings.successUrl.includes('sandbox=1'));
});
