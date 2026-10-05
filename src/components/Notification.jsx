import React from "react";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { CgDanger } from "react-icons/cg";

const Notification = (props) => {
  return props.status === "success" ? (
    <div>
      <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 animate-bounce-short">
        <HiOutlineCheckCircle className="text-emerald-400 text-xl shrink-0" />
        <div className="text-xs">
          <p className="font-bold text-white">{props.content}</p>
          <p className="text-slate-300 text-[11px]">{props.details}</p>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 animate-bounce-short">
        <CgDanger className="text-red-400 text-xl shrink-0" />
        <div className="text-xs">
          <p className="font-bold text-white">{props.content}</p>
          <p className="text-slate-300 text-[11px]">{props.details}</p>
        </div>
      </div>
    </div>
  );
};

export default Notification;
