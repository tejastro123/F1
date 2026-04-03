import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SyncModal({ isOpen, onClose, onSync }) {
  const [syncSchedule, setSyncSchedule] = useState(true);
  const [fetchWikiInfo, setFetchWikiInfo] = useState(true);
  const [process2026, setProcess2026] = useState(true);
  const [file, setFile] = useState(null);
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (process2026 && !file) {
      alert("Please upload the F1_2026_PRO.xlsx file for the 2026 data sync.");
      return;
    }
    onSync({ syncSchedule, fetchWikiInfo, process2026, file });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-xl border border-white/10 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-f1-black border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          
          <h2 className="text-2xl font-black text-white mb-4">Sync from Internet</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Configure what F1 data you want to fetch and update from external sources.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={syncSchedule} 
                onChange={(e) => setSyncSchedule(e.target.checked)}
                className="w-5 h-5 accent-f1-admin"
              />
              <div>
                <div className="font-bold text-white">Update Race Calendar</div>
                <div className="text-xs text-gray-400">Fetches the schedule & validates race dates</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={fetchWikiInfo} 
                onChange={(e) => setFetchWikiInfo(e.target.checked)}
                className="w-5 h-5 accent-f1-admin"
              />
              <div>
                <div className="font-bold text-white">Fetch Wikipedia Info</div>
                <div className="text-xs text-gray-400">Scrapes summaries for Drivers, Teams, and Tracks</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={process2026} 
                onChange={(e) => setProcess2026(e.target.checked)}
                className="w-5 h-5 accent-f1-admin"
              />
              <div>
                <div className="font-bold text-white">Process 2026 Custom Data</div>
                <div className="text-xs text-gray-400">Upload standard Excel schema for 2026 missing data</div>
              </div>
            </label>
            
            {process2026 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="pl-11 pr-3"
              >
                <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center hover:bg-white/5">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    id="excel-upload"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                    <span className="text-2xl mb-2">📄</span>
                    <span className="text-sm font-bold text-white">
                      {file ? file.name : "Click to attach F1_2026_PRO.xlsx"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">Excel file with 2026 data</span>
                  </label>
                </div>
              </motion.div>
            )}

            <div className="pt-6 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2 rounded-lg font-bold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-f1-admin hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(255,40,0,0.4)]"
              >
                Confirm Sync
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
