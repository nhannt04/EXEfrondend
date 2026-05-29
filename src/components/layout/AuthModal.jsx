import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import authService from '../../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin đăng nhập!');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await authService.login(loginEmail, loginPassword);
      if (response && response.success) {
        setSuccessMsg('Đăng nhập thành công! Đang thiết lập phiên làm việc...');
        setTimeout(() => {
          onAuthSuccess(response.data.user);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(response?.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin đăng ký!');
      return;
    }
    if (registerPassword.length < 6) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await authService.register(registerName, registerEmail, registerPassword);
      if (response && response.success) {
        setSuccessMsg('Đăng ký thành công! Hãy đăng nhập bằng tài khoản mới.');
        setTimeout(() => {
          // Switch to login tab and autofill email
          setLoginEmail(registerEmail);
          setActiveTab('login');
          setSuccessMsg('');
          setErrorMsg('');
        }, 1800);
      } else {
        setErrorMsg(response?.message || 'Đăng ký không thành công. Email có thể đã tồn tại!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white/95 border border-gray-150 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-8 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer border-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center gap-1 text-center mb-6">
          <div className="bg-heritage-amber p-3 rounded-2xl text-white shadow-lg shadow-heritage-amber/20">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="font-outfit text-2xl font-extrabold text-gray-900 tracking-tight mt-3">
            Chào mừng bạn đến với <span className="text-heritage-amber">Travelist</span>
          </h2>
          <p className="text-[11.5px] text-gray-400 font-medium tracking-wide uppercase leading-none mt-1">
            Hoi An Smart Travel Partner
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50 mb-6">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-none cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-heritage-amber shadow-sm'
                : 'text-gray-500 hover:text-gray-800 bg-transparent'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-none cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-heritage-amber shadow-sm'
                : 'text-gray-500 hover:text-gray-800 bg-transparent'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Alerts Block */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200/60 rounded-2xl text-red-600 text-xs font-semibold mb-4 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 p-3.5 bg-green-50 border border-green-200/60 rounded-2xl text-green-600 text-xs font-semibold mb-4 animate-bounce-in">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-heritage-gold" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Địa chỉ Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Mật khẩu</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-bold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 mt-2 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Xác nhận Đăng nhập'}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Họ và Tên</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Nguyễn Du Khách"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Địa chỉ Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">Mật khẩu mới</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-bold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 mt-2 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Tạo tài khoản mới'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
