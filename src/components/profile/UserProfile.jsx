import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, Camera, Save, Lock, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';

export default function UserProfile({ currentUser, onUpdateSuccess }) {
  const { language, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'security'
  
  // Form states
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update form if user changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-heritage-amber border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Họ và tên không được để trống!');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const response = await authService.updateProfile(currentUser.id, fullName);
      if (response && response.success) {
        setSuccessMsg('Cập nhật thông tin thành công!');
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        setErrorMsg(response?.message || 'Cập nhật thất bại!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi hệ thống khi cập nhật!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các trường mật khẩu!');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu không khớp!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await authService.changePassword(currentUser.id, oldPassword, newPassword);
      if (response && response.success) {
        setSuccessMsg('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(response?.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi hệ thống khi đổi mật khẩu! Có thể mật khẩu cũ không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await authService.updateAvatar(currentUser.id, file);
      if (response && response.success) {
        setSuccessMsg('Đã cập nhật ảnh đại diện mới!');
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        setErrorMsg('Không thể cập nhật ảnh đại diện!');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Đã xảy ra lỗi khi tải ảnh lên!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-12 animate-fade-in">
      {/* Full Width Hero Banner */}
      <div className="w-full h-64 md:h-80 bg-gradient-to-r from-heritage-amber/90 via-heritage-gold to-ricefield-green/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 md:-mt-32">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Profile Sidebar */}
          <div className="w-full lg:w-1/3 bg-white rounded-3xl p-6 shadow-2xl shadow-black/5 border border-gray-100/80 flex flex-col items-center text-center backdrop-blur-xl">
          
          <div className="relative mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white shadow-xl relative group-hover:scale-105 transition-transform duration-500">
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
                <label className="absolute bottom-1 right-1 w-10 h-10 bg-heritage-amber rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-heritage-gold hover:scale-110 transition-all duration-300">
                  <Camera className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={loading} />
              </label>
            </div>
          </div>
          
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{currentUser.fullName}</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">{currentUser.email}</p>
          <div className="px-4 py-1.5 bg-ricefield-green/10 text-ricefield-green rounded-full text-xs font-bold border border-ricefield-green/20 shadow-sm">
            {currentUser.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
          </div>
        </div>

        {/* Profile Content Area */}
        <div className="w-full lg:w-2/3 bg-white rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/5 border border-gray-100/80">
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
            <button
              onClick={() => { setActiveTab('info'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'info'
                  ? 'bg-heritage-amber/10 text-heritage-amber shadow-sm border border-heritage-amber/20'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 bg-transparent'
              }`}
            >
              <User className={`w-4.5 h-4.5 ${activeTab === 'info' ? 'animate-bounce-in' : ''}`} />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => { setActiveTab('security'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'security'
                  ? 'bg-heritage-amber/10 text-heritage-amber shadow-sm border border-heritage-amber/20'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 bg-transparent'
              }`}
            >
              <ShieldCheck className={`w-4.5 h-4.5 ${activeTab === 'security' ? 'animate-bounce-in' : ''}`} />
              Bảo mật
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold mb-6 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm font-semibold mb-6 animate-bounce-in">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Họ và Tên</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-2 focus:ring-heritage-amber/20 text-sm font-medium transition-all bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 opacity-70">
                <label className="text-sm font-bold text-gray-700">Địa chỉ Email (Không thể thay đổi)</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-100 text-sm font-medium text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-heritage-amber hover:bg-heritage-gold disabled:bg-gray-300 text-white font-bold py-3.5 rounded-2xl border-none cursor-pointer transition-all shadow-lg shadow-heritage-amber/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Mật khẩu hiện tại</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
                  <input
                    type={showOldPwd ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu cũ"
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-2 focus:ring-heritage-amber/20 text-sm font-medium transition-all bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPwd(!showOldPwd)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
                  >
                    {showOldPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Mật khẩu mới</label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-4 w-5 h-5 text-heritage-amber" />
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-2 focus:ring-heritage-amber/20 text-sm font-medium transition-all bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
                  >
                    {showNewPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Xác nhận mật khẩu mới</label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-4 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:border-heritage-amber focus:ring-2 focus:ring-heritage-amber/20 text-sm font-medium transition-all bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
                  >
                    {showConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-bold py-3.5 rounded-2xl border-none cursor-pointer transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Cập nhật mật khẩu
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
    </div>
  );
}
