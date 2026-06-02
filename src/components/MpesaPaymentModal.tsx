import React from "react";
import { X, Loader2, Check, Phone } from "lucide-react";
import { MaintenanceTask } from "../types";

interface MpesaPaymentModalProps {
  isMpesaModalOpen: boolean;
  setIsMpesaModalOpen: (open: boolean) => void;
  activeMpesaTask: MaintenanceTask | null;
  mpesaPhone: string;
  setMpesaPhone: (phone: string) => void;
  mpesaStep: "idle" | "stk-sent" | "waiting-pin" | "completed";
  mpesaTransactionId: string;
  handleInitiateMpesa: () => void;
  handleCloseMpesaSuccess: () => void;
}

export default function MpesaPaymentModal({
  isMpesaModalOpen,
  setIsMpesaModalOpen,
  activeMpesaTask,
  mpesaPhone,
  setMpesaPhone,
  mpesaStep,
  mpesaTransactionId,
  handleInitiateMpesa,
  handleCloseMpesaSuccess
}: MpesaPaymentModalProps) {
  if (!isMpesaModalOpen || !activeMpesaTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop layer */}
      <div
        onClick={() => {
          if (mpesaStep !== "stk-sent" && mpesaStep !== "waiting-pin") {
            setIsMpesaModalOpen(false);
          }
        }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm cursor-default"
      />
      {/* Content panel */}
      <div className="bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-900 w-full max-w-sm relative z-10 overflow-hidden animate-zoom-in">
        {/* Header */}
        <div className="bg-slate-900/60 p-4 flex items-center justify-between border-b border-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#38bdf8] flex items-center justify-center text-slate-950 font-black text-xs select-none shadow-[0_2px_8px_rgba(56,189,248,0.25)]">
              M
            </div>
            <div>
              <h4 className="text-[9px] font-bold tracking-wider uppercase text-slate-400 font-display">
                Safaricom Daraja API
              </h4>
              <h3 className="text-xs font-bold text-white leading-tight">
                M-Pesa STK Push Gateway
              </h3>
            </div>
          </div>
          {mpesaStep !== "stk-sent" && mpesaStep !== "waiting-pin" && (
            <button
              onClick={() => setIsMpesaModalOpen(false)}
              className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-900/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Simulated Phone UI Screen View */}
        <div className="p-5 space-y-5">
          {/* STK Step: Idle Info View */}
          {mpesaStep === "idle" && (
            <div className="space-y-4">
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-900/80 space-y-3.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-display">
                  Transfer Recipient
                </span>
                <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-slate-901">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {activeMpesaTask.contractor}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-light">
                      Verified Contractor
                    </span>
                  </div>
                  <span className="text-[8.5px] bg-emerald-900/30 text-emerald-400 font-mono py-0.5 px-2 rounded font-bold border border-emerald-900">
                    Pre-Vetted
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Task Detail:</span>
                  <span className="text-white font-semibold text-right max-w-[160px] truncate">
                    {activeMpesaTask.component}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-900 pt-3 text-xs">
                  <span className="text-slate-400 font-medium font-display uppercase tracking-wider text-[9px]">Payout Value:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    KSh {activeMpesaTask.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Safaricom Phone input details */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Enter Contractor Phone *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. 254712345678"
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-900 rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 focus:bg-slate-900 transition-all font-bold"
                  />
                </div>
                <span className="text-[9.5px] text-slate-500 font-light block leading-tight">
                  Ensure phone has the standard <strong className="text-slate-400 font-mono">2547XXXXXXXX</strong> structural layout.
                </span>
              </div>

              {/* Disbursement Activation button */}
              <button
                onClick={handleInitiateMpesa}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg focus:outline-none transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <span>Trigger M-Pesa STK Push</span>
              </button>
            </div>
          )}

          {/* STK Step: Sent API Request spinner */}
          {mpesaStep === "stk-sent" && (
            <div className="py-8 text-center space-y-4">
              <div className="relative w-10 h-10 mx-auto">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              </div>
              <div className="space-y-1.5Packed">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Transmitting STK Query</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed px-4 font-light">
                  Initiating secure handshake to +{mpesaPhone} via Safaricom Daraja API nodes...
                </p>
              </div>
            </div>
          )}

          {/* STK Step: Waiting for Input */}
          {mpesaStep === "waiting-pin" && (
            <div className="py-6 space-y-5 text-center">
              {/* Phone Mock display */}
              <div className="max-w-[190px] mx-auto bg-slate-950 border border-slate-900 p-3 rounded-2xl text-left shadow-2xl space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-sky-400"></div>
                <div className="flex items-center justify-between text-[8px] text-[#4ade80] font-mono select-none">
                  <span className="font-bold">Simulated Prompt</span>
                  <span>● LTE</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed font-light">
                  <strong>Pay Bill</strong> KSh {activeMpesaTask.amount.toLocaleString()} to BLCTS PORTAL. Enter M-Pesa PIN:
                </p>
                <div className="flex gap-1.5 items-center justify-center py-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 animate-pulse"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 animate-pulse"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 animate-pulse"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 animate-pulse"></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-display">Awaiting PIN Authentication</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed px-4 font-light">
                  A simulated STK PIN dispatch was sent to +{mpesaPhone}. Check handset lockscreen and enter PIN to approve.
                </p>
              </div>
            </div>
          )}

          {/* STK Step: Completed Action! */}
          {mpesaStep === "completed" && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">Disbursement Authorized</h4>
                <p className="text-[11px] text-slate-350 px-3 font-light leading-relaxed">
                  LPO payout of KSh {activeMpesaTask.amount.toLocaleString()} has been fully credited to the contractor mobile wallet.
                </p>
                <div className="bg-slate-900 p-2 text-[10px] font-mono border border-slate-800 inline-block rounded-lg text-emerald-400 uppercase mt-4">
                  REF: {mpesaTransactionId}
                </div>
              </div>

              <button
                onClick={handleCloseMpesaSuccess}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-800 transition-colors cursor-pointer block active:scale-95"
              >
                Return to Vendor Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
