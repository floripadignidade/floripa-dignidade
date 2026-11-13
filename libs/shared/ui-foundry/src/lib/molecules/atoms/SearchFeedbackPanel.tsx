import React from 'react';
import { motion } from 'framer-motion';

export const SearchFeedbackPanel: React.FC<{ isVisibleBoolean: boolean; label: string }> = ({
  isVisibleBoolean,
  label,
}) => {
  if (!isVisibleBoolean) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] overflow-hidden"
    >
      <div className="p-8 text-center">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="h-1 w-24 bg-slate-100 mx-auto rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-1/3 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};
