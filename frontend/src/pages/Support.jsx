import React from 'react';
import { Mail, MessageSquare, Phone, ExternalLink, HelpCircle, BookOpen, ShieldCheck, LifeBuoy } from 'lucide-react';

const Support = () => {
  const faqs = [
    {
      question: "How do I check the status of my request?",
      answer: "You can view the real-time status of all your requests directly on your personal dashboard. Statuses are updated by our administrators as they process your inquiry."
    },
    {
      question: "What file types are supported for attachments?",
      answer: "We support standard document and image formats including PDF, DOCX, JPG, and PNG. Each file must be under 5MB, with a maximum of 5 attachments per request."
    },
    {
      question: "How long does it typically take to get a response?",
      answer: "Most requests are reviewed within 24-48 business hours. You will receive an email notification as soon as there is an update or a response from our team."
    },
    {
        question: "Is my personal information secure?",
        answer: "Absolutely. We use industry-standard encryption and security protocols to ensure your data is protected and only accessible by authorized personnel."
    }
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Send us a detailed message",
      value: "support@portal.com",
      icon: Mail,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Technical Hotline",
      description: "Direct line for urgent issues",
      value: "+1 (800) 123-4567",
      icon: Phone,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Knowledge Base",
      description: "Detailed guides and docs",
      value: "docs.portal.com",
      icon: BookOpen,
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-12 space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl text-blue-600 mb-2 shadow-sm border border-blue-100/50">
            <LifeBuoy size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">How can we help?</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">Search our knowledge base, check the FAQs, or get in touch with our dedicated support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {contactMethods.map((method, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${method.color} group-hover:scale-110 transition-transform`}>
              <method.icon size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{method.title}</h3>
            <p className="text-sm text-slate-500 mb-3">{method.description}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
              {method.value} <ExternalLink size={14} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <HelpCircle className="text-blue-600" size={28} /> Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-3">
                <h4 className="text-lg font-bold text-slate-800 flex items-start gap-3">
                    <span className="text-blue-500 font-black mt-0.5">Q.</span> {faq.question}
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium pl-8 border-l-2 border-slate-100">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center p-8 bg-slate-900 rounded-[2rem] text-white">
          <div className="flex justify-center mb-4">
              <ShieldCheck size={40} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Need a custom solution?</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">Our enterprise team is available for deep integrations and specialized support requirements.</p>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              Contact Sales
          </button>
      </div>
    </div>
  );
};

export default Support;
