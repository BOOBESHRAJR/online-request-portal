import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, MessageSquare, Phone, ExternalLink, 
  HelpCircle, BookOpen, ShieldCheck, LifeBuoy,
  ChevronRight, ArrowRight, ShieldAlert, Zap
} from 'lucide-react';

const Support = () => {
  const faqs = [
    {
      question: "How do I check the real-time status of my request?",
      answer: "Navigate to your personal dashboard to view the high-precision status of all active inquiries. Statuses are synchronized with our administrative oversight terminal in real-time."
    },
    {
      question: "What file specifications are supported for documentation?",
      answer: "We support standard documentation vectors including PDF, DOCX, JPG, and PNG. Assets should remain under 5MB per unit, with a global limit of 5 attachments per request."
    },
    {
      question: "What are the standard processing timelines?",
      answer: "Most inquiries are processed within 24-48 chronological business hours. System-wide notifications are dispatched immediately upon any status vector change."
    },
    {
      question: "Is my documentation integrity secured?",
      answer: "Absolutely. We utilize high-layer encryption and secure administrative protocols to ensure your data remains protected and accessible only by verified controllers."
    }
  ];

  const contactMethods = [
    {
      title: "Direct Support Endpoint",
      description: "Secure asynchronous messaging",
      value: "support@ops-portal.com",
      icon: Mail,
      color: "bg-indigo-50 text-indigo-600",
      border: "border-indigo-100"
    },
    {
      title: "System Hotline",
      description: "Direct real-time voice priority",
      value: "+1 (800) OPS-SYNC",
      icon: Phone,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100"
    },
    {
      title: "Knowledge Repository",
      description: "Deep documentation & protocols",
      value: "docs.ops-portal.com",
      icon: BookOpen,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto pb-20 space-y-12 animate-in fade-in duration-500"
    >
      {/* Dynamic Command Header */}
      <div className="relative bg-[#0f172a] rounded-[3rem] p-12 overflow-hidden shadow-2xl border border-white/5 text-center group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-110"></div>
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] -ml-40 -mb-40"></div>
         
         <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-xl rounded-[2rem] text-blue-400 mb-2 shadow-2xl border border-white/10 ring-8 ring-white/5">
                <LifeBuoy size={40} className="animate-spin-slow" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight leading-none uppercase">Help Center</h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">Access our global knowledge repository, explore frequently asked protocols, or reach out to our dedicated technical support cluster.</p>
         </div>
      </div>

      {/* Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {contactMethods.map((method, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${method.color} opacity-10 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}></div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${method.color} ${method.border} border shadow-inner group-hover:rotate-6 transition-transform relative z-10`}>
              <method.icon size={30} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 relative z-10 uppercase tracking-tight">{method.title}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium relative z-10">{method.description}</p>
            <button className="flex items-center gap-3 text-sm font-black text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              {method.value} <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Detailed Protocols */}
         <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-10 sm:p-14">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl">
                     <HelpCircle size={28} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Security Protocols</h2>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">Frequently Asked Operational Guidelines</p>
                  </div>
               </div>
               
               <div className="space-y-10">
                  {faqs.map((faq, i) => (
                  <div key={i} className="group cursor-default">
                     <h4 className="text-lg font-black text-slate-800 flex items-start gap-4 mb-4 transition-colors group-hover:text-indigo-600">
                           <span className="text-indigo-500 font-black flex-shrink-0 mt-0.5 bg-indigo-50 w-8 h-8 rounded-lg flex items-center justify-center text-xs">Q{i+1}</span> {faq.question}
                     </h4>
                     <p className="text-slate-500 leading-relaxed font-medium pl-12 border-l-4 border-slate-50 group-hover:border-indigo-100 transition-all text-sm">
                        {faq.answer}
                     </p>
                  </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Call to Action Sidebar */}
         <div className="space-y-8">
            <div className="bg-[#0f172a] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10 flex flex-col items-center text-center gap-8">
                   <div className="w-20 h-20 bg-white/10 backdrop-blur-xl shadow-2xl rounded-[2rem] flex items-center justify-center text-blue-400 rotate-12 group-hover:rotate-0 transition-transform duration-700 border border-white/10">
                      <Zap size={40} />
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-2xl font-black tracking-tight leading-tight uppercase">Emergency Node</h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] leading-relaxed">Dedicated administrative escalation cluster for critical system anomalies.</p>
                   </div>
                   <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 shadow-blue-500/20">
                      Escalate Inquiry
                   </button>
                </div>
            </div>

            <div className="bg-indigo-50 p-10 rounded-[3.5rem] border border-indigo-100 shadow-sm transition-all hover:shadow-xl group relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/50 rounded-full blur-2xl -mr-12 -mb-12"></div>
               <div className="flex items-center gap-6 mb-8 relative z-10">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                     <ShieldCheck size={28} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Cluster Status</p>
                     <p className="text-lg font-black text-slate-900 leading-none">Security Healthy</p>
                  </div>
               </div>
               <p className="text-[11px] font-bold text-slate-500 leading-relaxed relative z-10 mb-8">All support endpoints are verified and operating at maximum bandwidth synchronization.</p>
               <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] relative z-10">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Full System Uptime
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default Support;
