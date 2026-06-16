import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../services/authService';
import logoImg from '../../assets/logo.jpg';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot-password'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerOtp, setRegisterOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [isForgotOtpSent, setIsForgotOtpSent] = useState(false);
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await authService.loginWithGoogle(credentialResponse.credential);
      if (response && response.success) {
        setSuccessMsg('Đăng nhập Google thành công! Đang thiết lập phiên làm việc...');
        setTimeout(() => {
          onAuthSuccess(response.data.user);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(response?.message || 'Xác thực Google không thành công.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin đăng ký!');
      return;
    }
    if (registerPassword.length < 6) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await authService.sendOtp(registerEmail);
      if (response && response.success) {
        setIsOtpSent(true);
        setSuccessMsg('Đã gửi mã OTP đến email của bạn! Vui lòng kiểm tra hộp thư.');
      } else {
        setErrorMsg(response?.message || 'Không thể gửi mã xác nhận.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi kết nối khi gửi mã OTP!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerOtp) {
      setErrorMsg('Vui lòng nhập mã OTP!');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await authService.register(registerName, registerEmail, registerPassword, registerOtp);
      if (response && response.success) {
        setSuccessMsg('Đăng ký thành công! Hãy đăng nhập bằng tài khoản mới.');
        setTimeout(() => {
          // Switch to login tab and autofill email
          setLoginEmail(registerEmail);
          setActiveTab('login');
          setSuccessMsg('');
          setErrorMsg('');
          setIsOtpSent(false);
          setRegisterOtp('');
        }, 1800);
      } else {
        setErrorMsg(response?.message || 'Đăng ký không thành công. Mã OTP không đúng hoặc email đã tồn tại!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg('Vui lòng nhập email!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await authService.sendOtp(forgotEmail, 'forgot_password');
      if (response && response.success) {
        setIsForgotOtpSent(true);
        setSuccessMsg('Đã gửi mã khôi phục! Vui lòng kiểm tra email của bạn.');
      } else {
        setErrorMsg(response?.message || 'Không thể gửi mã khôi phục.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi kết nối khi gửi mã khôi phục!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !forgotNewPassword || !forgotConfirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await authService.resetPassword(forgotEmail, forgotNewPassword, forgotOtp);
      if (response && response.success) {
        setSuccessMsg('Đổi mật khẩu thành công! Hãy đăng nhập lại.');
        setTimeout(() => {
          setLoginEmail(forgotEmail);
          setActiveTab('login');
          setSuccessMsg('');
          setErrorMsg('');
          setIsForgotOtpSent(false);
          setForgotOtp('');
          setForgotNewPassword('');
          setForgotConfirmPassword('');
        }, 1800);
      } else {
        setErrorMsg(response?.message || 'Đổi mật khẩu thất bại. Mã OTP có thể đã sai.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi kết nối khi đổi mật khẩu!');
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
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200/80 shadow-lg shadow-black/5">
            <img src={logoImg} alt="Travelist Logo" className="w-full h-full object-cover" />
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
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); setIsOtpSent(false); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border-none cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-heritage-amber shadow-sm'
                : 'text-gray-500 hover:text-gray-800 bg-transparent'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); setIsOtpSent(false); }}
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
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-1">
              <button 
                type="button" 
                onClick={() => { setActiveTab('forgot-password'); setErrorMsg(''); setSuccessMsg(''); setIsForgotOtpSent(false); }}
                className="text-xs font-semibold text-heritage-amber hover:text-heritage-gold bg-transparent border-none cursor-pointer"
              >
                Quên mật khẩu?
              </button>
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
            
            <div className="flex items-center gap-2 my-1">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400 font-medium">Hoặc tiếp tục với</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Đăng nhập bằng Google thất bại!')}
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
                text="continue_with"
              />
            </div>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'register' && (
          <form onSubmit={isOtpSent ? handleRegisterSubmit : handleSendOtp} className="flex flex-col gap-4">
            
            <div className={`flex flex-col gap-4 transition-all duration-300 ${isOtpSent ? 'opacity-50 pointer-events-none hidden' : 'block'}`}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">Họ và Tên</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Nguyen Van A"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                    required={!isOtpSent}
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
                    required={!isOtpSent}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">Mật khẩu mới</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                    required={!isOtpSent}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">Xác nhận mật khẩu</label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                    required={!isOtpSent}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                  >
                    {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {isOtpSent && (
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <label className="text-xs font-bold text-gray-500">Mã xác nhận (OTP)</label>
                <div className="relative flex items-center">
                  <Sparkles className="absolute left-3 w-4 h-4 text-heritage-amber" />
                  <input
                    type="text"
                    value={registerOtp}
                    onChange={(e) => setRegisterOtp(e.target.value)}
                    placeholder="Nhập 6 số từ Email"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-heritage-amber/50 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-center tracking-[0.5em] font-extrabold text-lg transition-all bg-amber-50/20"
                    required={isOtpSent}
                  />
                </div>
                <div className="flex justify-between items-center px-1 mt-1">
                  <span className="text-[10px] text-gray-400">Đã gửi mã đến: <b className="text-gray-600">{registerEmail}</b></span>
                  <button type="button" onClick={() => setIsOtpSent(false)} className="text-[10px] text-blue-600 font-bold hover:underline bg-transparent border-none cursor-pointer">Sửa Email</button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-bold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 mt-2 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (isOtpSent ? 'Xác nhận & Hoàn tất' : 'Gửi mã xác nhận')}
            </button>

            {!isOtpSent && (
              <>
                <div className="flex items-center gap-2 my-1">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs text-gray-400 font-medium">Hoặc tiếp tục với</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErrorMsg('Đăng ký bằng Google thất bại!')}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    width="100%"
                    text="continue_with"
                  />
                </div>
              </>
            )}
          </form>
        )}

        {/* Forgot Password Form */}
        {activeTab === 'forgot-password' && (
          <form onSubmit={isForgotOtpSent ? handleResetPasswordSubmit : handleSendForgotOtp} className="flex flex-col gap-4">
            
            <div className={`flex flex-col gap-4 transition-all duration-300 ${isForgotOtpSent ? 'opacity-50 pointer-events-none hidden' : 'block'}`}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">Email khôi phục</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                    required={!isForgotOtpSent}
                  />
                </div>
              </div>
            </div>

            {isForgotOtpSent && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">Mã xác nhận (OTP)</label>
                  <div className="relative flex items-center">
                    <Sparkles className="absolute left-3 w-4 h-4 text-heritage-amber" />
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="Nhập 6 số từ Email"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-heritage-amber/50 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-center tracking-[0.5em] font-extrabold text-lg transition-all bg-amber-50/20"
                      required={isForgotOtpSent}
                    />
                  </div>
                  <div className="flex justify-between items-center px-1 mt-1">
                    <span className="text-[10px] text-gray-400">Đã gửi mã đến: <b className="text-gray-600">{forgotEmail}</b></span>
                    <button type="button" onClick={() => setIsForgotOtpSent(false)} className="text-[10px] text-blue-600 font-bold hover:underline bg-transparent border-none cursor-pointer">Sửa Email</button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">Mật khẩu mới</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                      required={isForgotOtpSent}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">Xác nhận mật khẩu mới</label>
                  <div className="relative flex items-center">
                    <ShieldCheck className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-1 focus:ring-heritage-amber/30 text-sm font-medium transition-all bg-gray-50/50"
                      required={isForgotOtpSent}
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-bold text-sm py-3.5 rounded-2xl border-none cursor-pointer transition-all duration-300 shadow-md shadow-heritage-amber/10 mt-2 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (isForgotOtpSent ? 'Lưu mật khẩu mới' : 'Nhận mã khôi phục')}
            </button>
            
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
