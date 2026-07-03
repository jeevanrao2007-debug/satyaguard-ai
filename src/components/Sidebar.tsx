import React from "react";
import { 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  BarChart3, 
  BookOpen, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  UserCheck
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onBackToLanding: () => void;
}

export default function Sidebar({ currentView, onViewChange, onBackToLanding }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Command Center", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "upload", label: "Core Scanner", icon: <UploadCloud className="w-4 h-4" /> },
    { id: "history", label: "Audit Logs", icon: <History className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics Suite", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "knowledge", label: "Trusted Library", icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Top Menu trigger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-cyber-bg border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-2" onClick={onBackToLanding}>
          <div className="p-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-display font-bold text-white text-base">SatyaGuard</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-cyber-muted hover:text-white bg-white/5 rounded-lg border border-white/5"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Actual Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-cyber-bg border-r border-white/5 p-5 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo Branding */}
        <div>
          <div 
            onClick={() => {
              onBackToLanding();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-all mb-8 border border-transparent hover:border-white/5"
          >
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl glow-indigo">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                SatyaGuard <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.25 rounded font-mono">AI</span>
              </h2>
              <p className="text-[9px] text-cyber-muted font-mono uppercase tracking-widest">Decision Intel</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                    ${isActive 
                      ? "bg-gradient-to-r from-indigo-600/20 to-cyan-500/10 border border-indigo-500/30 text-white shadow-lg shadow-indigo-500/5 font-semibold" 
                      : "text-cyber-muted hover:text-white hover:bg-white/[0.03] border border-transparent"}
                  `}
                >
                  <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-cyan-400" : "text-cyber-muted group-hover:text-cyan-400"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Identity & Exit */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">SatyaGuard AI</p>
              <p className="text-[10px] text-cyber-muted font-mono truncate">Security Operations Center</p>
            </div>
          </div>

          <button 
            onClick={onBackToLanding}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/20 text-cyber-muted hover:text-white rounded-xl text-xs font-medium transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Home
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  );
}
