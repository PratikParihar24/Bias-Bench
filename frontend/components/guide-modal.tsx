import { X, Shield, Activity, Scale, Info, Zap } from "lucide-react";

export function GuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2 text-white">
            <Info size={18} className="text-blue-400" />
            <span className="font-semibold tracking-wide">BiasBench User Guide</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto scrollbar-thin text-sm space-y-6">
          
          <div className="space-y-2">
            <h3 className="text-white font-medium text-lg flex items-center gap-2">
              <Scale size={16} className="text-pink-400" />
              What is BiasBench?
            </h3>
            <p className="text-gray-400 leading-relaxed">
              BiasBench is an AI forensics laboratory. It allows you to fire the exact same prompt at multiple top-tier AI models simultaneously, directly comparing how different corporate architectures handle sensitive, controversial, or highly technical questions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-medium text-lg flex items-center gap-2">
              <Shield size={16} className="text-green-400" />
              How does the "Judge AI" work?
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Once all models have generated their answers, BiasBench sends them blindly to an impartial Judge AI. The Judge reads all responses and generates a <strong>Subjectivity Score (0-100)</strong>. A score of 0 means the answers are purely factual (like code or math). A score of 100 means the answers are highly opinionated.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-medium text-lg flex items-center gap-2">
              <Activity size={16} className="text-purple-400" />
              Your History Vault
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Every audit you run is securely saved to your local SQLite database. You can access your past audits via the sidebar menu. We do not store your data on external servers—everything lives on your machine.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-medium text-lg flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              Pro Tips
            </h3>
            <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-1 ml-2">
              <li>Click the <strong>Maximize</strong> icon on any model column to read large code blocks in full screen.</li>
              <li>Click the <strong>Copy</strong> icon to instantly grab a model's raw markdown output.</li>
              <li>Use the <strong>New Audit</strong> button in the sidebar to instantly clear the board.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}