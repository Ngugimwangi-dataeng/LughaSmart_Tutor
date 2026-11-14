import React, { useState } from 'react';
import { Course, PaymentMethod, PlanType } from '../types';
import { playAudioChime } from '../utils/audio';
import { X, Smartphone, CreditCard, CheckCircle2, Lock, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  course: Course;
  onClose: () => void;
  onCompleteEnrollment: (params: {
    course: Course;
    planType: PlanType;
    amountKes: number;
    paymentMethod: PaymentMethod;
    transactionRef: string;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  course,
  onClose,
  onCompleteEnrollment,
}) => {
  const [planType, setPlanType] = useState<PlanType>('monthly_pass');
  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [phone, setPhone] = useState('254712345678');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9482');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvv, setCardCvv] = useState('842');
  const [processing, setProcessing] = useState(false);
  const [receiptRef, setReceiptRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amountKes =
    planType === 'monthly_pass' ? course.monthlyPassPriceKes : course.perSessionPriceKes;
  const fullMonthBase = course.perSessionPriceKes * 8;
  const discountPct = Math.max(
    15,
    Math.round(((fullMonthBase - course.monthlyPassPriceKes) / fullMonthBase) * 100)
  );

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (method === 'mpesa' && phone.trim().length < 9) {
      setErrorMsg('Please enter a valid Safaricom M-Pesa phone number (e.g. 254712345678).');
      return;
    }
    if (method === 'visa' && (!cardHolder.trim() || cardCvv.trim().length < 3)) {
      setErrorMsg('Please enter cardholder name and CVV for Visa verification.');
      return;
    }

    setProcessing(true);
    playAudioChime('stk_prompt');

    setTimeout(() => {
      const ref =
        method === 'mpesa'
          ? `MPESA-${Math.floor(10000000 + Math.random() * 90000000)}`
          : `VISA-${Math.floor(100000 + Math.random() * 900000)}`;

      setProcessing(false);
      setReceiptRef(ref);
      playAudioChime('success');
      onCompleteEnrollment({
        course,
        planType,
        amountKes,
        paymentMethod: method,
        transactionRef: ref,
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E3DC] rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-5 border-b border-[#E5E3DC] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F6B4B]">
              <Lock className="w-3.5 h-3.5" />
              <span>Enroll Before Starting Class</span>
            </div>
            <h2 className="font-display text-xl font-semibold text-[#18181B] mt-0.5">
              {course.languageName} · {course.audience === 'adult' ? 'Adult 3-Hr' : 'Children 1-Hr'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="w-8 h-8 rounded-lg bg-[#F3F2EE] text-[#52525B] hover:text-[#18181B] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {receiptRef ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0F6B4B]/10 text-[#0F6B4B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#18181B]">
                Enrollment Confirmed
              </h3>
              <p className="text-xs text-[#52525B] max-w-sm mx-auto leading-relaxed">
                {planType === 'monthly_pass'
                  ? 'Your Monthly Unlimited Pass is active. You have unrestricted access to all live Jitsi classes, audio catch-up recordings, and PDFs for 30 days.'
                  : 'Your single-session pass is active. You can launch the Jitsi classroom and download this session’s PDF and audio materials.'}
              </p>
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E3DC] text-left text-xs font-mono space-y-1">
                <div>Receipt: {receiptRef}</div>
                <div>Method: {method === 'mpesa' ? 'M-Pesa (Kenya)' : 'Visa (International)'}</div>
                <div>Amount: KES {amountKes.toLocaleString()}</div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#0F6B4B] hover:bg-[#0B533A] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Go to My Enrollment Area
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-5">
              {/* Plan Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#18181B]">
                  1. Select Enrollment Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlanType('per_session')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      planType === 'per_session'
                        ? 'border-[#0F6B4B] bg-[#0F6B4B]/5 ring-1 ring-[#0F6B4B]'
                        : 'border-[#E5E3DC] hover:border-[#A1A1AA]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#18181B]">Pay Per Session</div>
                    <div className="font-mono text-base font-semibold text-[#18181B] tabular-nums mt-1">
                      KES {course.perSessionPriceKes.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#71717A] mt-1">
                      Single {course.sessionDurationMinutes === 180 ? '3-hour' : '1-hour'} live class access
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanType('monthly_pass')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      planType === 'monthly_pass'
                        ? 'border-[#0F6B4B] bg-[#0F6B4B]/5 ring-1 ring-[#0F6B4B]'
                        : 'border-[#E5E3DC] hover:border-[#A1A1AA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F6B4B]">Whole-Month Pass</span>
                      <span className="text-[11px] font-semibold text-[#B45309]">Save {discountPct}%</span>
                    </div>
                    <div className="font-mono text-base font-semibold text-[#0F6B4B] tabular-nums mt-1">
                      KES {course.monthlyPassPriceKes.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#52525B] mt-1">
                      Unlimited live classes, audio & PDFs all month
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Gateway */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#18181B]">
                  2. Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('mpesa')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer ${
                      method === 'mpesa'
                        ? 'border-[#0F6B4B] bg-[#0F6B4B]/5 ring-1 ring-[#0F6B4B]'
                        : 'border-[#E5E3DC]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#0F6B4B] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#18181B]">M-Pesa</div>
                      <div className="text-[11px] text-[#71717A]">Within Kenya</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('visa')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer ${
                      method === 'visa'
                        ? 'border-[#0F6B4B] bg-[#0F6B4B]/5 ring-1 ring-[#0F6B4B]'
                        : 'border-[#E5E3DC]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#18181B] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#18181B]">Visa Card</div>
                      <div className="text-[11px] text-[#71717A]">Outside Kenya</div>
                    </div>
                  </button>
                </div>
              </div>

              {method === 'mpesa' ? (
                <div>
                  <label className="block text-xs font-medium text-[#3F3F46] mb-1">
                    Safaricom M-Pesa Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="254712345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#3F3F46] mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Full name on Visa card"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#3F3F46] mb-1">
                      Visa Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4D4D8] bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6B4B]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D4D4D8] bg-white text-xs font-mono text-center"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="CVV"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D4D4D8] bg-white text-xs font-mono text-center"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 px-4 bg-[#0F6B4B] hover:bg-[#0B533A] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Payment...</span>
                  </>
                ) : (
                  <span>
                    Pay KES {amountKes.toLocaleString()} (~${Math.round(amountKes / 130)} USD) & Enroll
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
