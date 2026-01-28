import React, { useEffect, useState, useRef } from "react";
import { Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import SlpePaymentModesCards from "./index";
import SelectCustomerSection from "./SelectCustomerSection";
import ServiceChargeModal from "./ServiceChargeModal";
import { fetchCustomers } from "store/slices/customerSlice";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { DOMESTIC_CARD_TXN_LIMIT_CONFIG } from "./config/DomesticCardTxnLimitConfig";
/* ===================== Utility helpers ===================== */
const STORAGE_KEY = 'hp_pending_tx';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

// Backoff schedule in ms (with practical cap). We'll apply jitter.
const BACKOFF_SCHEDULE = [0, 3000, 5000, 8000, 12000, 18000, 24000, 30000];

const TX_STATES = {
  IDLE: 'idle',
  INITIATED: 'initiated', // paymentInit succeeded, waiting for redirect
  REDIRECTED: 'redirected', // we opened PG link
  POLLING: 'polling',
  PENDING_SETTLEMENT: 'pending_settlement',
  SUCCESS: 'success',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
  CANCELLED: 'cancelled'
};
const normalize = (s = "") =>
    s.trim().toLowerCase().replace(/\s+/g, "").replace("tarvel", "travel");


const getTxnLimitFromConfig = (modeName) => {
  if (!modeName) return null;


  const entry = Object.entries(DOMESTIC_CARD_TXN_LIMIT_CONFIG).find(
      ([key]) => normalize(key) === normalize(modeName)
  )?.[1];


  return entry?.maxTxnLimit ?? null;
};
/* ===================== Component ===================== */
const PaymentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token);
  const { data: customers } = useSelector((state) => state.customers || { data: [] });

  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [baseAmount, setBaseAmount] = useState(10000);

  const maxTxnLimit = selectedMode
      ? getTxnLimitFromConfig(selectedMode.name)
      : null;

  useEffect(() => {
    if (!customers?.length) dispatch(fetchCustomers());
  }, [dispatch, customers]);

  const profile = useSelector((state) => state.profile.data || {});

  /* ========== Payment payload builder (includes idempotency token) ========== */
  const buildPaymentPayload = ({ settlementAmount, percentage, selectedCustomer, selectedBank, selectedMode, profile, idempotencyKey }) => ({
    amount: Number(settlementAmount.toFixed(2)),
    phone: profile.phoneNumber,
    productinfo: selectedMode.name.toLowerCase().includes("edu") ? "education" : selectedMode.name.toLowerCase().includes("travel") ? "travel" : "Other",
    cn: selectedCustomer.phone,
    op: "",
    cir: "",
    ad1: selectedBank.bank_account_number,
    ad2: selectedBank.beneficiary_name,
    ad3: selectedBank.bank_ifsc,
    ad4: "",
    beneficiary_id: selectedBank.id || "686f7be987304564aafc528c",
    test: false,
    userLevel: profile.userLevel,
    custom_pricing: percentage,
    payment_mode: "slpe",
    slpe_gateway_id: String(selectedMode.id),
    idempotency_key: idempotencyKey // important to prevent duplicate charges
  });

  /* ========== Persistence helpers: store pending tx so refresh resumes ========== */
  const savePendingTx = (obj) => localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  const readPendingTx = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch(e){ return null; }
  };
  const clearPendingTx = () => localStorage.removeItem(STORAGE_KEY);

  /* ========== UI state for polling overlay & FSM ========== */
  const [txState, setTxState] = useState(TX_STATES.IDLE);
  const [txMessage, setTxMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // prevent double clicks

  // refs for polling loop control
  const pollRef = useRef({ cancelled: false, attempt: 0, timeoutId: null });

  // tab id for leader election
  const tabIdRef = useRef(generateId());
  const LOCK_KEY = 'hp_poll_lock';

  const acquireLock = () => {
    try {
      const now = Date.now();
      const raw = localStorage.getItem(LOCK_KEY);
      const lock = raw ? JSON.parse(raw) : null;
      if (!lock || (now - (lock.ts || 0) > 30000)) {
        // acquire
        localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId: tabIdRef.current, ts: now }));
        return true;
      }
      if (lock.tabId === tabIdRef.current) return true;
      return false;
    } catch (e) {
      console.error('lock acquire error', e);
      return false;
    }
  };

  const refreshLock = () => {
    try {
      const raw = localStorage.getItem(LOCK_KEY);
      const lock = raw ? JSON.parse(raw) : null;
      if (lock && lock.tabId === tabIdRef.current) {
        localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId: tabIdRef.current, ts: Date.now() }));
        return true;
      }
      return false;
    } catch (e) { return false; }
  };

  const releaseLock = () => {
    try {
      const raw = localStorage.getItem(LOCK_KEY);
      const lock = raw ? JSON.parse(raw) : null;
      if (lock && lock.tabId === tabIdRef.current) localStorage.removeItem(LOCK_KEY);
    } catch (e) { }
  };

  /* ========== navigation/back protection (SOFT) ========= */
  // We do NOT block users from leaving the page. Instead we persist pending tx and
  // allow the user to continue in background. Keep this effect minimal for analytics.
  useEffect(() => {
    if (txState !== TX_STATES.IDLE) {
      console.debug('[payment] txState changed', txState);
    }
  }, [txState]);

  /* ========== Robust polling with exponential backoff + jitter + network resilience ========== */
  const runPolling = async ({ serviceReferenceId, token }) => {
    pollRef.current.cancelled = false;
    pollRef.current.attempt = 0;

    // attempt to become the polling leader
    const weAreLeader = acquireLock();
    let lockRefreshInterval = null;

    if (weAreLeader) {
      // refresh lock periodically
      lockRefreshInterval = setInterval(() => refreshLock(), 15000);
    } else {
      // Not leader: show polite message and rely on storage events to update state
      setTxState(TX_STATES.POLLING);
      setTxMessage('Waiting for payment status (another tab is checking).');
      return;
    }

    setTxState(TX_STATES.POLLING);
    setTxMessage('Working on payment — please do not press back or close this tab');

    const attemptFn = async () => {
      if (pollRef.current.cancelled) return;
      pollRef.current.attempt += 1;
      const attempt = pollRef.current.attempt;

      console.debug('[poll] attempt', attempt, 'for', serviceReferenceId);

      try {
        const resp = await axios.get('https://test.happypay.live/users/serviceTransaction', {
          params: { id: serviceReferenceId },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10s per request
        });

        const serverMessage = resp.data?.message || null;
        const data = resp.data?.data || null;
        const correlation = resp.headers?.['x-correlation-id'] || resp.headers?.['x-request-id'] || null;
        if (correlation) console.info('[poll] correlation id', correlation);

        console.debug('[poll] response', resp.data);

        // detailed error handling
        if (resp.status >= 500) {
          // server error - try again
          console.warn('[poll] server error', resp.status);
        }

        if (data && data.paymentStatus) {
          const status = String(data.paymentStatus).toLowerCase();
          if (status === 'success') {
            setTxState(TX_STATES.SUCCESS);
            setTxMessage('Payment successful — redirecting shortly');
            clearPendingTx();
            pollRef.current.cancelled = true;
            return { done: true, status: TX_STATES.SUCCESS };
          }

          if (['failed', 'rejected', 'cancelled'].includes(status)) {
            setTxState(TX_STATES.FAILED);
            setTxMessage('Payment failed — returning to dashboard');
            clearPendingTx();
            pollRef.current.cancelled = true;
            return { done: true, status: TX_STATES.FAILED };
          }

          if (status === 'pending' || status === 'initiated') {
            // still in-flight, continue polling
            setTxState(TX_STATES.PENDING_SETTLEMENT);
            setTxMessage(serverMessage || 'Payment in progress — waiting for confirmation');
          }
        }

      } catch (err) {
        // network or axios timeout
        const networkMsg = err?.message || 'Network error during polling';
        console.error('[poll] network error', networkMsg, err?.response?.data || err);
        // do not escalate to user; just continue attempts
      }

      // decide next backoff or timeout
      if (pollRef.current.attempt >= BACKOFF_SCHEDULE.length) {
        // exhausted schedule -> overall timeout
        setTxState(TX_STATES.TIMEOUT);
        setTxMessage('Payment timed out — please check later');
        clearPendingTx();
        pollRef.current.cancelled = true;
        return { done: true, status: TX_STATES.TIMEOUT };
      }

      // schedule next attempt with jitter
      const baseDelay = BACKOFF_SCHEDULE[Math.min(pollRef.current.attempt, BACKOFF_SCHEDULE.length - 1)];
      // jitter +/- 20%
      const jitter = Math.round((Math.random() * 0.4 - 0.2) * baseDelay);
      const delay = Math.max(1000, baseDelay + jitter);

      console.debug('[poll] scheduling next in', delay, 'ms');

      // return object instructing caller to schedule
      return { done: false, delay };
    };

    // loop runner
    let loopActive = true;
    while (loopActive && !pollRef.current.cancelled) {
      const result = await attemptFn();
      if (!result) break; // defensive
      if (result.done) {
        loopActive = false; break;
      }
      await new Promise(res => { pollRef.current.timeoutId = setTimeout(res, result.delay); });
    }

    // final navigation decisions
    // Do not auto-navigate. Keep overlay visible so user can choose when to leave.
    // Release lock and cleanup
    if (lockRefreshInterval) clearInterval(lockRefreshInterval);
    releaseLock();
  };

  /* ========== Start or resume polling if pending tx exists ========== */
  const resumeIfPending = () => {
    const pending = readPendingTx();
    if (pending && pending.serviceReferenceId && pending.status !== 'success' && pending.status !== 'failed') {
      // update UI and resume
      setTxState(TX_STATES.POLLING);
      setTxMessage('Resuming payment status check');
      runPolling({ serviceReferenceId: pending.serviceReferenceId, token });
    }
  };

  useEffect(() => { resumeIfPending(); }, []); // run once on mount

  // Sync txState across tabs using storage events so non-leader tabs update UI
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const p = JSON.parse(e.newValue);
          if (p && p.status) {
            setTxState(p.status);
            // optional: set human message from cached info
            if (p.status === TX_STATES.PENDING_SETTLEMENT) setTxMessage('Payment in progress — waiting for confirmation');
            if (p.status === TX_STATES.INITIATED) setTxMessage('Payment initiated');
            if (p.status === TX_STATES.REDIRECTED) setTxMessage('Payment opened in new tab');
          }
        } catch (err) { /* ignore */ }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Persist txState into the pending record so refresh keeps state; no body blur
  useEffect(() => {
    try {
      const p = readPendingTx();
      if (p) { p.status = txState; savePendingTx(p); }
    } catch (e) { /* ignore */ }
  }, [txState]);

  /* ========== Cancel polling & cleanup ========== */
  const cancelPolling = () => {
    pollRef.current.cancelled = true;
    if (pollRef.current.timeoutId) clearTimeout(pollRef.current.timeoutId);
    pollRef.current.timeoutId = null;
  };

  useEffect(() => {
    return () => cancelPolling();
  }, []);

  /* ========== Hardened payment init with idempotency + dedupe + persistence ========== */
  const handlePaymentInit = async (payloadBase) => {
    if (maxTxnLimit && payload.amount > maxTxnLimit) {
      message.error(
          `Maximum allowed transaction for ${selectedMode.name} is ₹${maxTxnLimit.toLocaleString("en-IN")}`
      );
      return;
    }

    if (isSubmitting) {
      message.info('Payment is already in progress');
      return;
    }

    // Avoid duplicate init if pending exists
    const pending = readPendingTx();
    if (pending && pending.serviceReferenceId && pending.status !== 'success' && pending.status !== 'failed') {
      message.info('A payment is already in progress; resuming status check');
      resumeIfPending();
      return;
    }

    setIsSubmitting(true);

    // generate idempotency key and persist
    const idempotencyKey = generateId();
    const payload = { ...payloadBase, idempotencyKey };

    // save a minimal pending record pre-init so refresh won't cause duplicates
    savePendingTx({ idempotencyKey, initiatedAt: Date.now(), status: TX_STATES.INITIATED });
    setTxState(TX_STATES.INITIATED);
    setTxMessage('Initiating payment...');

    try {
      const res = await axios.post('https://test.happypay.live/service/paymentInit', payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: 15000
      });

      // track correlation id
      const correlation = res.headers?.['x-correlation-id'] || res.data?.correlationId || null;
      if (correlation) console.info('[paymentInit] correlation id', correlation);

      if (res.data?.status === 'success' && typeof res.data?.data === 'string') {
        const paymentUrl = res.data.data;
        const serviceReferenceId = res.data.extraInfo || res.data?.data?.extraInfo || res.data?.extra_info || null;

        // update persisted record
        savePendingTx({ idempotencyKey, serviceReferenceId, initiatedAt: Date.now(), status: TX_STATES.INITIATED });

        // open PG in new tab (best-effort)
        try { window.open(paymentUrl, '_blank'); setTxState(TX_STATES.REDIRECTED); setTxMessage('Opened payment provider'); }
        catch (e) { window.location.href = paymentUrl; }

        // if we have a serviceReferenceId, start polling (leader election will choose a tab)
        if (serviceReferenceId) {
          savePendingTx({ idempotencyKey, serviceReferenceId, initiatedAt: Date.now(), status: TX_STATES.REDIRECTED });
          // start polling attempt on this tab; if another tab already holds lock it will skip heavy polling
          runPolling({ serviceReferenceId, token });
        } else {
           // fallback: no id returned — mark initiated and instruct user
           message.info('Payment opened. Waiting for confirmation.');
         }

      } else {
        // backend returned error metadata
        const errMsg = res.data?.message || 'Failed to create payment link';
        console.error('[paymentInit] failed response', res.data);
        setTxState(TX_STATES.FAILED);
        setTxMessage(errMsg);
        clearPendingTx();
        message.error(errMsg);
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err.message || 'Payment initiation failed';
      console.error('[paymentInit] error', err?.response?.data || err);
      setTxState(TX_STATES.FAILED);
      setTxMessage(serverMsg);
      clearPendingTx();
      message.error(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========== UI Overlay (Lotties + animations) ========= */
  const Overlay = () => {
    if (txState === TX_STATES.IDLE) return null;
    const [overlayVisibleState] = [overlayVisible];
    if (!overlayVisible) return null;

    const isWorking = [TX_STATES.INITIATED, TX_STATES.REDIRECTED, TX_STATES.POLLING, TX_STATES.PENDING_SETTLEMENT].includes(txState);
    const isSuccess = txState === TX_STATES.SUCCESS;
    const isFailed = txState === TX_STATES.FAILED || txState === TX_STATES.TIMEOUT;

    return (
      <AnimatePresence>
        <motion.div className="hp-polling-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999 }}>
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} style={{ background: '#fff', padding: 28, borderRadius: 12, minWidth: 320, maxWidth: 760, textAlign: 'center' }}>

            {isWorking && (
              <>
                <div style={{ width: 120, height: 120, margin: '0 auto 12px' }}>
                  <DotLottieReact
                    src={"https://lottie.host/071372e1-cf60-41b1-bd74-f16d85bc85b6/75LwPhjKXK.lottie"}
                    autoplay
                    loop
                  />
                </div>
                 <h2 style={{ marginBottom: 8 }}>Working on payment</h2>
                 <p style={{ marginBottom: 8 }}>{txMessage}</p>

                 <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                   <Button type="primary" onClick={() => { /* reopen overlay (noop) */ }}>
                     Stay here
                   </Button>
                   <Button onClick={() => {
                     // allow overlay to close but keep polling running
                     setOverlayVisible(false);
                     message.info('Payment will continue in background. You can reopen status from the top-right badge.');
                   }}>
                     Continue in background
                   </Button>
                 </div>
               </>
             )}

            {isSuccess && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <div style={{ width: 260, height: 260 }}>
                    <DotLottieReact src={"https://lottie.host/d820bd06-2399-40f0-b8d5-2c34851ba42b/PKuqHpK7FT.lottie"} autoplay loop={false} />
                  </div>
                </div>
                <h2>Payment successful</h2>
                <p>{txMessage}</p>
              </>
            )}

            {isFailed && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <div style={{ width: 220, height: 220 }}>
                    <DotLottieReact src={"https://lottie.host/d10ffaaa-aa48-4756-a1f5-c23382be546c/2PiJQVzsRp.lottie"} autoplay loop={false} />
                  </div>
                </div>
                <h2>Payment failed</h2>
                <p>{txMessage}</p>
              </>
            )}

          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // overlay visibility state (user can hide overlay while polling continues)
  const [overlayVisible, setOverlayVisible] = useState(true);

  // ensure overlay re-opens when final terminal state is reached
  useEffect(() => {
    if ([TX_STATES.SUCCESS, TX_STATES.FAILED, TX_STATES.TIMEOUT].includes(txState)) {
      setOverlayVisible(true);
    }
  }, [txState]);

  // Floating badge to reopen overlay when user continued in background
  const FloatingBadge = () => {
    if (txState === TX_STATES.IDLE) return null;
    if (overlayVisible) return null;

    return (
      <div onClick={() => setOverlayVisible(true)} style={{ position: 'fixed', right: 18, top: 84, zIndex: 12000 }}>
        <Button type="primary" shape="round">Payment pending</Button>
      </div>
    );
  };

  /* ========== Fetch customer banks (unchanged) ========== */
  const fetchCustomerBanks = async (customerId) => {
    if (!customerId || !token) return;
    try {
      setBankLoading(true);
      const res = await fetch(`https://test.happypay.live/customer/getAllBankAccounts?customer_id=${customerId}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      const json = await res.json();
      setBankAccounts(Array.isArray(json?.data) ? json.data : []);
    } catch (err) {
      console.error(err); message.error('Failed to fetch bank accounts'); setBankAccounts([]);
    } finally { setBankLoading(false); }
  };

  /* ========== Render UI (keeps previous layout) ========== */
  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      {step > 1 && (
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setStep(step - 1)}>Back</Button>
      )}

      {/* STEP 1 – PAYMENT MODE */}
      {step === 1 && (
        <>
          <SlpePaymentModesCards
            selectedMode={selectedMode}
            onSelect={setSelectedMode}
          />

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button
              type="primary"
              disabled={!selectedMode}
              onClick={() => setStep(2)}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* STEP 2 – CUSTOMER + BANK */}
      {step === 2 && (
        <SelectCustomerSection
          customers={customers}
          loading={false}
          bankAccounts={bankAccounts}
          bankLoading={bankLoading}
          fetchCustomerBanks={fetchCustomerBanks}
          onSelect={(customer, bank) => {
            setSelectedCustomer(customer);
            setSelectedBank(bank);
            setStep(3);
          }}
          onChangeCustomer={() => {
            setSelectedCustomer(null);
            setSelectedBank(null);
            setBankAccounts([]);
          }}
        />
      )}

      {/* STEP 3 – PAYMENT SUMMARY */}
      <ServiceChargeModal
          open={step === 3}
          selectedCustomer={selectedCustomer}
          selectedMode={selectedMode}
          baseAmount={baseAmount}
          setBaseAmount={setBaseAmount}
          maxTxnLimit={maxTxnLimit}   // ✅ ADD THIS
          onClose={() => setStep(2)}
          onApply={(data) => {
            const payload = buildPaymentPayload({
              settlementAmount: data.settlementAmount,
              percentage: data.percentage,
              selectedCustomer,
              selectedBank,
              selectedMode,
              profile,
              idempotencyKey: generateId()
            });

            handlePaymentInit(payload);
          }}
      />
      {/* overlay shows FSM-driven UI (user can hide it with Continue in background) */}
      {overlayVisible && Overlay()}

      {/* floating badge to reopen overlay if user continued in background */}
      <FloatingBadge />

    </div>
  );
};

export default PaymentPage;

