'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Ban,
  X,
  Command,
  IdCard,
} from 'lucide-react';
import { SlidingNumber } from '@/__registry__/text/sliding-number/shadcn-default';

function ManagementBar() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = 10;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex w-fit flex-wrap items-center gap-y-2 rounded-2xl border-2 border-slate-600 bg-black/90 p-2 shadow-lg">
      <div className="mx-auto flex shrink-0 items-center">
        <button
          disabled={currentPage === 1}
          className="p-1 text-gray-300 transition-colors hover:text-white disabled:text-gray-500 disabled:hover:text-gray-500"
          onClick={handlePrevPage}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="mx-2 flex items-center space-x-1 text-sm tabular-nums">
          <SlidingNumber className="text-white" padStart number={currentPage} />
          <span className="text-gray-400">/ {totalPages}</span>
        </div>
        <button
          disabled={currentPage === totalPages}
          className="p-1 text-gray-300 transition-colors hover:text-white disabled:text-gray-500 disabled:hover:text-gray-500"
          onClick={handleNextPage}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mx-3 h-5 w-px bg-slate-500" />

      <div className="mx-auto flex flex-wrap space-x-2 sm:flex-nowrap">
        <button
          className="group flex h-10 w-auto items-center overflow-hidden rounded-lg bg-zinc-600 px-2.5 py-2 text-white transition-all duration-300 hover:space-x-2"
          aria-label="Blacklist"
        >
          <Ban size={20} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-300 group-hover:max-w-[100px] group-hover:opacity-100">
            Blacklist
          </span>
        </button>
        <button
          className="group flex h-10 w-auto items-center overflow-hidden rounded-lg bg-red-800/80 px-2.5 py-2 text-red-300 transition-all duration-300 hover:space-x-2"
          aria-label="Reject"
        >
          <X size={20} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-300 group-hover:max-w-[100px] group-hover:opacity-100">
            Reject
          </span>
        </button>
        <button
          className="group flex h-10 w-auto items-center overflow-hidden rounded-lg bg-green-800/80 px-2.5 py-2 text-green-300 transition-all duration-300 hover:space-x-2"
          aria-label="Hire"
        >
          <IdCard size={20} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-300 group-hover:max-w-[100px] group-hover:opacity-100">
            Hire
          </span>
        </button>
      </div>

      <div className="mx-3 hidden h-5 w-px bg-slate-500 sm:block" />

      <div className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-teal-600 px-3 py-2 text-white transition-colors duration-300 hover:bg-teal-700 sm:w-auto">
        <span className="mr-1 text-stone-300">Move to:</span>
        <span>Interview I</span>
        <div className="mx-3 h-5 w-px bg-white/40" />
        <div className="flex items-center gap-1 rounded-md bg-white/20 px-2">
          <Command size={14} />E
        </div>
      </div>
    </div>
  );
}

export { ManagementBar };
