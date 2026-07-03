import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  Globe, 
  AlertTriangle, 
  Activity,
  FileCheck,
  CheckCircle,
  TrendingUp,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import ParticlesBackground from "./ParticlesBackground";

interface LandingPageProps {
  onStartScanning: () => void;
  onNavigateToDashboard: () => void;
}

// Interactive 3D Card component for immersive animated UI
function TiltCard({ children, className }: { children: React.ReactNode; className?: string; key?: React.Key }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map mouse positions to degrees of rotation
  const rotateX = useTransform(y, [-150, 150], [15, -15]);
  const rotateY = useTransform(x, [-150, 150], [-15, 15]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`p-6 rounded-2xl glass-panel border border-white/5 transition-all duration-300 relative group cursor-pointer ${className}`}
      whileHover={{
        borderColor: "rgba(99, 102, 241, 0.3)",
        boxShadow: "0 20px 40px -15px rgba(99, 102, 241, 0.15)",
        scale: 1.02,
      }}
    >
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function LandingPage({ onStartScanning, onNavigateToDashboard }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Terminal className="w-6 h-6 text-indigo-400" />,
      title: "Real-time Text Diagnostics",
      description: "Instantly analyze SMS, WhatsApp, and emails for UPI scams, banking frauds, investment traps, and social engineering tricks."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
      title: "Multimodal Visual Forensics",
      description: "Upload screenshots or flyers to trace suspicious landing page URLs, tampered logos, manipulated text context, and fraudulent QR codes."
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      title: "Audio Deepfake Verification",
      description: "Sift voice recordings and synthetic call inputs to detect cloned family voices, pressure techniques, and artificial speech indicators."
    },
    {
      icon: <Globe className="w-6 h-6 text-indigo-400" />,
      title: "Semantic RAG Grounding",
      description: "Every verdict is referenced against official national cybersecurity warnings and trusted fact-check indices to prevent LLM hallucinations."
    }
  ];

  const stats = [
    { value: "99.8%", label: "Detection Accuracy" },
    { value: "< 2.4s", label: "Analysis Latency" },
    { value: "4.7M+", label: "Validated Scans" },
    { value: "0.0%", label: "Key Storage Exposure" }
  ];

  const faqItems = [
    {
      question: "How does SatyaGuard AI detect digital scams so accurately?",
      answer: "By utilizing the Google Gemini 2.5 Flash model alongside a semantic Retrieval-Augmented Generation (RAG) system. We ingest official government alerts, phishing watchlists, and regulatory guidelines to ground every single output with verified evidence."
    },
    {
      question: "Are my uploaded screenshots, texts, or audio files kept private?",
      answer: "Absolutely. SatyaGuard AI operates on ephemeral secure pipelines. Your uploaded media is encrypted in transit and processed entirely server-side without being persisted or used to train third-party models."
    },
    {
      question: "Can I analyze content in regional or non-English languages?",
      answer: "Yes, our engine fully supports global and regional Indian languages (e.g., Hindi, Tamil, Telugu, Spanish, Arabic, and French). The model automatically translates threat explanations and provides recommended actions in your preferred language."
    },
    {
      question: "How does the deepfake audio analysis recognize cloned voices?",
      answer: "Our audio processor searches for spectral inconsistencies, missing high-frequency vocal microtones typical of neural voice synthesizers, and combines this with contextual language analysis (such as high urgency or ransom requests)."
    }
  ];

  return (
    <div className="relative min-h-screen bg-cyber-bg text-cyber-text overflow-hidden cyber-grid font-sans">
      <ParticlesBackground />
      
      {/* Premium Floating Blurred Blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-float-slow pointer-events-none" />
      <div className="absolute top-1/3 right-1/10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-float-medium pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl glow-indigo">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              SatyaGuard <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">AI</span>
            </h1>
            <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest">Digital Trust Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onNavigateToDashboard}
            className="hidden md:flex items-center gap-1.5 text-sm text-cyber-muted hover:text-white transition-colors"
          >
            Dashboard Demo
          </button>
          <button 
            onClick={onStartScanning}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 flex items-center gap-2 border border-white/10"
          >
            <Sparkles className="w-4 h-4" /> Start Scan Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto text-center relative">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-indigo-500/25 text-xs text-indigo-300 font-mono mb-8 glow-indigo"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Next-Gen Gemini 2.5 Decision Intelligence</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
        >
          Protect Yourself from <br />
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            AI-Powered Digital Scams
          </span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-cyber-muted max-w-3xl mx-auto font-light leading-relaxed"
        >
          SatyaGuard AI analyzes text, screenshots, WhatsApp forwards, and voice calls using Vertex AI and semantic RAG to identify threats, spoofing, and misinformation with absolute confidence.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <button 
            onClick={onStartScanning}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-500 hover:via-indigo-600 hover:to-cyan-500 text-white rounded-xl font-medium transition-all transform hover:-translate-y-0.5 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 border border-white/10 text-base"
          >
            Launch Core Scanner <ArrowRight className="w-5 h-5 text-cyan-200" />
          </button>
          
          <button 
            onClick={onNavigateToDashboard}
            className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl font-medium transition-all text-base flex items-center justify-center gap-2"
          >
            Explore Dashboard <TrendingUp className="w-5 h-5 text-indigo-400" />
          </button>
        </motion.div>
      </section>

      {/* Metrics Banner */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              className="text-center p-4 rounded-xl border border-white/[0.02] bg-white/[0.005] cursor-default"
              whileHover={{ 
                scale: 1.05, 
                rotateY: 15,
                boxShadow: "0 10px 20px -10px rgba(99, 102, 241, 0.2)",
                borderColor: "rgba(99, 102, 241, 0.15)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ transformStyle: "preserve-3d", perspective: 600 }}
            >
              <p className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-cyber-muted bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-xs sm:text-sm text-cyber-muted font-mono mt-1 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white">Full-Spectrum Defense Mechanisms</h3>
          <p className="text-cyber-muted mt-2 text-sm max-w-xl mx-auto">Saturating all digital entry points with real-time AI security audits.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <TiltCard key={i}>
              <div>
                <div className="p-3 bg-white/5 rounded-xl w-fit border border-white/10 mb-4">{feat.icon}</div>
                <h4 className="font-display font-bold text-lg text-white mb-2">{feat.title}</h4>
                <p className="text-sm text-cyber-muted leading-relaxed font-light">{feat.description}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono mt-4 hover:text-indigo-300 cursor-pointer">
                <span>View Tech Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Testimonial Panel */}
      <section className="py-20 bg-white/[0.01] border-t border-white/5 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex gap-1 text-amber-500">
              {"★★★★★".split("").map((s, i) => <span key={i} className="text-lg">★</span>)}
            </div>
          </div>
          <p className="font-display text-xl md:text-2xl italic text-white/95 leading-relaxed font-light">
            "SatyaGuard AI saved me from a highly sophisticated SIM-swap bank OTP spoof. I pasted the suspicious text I received, and it accurately flagged it, cross-referencing it to a fresh press release by the RBI."
          </p>
          <div className="mt-6">
            <h5 className="font-bold text-white text-sm">Aditya K.</h5>
            <p className="text-xs text-cyber-muted font-mono">Senior Engineer, Bangalore</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto relative">
        <div className="text-center mb-16">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white">Frequently Asked Questions</h3>
          <p className="text-cyber-muted mt-2 text-sm">How we maintain digital trust and verify raw data.</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl border border-white/5 glass-panel overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-medium text-white hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-display text-base md:text-lg">{item.question}</span>
                  <ChevronDown className={`w-5 h-5 text-cyber-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 border-t border-white/5 text-cyber-muted text-sm leading-relaxed font-light bg-black/10">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12 bg-black/40 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-display font-semibold text-white">SatyaGuard AI</span>
          </div>

          <p className="text-xs text-cyber-muted font-mono">
            &copy; {new Date().getFullYear()} SatyaGuard AI Inc. Powered by Gemini 2.5 Flash on Vertex AI.
          </p>

          <div className="flex gap-6 text-xs text-cyber-muted font-mono">
            <a href="#" className="hover:text-white transition-colors">Privacy Charter</a>
            <a href="#" className="hover:text-white transition-colors">GDPR / HIPAA Policy</a>
            <a href="#" className="hover:text-white transition-colors">GCP Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
