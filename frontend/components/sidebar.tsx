"use client"

import { useState , useEffect } from 'react' ; 
import { Menu , X , History , ChevronRight , Plus } from "lucide-react"

export function Sidebar({onSelectAudit, onNewAudit} : {onSelectAudit?: (audit: any) => void, onNewAudit?: () => void}) {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([])
    const [ loading , setLoading] = useState(true)

    // fetch from your new SQLitee db when the drawer opens 

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://127.0.0.1:8000/api/history');
            const json = await res.json();

            if(json.status === 'success') {
                setHistory(json.data);
            }
        }
        catch (error) {
            console.error("Error fetching history:", error);
        } finally{
            setLoading(false);
        }
    };

    return (
        <>
        {/* 2. The Floating Hamburger Button */}
        <button 
            onClick={() => setIsOpen(true)}
            className="fixed top-5 left-5 z-40 p-2 rounded-lg bg-black/40 border/40 border border-white/10 text-white hover:bg-white/10 transition backdrop-blur-md"
            >
                <Menu size={24} />
        </button>

        {/* 3. The Dark Background Overlay */}

        {isOpen && (<div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}

        />)}

        {/* 4. The Sliding Drawer */ }
        <div 
        className={`fixed top-0 left-0 h-full w-80 bg-[#0a0a0a] border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <History size={20} className="text-blue-500" />
            Audit History
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* New Audit Button Section */}
        <div className="p-4 border-b border-white/10">
          <button 
            onClick={() => {
              if (onNewAudit) onNewAudit();
              setIsOpen(false); // Close the drawer automatically
            }}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            New Audit
          </button>
        </div>
        
        {/* Dynamic History List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="text-gray-400 text-sm text-center mt-10 animate-pulse">Loading memory banks...</div>
          ) : history.length === 0 ? (
            <div className="text-gray-400 text-sm text-center mt-10">No past audits found.</div>
          ) : (
            history.map((audit) => (
              <button 
                key={audit.id}
                onClick={() => {
                   if (onSelectAudit) onSelectAudit(audit);
                   setIsOpen(false); // Close drawer when they click an old audit
                }}
                className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition group"
              >
                <div className="text-sm font-medium text-white line-clamp-2 pr-4">
                  "{audit.prompt}"
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-400 bg-black/40 px-2 py-1 rounded border border-white/5">
                    Score: {audit.verdict?.subjectivity_score || 'N/A'}
                  </span>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400 transition" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

