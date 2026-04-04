import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  UploadCloud, CheckCircle2, FileUp, Loader2, 
  X, FileText, ArrowLeft, ChevronRight, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateRequest = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Submit Request | Request Portal";
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Total files limit check
    if (files.length + selectedFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    const validNewFiles = [];
    
    for (const file of selectedFiles) {
      // Type validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a valid file type. Only PDF and Images (JPG, PNG) are allowed.`);
        continue;
      }

      // Size validation
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" is too large. Maximum size is 5MB.`);
        continue;
      }

      validNewFiles.push({
        file: file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        size: file.size,
        type: file.type
      });
    }

    if (validNewFiles.length > 0) {
      setFiles([...files, ...validNewFiles]);
    }
  };

  const removeFile = (index) => {
    const fileToRemove = files[index];
    if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category || !description) {
      return toast.error("Please provide all required details.");
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      
      files.forEach(f => {
        formData.append('documents', f.file);
      });

      await api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Your request has been submitted successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Request</h1>
        <p className="text-slate-500 font-medium leading-relaxed">Fill out the form below to submit a new information request. Our team will review it and get back to you shortly.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Request Subject</label>
                  <div className="relative group">
                     <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input 
                       type="text" 
                       required
                       className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 text-[15px]"
                       placeholder="e.g. Sales report for Q1"
                       value={title}
                       onChange={(e) => setTitle(e.target.value)}
                     />
                  </div>
               </div>
               
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Request Category</label>
                  <div className="relative group">
                    <select 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-800 appearance-none cursor-pointer text-[15px]"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="" disabled>Select a category...</option>
                      <option value="General Information">General Information</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing & Payments">Billing & Payments</option>
                      <option value="Document Retrieval">Document Retrieval</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Detailed Description</label>
              <textarea 
                required
                rows="5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none leading-relaxed text-[15px]"
                placeholder="Describe your request in detail. More information helps us process it faster."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1 mb-1">
                 <label className="text-sm font-bold text-slate-700">Attachments</label>
                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{files.length} / 10 files</span>
              </div>
              <div className={`relative border-2 border-dashed rounded-xl transition-all p-8 flex flex-col items-center justify-center text-center
                 ${files.length > 0 ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
                <input 
                  type="file" 
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                   <UploadCloud size={24} />
                </div>
                <h4 className="font-bold text-slate-800">Upload documents</h4>
                <p className="text-sm font-medium text-slate-500 mt-1 max-w-xs">
                   Drag & drop or click to choose files. PDF, JPG, or PNG (Max 10 files, 5MB each).
                </p>
              </div>

              {files.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {files.map((f, i) => (
                        <div key={i} className="group bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all animate-in slide-in-from-bottom-2">
                           <div className="flex items-center gap-4 overflow-hidden">
                              <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden relative group-hover:bg-blue-50 transition-colors">
                                 {f.preview ? (
                                    <img src={f.preview} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                 ) : (
                                    <FileText size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                 )}
                              </div>
                              <div className="overflow-hidden">
                                 <p className="text-sm font-black text-slate-900 truncate tracking-tight">{f.name}</p>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{(f.size / 1024 / 1024).toFixed(2)} MB • {f.type.split('/')[1]?.toUpperCase()}</p>
                              </div>
                           </div>
                           <button 
                             type="button"
                             onClick={() => removeFile(i)}
                             className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-all shrink-0 hover:rotate-90"
                           >
                              <X size={18} />
                           </button>
                        </div>
                    ))}
                 </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
               <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold italic">
                  <Info size={14} />
                  Your request is safe and only visible to authorized personnel.
               </div>
               
               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full sm:w-auto min-w-[200px] bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-lg shadow-lg hover:shadow-blue-500/20 shadow-slate-900/10 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
               >
                 {loading ? (
                    <>
                       <Loader2 className="animate-spin" size={18} />
                       <span>Submitting...</span>
                    </>
                 ) : (
                    <>
                      <span>Submit Request</span>
                      <ChevronRight size={18} />
                    </>
                 )}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
