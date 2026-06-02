import React from "react";
import { Info } from "lucide-react";

interface VendorCenterProps {
  triggerToast: (msg: string, type: "success" | "info" | "warning") => void;
}

export default function VendorCenter({ triggerToast }: VendorCenterProps) {
  return (
    <section className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)] space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-wide font-display">
          Partner Contractors & Material Sourcing
        </h3>
        <p className="text-[11px] text-slate-500">
          Pre-vetted premium local suppliers committed to delivering high-durability products to mitigate Kenyan first-cost bias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vendor 1 */}
        <div className="bg-[#fafcfd] border border-slate-200/50 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase font-extrabold tracking-widest py-0.5 px-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100/50 font-display">
                Materials & Concrete
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-xs flex items-center justify-center shadow-sm select-none">
                BSC
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Bamburi Special Concrete
            </h4>
            <p className="text-[11px] text-slate-540 leading-relaxed font-light text-slate-500">
              Supplier of custom aggregate pre-cast cement and structural concrete additives explicitly formulated for wet foundation structures in heavy Nairobi clay layers.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-550">
            <span className="text-slate-400">Location: Athi River</span>
            <span className="font-bold text-emerald-600">✓ Vetted Partner</span>
          </div>
        </div>

        {/* Vendor 2 */}
        <div className="bg-[#fafcfd] border border-slate-200/50 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase font-extrabold tracking-widest py-0.5 px-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-100/50 font-display">
                Water & Pumps
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-blue-400 font-extrabold text-xs flex items-center justify-center shadow-sm select-none">
                D&S
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Davis & Shirtliff
            </h4>
            <p className="text-[11px] text-slate-540 leading-relaxed font-light text-slate-500">
              Industry leaders in deep borehole rigs, smart solar water pump systems, and greywater reverse-osmosis filtration setups for residential properties across East Africa.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-550">
            <span className="text-slate-400">Dundori Road, Nairobi</span>
            <span className="font-bold text-emerald-600">✓ Vetted Partner</span>
          </div>
        </div>

        {/* Vendor 3 */}
        <div className="bg-[#fafcfd] border border-slate-200/50 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase font-extrabold tracking-widest py-0.5 px-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-100/50 font-display">
                Mechanical & Lift
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-500 font-extrabold text-xs flex items-center justify-center shadow-sm select-none">
                OTI
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Otis East Africa Ltd
            </h4>
            <p className="text-[11px] text-slate-540 leading-relaxed font-light text-slate-500">
              Specialized vertical transit mechanics providing high-efficiency passenger elevator lines, regenerative motor brackets, and 10-year suspension steel fatigue guarantees.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-550">
            <span className="text-slate-400">Mombasa Road, Nairobi</span>
            <span className="font-bold text-emerald-600">✓ Vetted Partner</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center justify-between flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0" />
          <span className="text-[11px] text-slate-600 font-light">
            Want to list your construction material enterprise or certified plumbing business? Connect with the BLCTS registry network.
          </span>
        </div>
        <button
          onClick={() => triggerToast("Registration request logged. Our vetting engineers will reach out inside 48 hours.", "info")}
          className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm focus:outline-none shrink-0 cursor-pointer transition-colors"
        >
          Partner Signup
        </button>
      </div>
    </section>
  );
}
