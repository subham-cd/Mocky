import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, AlertCircle, ShieldCheck } from 'lucide-react';

interface ResumeUploadProps {
  onUploadSuccess: (data: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
setLoading(true);
const formData = new FormData();
formData.append('file', file);

try {
  const response = await axios.post(`${API_BASE_URL}/resume/parse`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error uploading resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-10 rounded-[2.5rem] border-white/10 shadow-[0_0_80px_-15px_rgba(59,130,246,0.2)] max-w-xl w-full mx-auto relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
      
      <div className="flex flex-col items-center">
        <div className="mb-8 relative">
           <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
           <div className="relative bg-white/5 p-5 rounded-2xl border border-white/10">
              <Upload className="w-10 h-10 text-blue-500" />
           </div>
        </div>

        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Upload Your Profile</h2>
        <p className="text-gray-500 text-sm font-medium mb-10">We support PDF resumes up to 5MB</p>
        
        <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] p-12 hover:border-blue-500/50 hover:bg-white/[0.02] transition-all cursor-pointer bg-black/20 mb-8 relative group/drop">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center text-center">
             <FileText className={`w-12 h-12 mb-4 transition-all duration-500 ${file ? 'text-green-500' : 'text-gray-600 group-hover/drop:text-blue-500'}`} />
             <p className={`font-bold transition-colors ${file ? 'text-white' : 'text-gray-500 group-hover/drop:text-gray-300'}`}>
                {file ? file.name : "Drop your PDF here"}
             </p>
             <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-2">Ready for Neural Analysis</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 w-full animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <span className="text-xs font-black uppercase tracking-wider">{error}</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
            !file || loading 
              ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' 
              : 'bg-white text-black hover:bg-blue-500 hover:text-white shadow-xl active:scale-95'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              INITIALIZING...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              ANALYZE PROFILE
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResumeUpload;
