import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext';
import { AdminUser, AdminRole } from '../../types/voting';
import {
  KeyRound,
  ShieldCheck,
  UserCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Trash2,
  ShieldAlert,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';

export const AdminPasswordManager: React.FC = () => {
  const {
    currentAdmin,
    admins,
    updateAdminPassword,
    resetAdminPassword,
    addAdminUser,
    deleteAdminUser,
  } = useVoting();

  const [isSaving, setIsSaving] = useState(false);

  // Self change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Super Admin target change password modal state
  const [selectedTargetAdmin, setSelectedTargetAdmin] = useState<AdminUser | null>(null);
  const [targetNewPassword, setTargetNewPassword] = useState('');
  const [targetConfirmPassword, setTargetConfirmPassword] = useState('');
  const [showTargetPass, setShowTargetPass] = useState(false);

  // New admin modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminFullName, setNewAdminFullName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminTitle, setNewAdminTitle] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('OPERATOR_TPS');
  const [newAdminPassword, setNewAdminPassword] = useState('admin123');

  // Feedback notifications
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

  // Handler: Change Own Password
  const handleUpdateSelfPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    if (!oldPassword.trim()) {
      showAlert('error', 'Masukkan password lama Anda saat ini!');
      return;
    }

    if (!newPassword.trim()) {
      showAlert('error', 'Masukkan password baru yang diinginkan!');
      return;
    }

    if (newPassword.length < 4) {
      showAlert('error', 'Password baru minimal harus 4 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('error', 'Konfirmasi password baru tidak cocok!');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateAdminPassword(currentAdmin.id, oldPassword, newPassword, false);
      if (res.success) {
        showAlert('success', res.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showAlert('error', res.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Super Admin change another admin's password directly
  const handleUpdateTargetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetAdmin) return;

    if (!targetNewPassword.trim()) {
      showAlert('error', 'Masukkan password baru untuk akun ini!');
      return;
    }

    if (targetNewPassword.length < 4) {
      showAlert('error', 'Password baru minimal harus 4 karakter!');
      return;
    }

    if (targetNewPassword !== targetConfirmPassword) {
      showAlert('error', 'Konfirmasi password baru tidak cocok!');
      return;
    }

    setIsSaving(true);
    try {
      // Bypass old check since Super Admin is resetting it
      const res = await updateAdminPassword(selectedTargetAdmin.id, '', targetNewPassword, true);
      if (res.success) {
        showAlert('success', `Password akun ${selectedTargetAdmin.fullName} berhasil diubah!`);
        setSelectedTargetAdmin(null);
        setTargetNewPassword('');
        setTargetConfirmPassword('');
      } else {
        showAlert('error', res.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Reset to default admin123
  const handleResetToDefault = async (admin: AdminUser) => {
    const confirm = window.confirm(
      `Yakin ingin me-reset password akun "${admin.fullName}" (${admin.username}) kembali ke bawaan sistem ("admin123")?`
    );
    if (!confirm) return;

    const res = await resetAdminPassword(admin.id);
    if (res.success) {
      showAlert('success', res.message);
    } else {
      showAlert('error', res.message);
    }
  };

  // Handler: Create new admin
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminFullName.trim() || !newAdminUsername.trim() || !newAdminTitle.trim()) {
      showAlert('error', 'Semua kolom data admin wajib diisi!');
      return;
    }

    const res = addAdminUser({
      fullName: newAdminFullName.trim(),
      username: newAdminUsername.trim(),
      title: newAdminTitle.trim(),
      role: newAdminRole,
      password: newAdminPassword.trim() || 'admin123',
    });

    if (res.success) {
      showAlert('success', res.message);
      setShowAddModal(false);
      setNewAdminFullName('');
      setNewAdminUsername('');
      setNewAdminTitle('');
      setNewAdminPassword('admin123');
      setNewAdminRole('OPERATOR_TPS');
    } else {
      showAlert('error', res.message);
    }
  };

  // Handler: Delete admin
  const handleDeleteAdmin = (admin: AdminUser) => {
    const confirm = window.confirm(
      `Yakin ingin menghapus akun administrator "${admin.fullName}" (${admin.username})?`
    );
    if (!confirm) return;

    const res = deleteAdminUser(admin.id);
    if (res.success) {
      showAlert('success', res.message);
    } else {
      showAlert('error', res.message);
    }
  };

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Belum diisi', score: 0, color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: 'Mudah Ditebak', score: 1, color: 'bg-rose-500' };
    if (score === 2) return { label: 'Cukup Aman', score: 2, color: 'bg-amber-500' };
    if (score >= 3) return { label: 'Kuat & Aman', score: 3, color: 'bg-emerald-500' };
    return { label: 'Standar', score: 2, color: 'bg-blue-500' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Alert */}
      {alert && (
        <div
          className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-150 ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : 'bg-rose-50 text-rose-950 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-black">{alert.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-xs font-bold underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400/50 flex items-center justify-center shrink-0 shadow-inner">
            <KeyRound className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-md border border-amber-600/50">
                Pusat Keamanan & Kredensial
              </span>
              <span className="text-xs text-slate-300 font-bold">
                Total Akun: <strong>{admins.length} Pengguna</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Pengaturan Password & Akun Administrator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Kelola keamanan kata sandi untuk Super Admin (Kesiswaan) dan Operator TPS (Panitia KPU OSIS).
            </p>
          </div>
        </div>

        {/* Status of Current User */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border-2 border-slate-800 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Akun Aktif Anda:
            </span>
            <span className="block text-xs font-black text-white">
              {currentAdmin?.fullName}
            </span>
            <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded mt-0.5 border border-amber-700/50">
              {currentAdmin?.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Operator TPS'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form: Ubah Password Sendiri (Left/Top) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Ubah Password Anda
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Ganti kata sandi akun yang sedang Anda gunakan saat ini.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateSelfPassword} className="space-y-4">
              {/* Info akun */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Username Anda:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {currentAdmin?.username}
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
                  {currentAdmin?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operator TPS'}
                </span>
              </div>

              {/* Password Lama */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Password Lama Saat Ini:
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none text-xs sm:text-sm font-medium pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  *Default sistem awal: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">admin123</code>
                </p>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Password Baru:
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 4 karakter kombinasi..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none text-xs sm:text-sm font-medium pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Kekuatan:</span>
                      <span className={strength.score >= 2 ? 'text-emerald-700' : 'text-amber-700'}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Ulangi Password Baru:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 focus:outline-none text-xs sm:text-sm font-medium pr-10 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-slate-200 focus:border-blue-600'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">
                    ⚠️ Konfirmasi password tidak sama dengan password baru!
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving || !newPassword || newPassword !== confirmPassword || newPassword.length < 4}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Menyimpan ke Cloud Firestore...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Simpan Password Baru Anda</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Security Tip */}
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start gap-2.5 text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tips Keamanan:</strong> Jangan berikan password akun admin atau super admin kepada siswa demi menjaga kerahasiaan & integritas rekapitulasi suara.
            </p>
          </div>
        </div>

        {/* Panel 2: Daftar Seluruh Akun & Otoritas (Right/Bottom) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b-2 border-slate-100 gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border-2 border-purple-200 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Daftar Akun Administrator Sekolah
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isSuperAdmin
                      ? 'Sebagai Super Admin, Anda dapat mengatur ulang password dan hak akses seluruh akun.'
                      : 'Daftar panitia pengelola sistem e-Voting SMKS PGRI 1 Sukabumi.'}
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Tambah Akun Admin
                </button>
              )}
            </div>

            {/* List of admin cards */}
            <div className="space-y-3">
              {admins.map((admin) => {
                const isCurrent = admin.id === currentAdmin?.id;
                const isDefaultPass = !admin.password || admin.password === 'admin123';

                return (
                  <div
                    key={admin.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-100'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-xs ${
                          admin.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        {admin.role === 'SUPER_ADMIN' ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <UserCheck className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-sm text-slate-900">
                            {admin.fullName}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Akun Anda
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          {admin.title}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
                            User: <strong>{admin.username}</strong>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              admin.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operator TPS'}
                          </span>
                          {isDefaultPass ? (
                            <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold border border-amber-200" title="Password masih bawaan sistem: admin123">
                              Pass Default
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold border border-emerald-200" title="Password sudah dikustomisasi">
                              Pass Kustom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTargetAdmin(admin);
                              setTargetNewPassword('');
                              setTargetConfirmPassword('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-200 hover:border-blue-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Ganti password untuk akun ini"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                            <span>Setel Password</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetToDefault(admin)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-200 hover:border-amber-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Reset password kembali ke admin123"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reset (admin123)</span>
                          </button>

                          {/* Delete custom admin if not primary super admin */}
                          {admin.id !== 'admin-01' && admin.id !== currentAdmin?.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAdmin(admin)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                              title="Hapus akun administrator"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Kredensial disimpan aman pada penyimpanan lokal browser & terenkripsi cloud Firestore.
            </span>
            <span className="font-mono font-bold text-slate-700">
              Recovery Key: <code>pgri1sukabumi</code>
            </span>
          </div>
        </div>
      </div>

      {/* MODAL: Super Admin Set Password for Target Admin */}
      {selectedTargetAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  Setel Password Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTargetAdmin(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs">
              <span className="text-indigo-800 block text-[10px] uppercase font-black">Target Akun:</span>
              <p className="font-black text-slate-900 text-sm">{selectedTargetAdmin.fullName}</p>
              <p className="text-slate-600 font-mono text-xs">Username: @{selectedTargetAdmin.username}</p>
            </div>

            <form onSubmit={handleUpdateTargetPassword} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Password Baru untuk Akun Ini:
                </label>
                <div className="relative">
                  <input
                    type={showTargetPass ? 'text' : 'password'}
                    value={targetNewPassword}
                    onChange={(e) => setTargetNewPassword(e.target.value)}
                    placeholder="Minimal 4 karakter..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm font-medium pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowTargetPass(!showTargetPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showTargetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Ulangi Password Baru:
                </label>
                <input
                  type={showTargetPass ? 'text' : 'password'}
                  value={targetConfirmPassword}
                  onChange={(e) => setTargetConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTargetAdmin(null)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !targetNewPassword || targetNewPassword !== targetConfirmPassword || targetNewPassword.length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Akun Administrator Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  Tambah Akun Administrator / Panitia
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Nama Lengkap & Gelar:
                </label>
                <input
                  type="text"
                  value={newAdminFullName}
                  onChange={(e) => setNewAdminFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Ridwan, S.Kom."
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Jabatan / Posisi Panitia:
                </label>
                <input
                  type="text"
                  value={newAdminTitle}
                  onChange={(e) => setNewAdminTitle(e.target.value)}
                  placeholder="Contoh: Operator TPS Bilik 2 (KPU OSIS)"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    Username Login:
                  </label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="Contoh: panitia.bilik2"
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    Peran (Role):
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm font-medium bg-white"
                  >
                    <option value="OPERATOR_TPS">Operator TPS</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Password Awal:
                </label>
                <input
                  type="text"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Contoh: admin123"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none text-xs sm:text-sm font-medium font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Buat Akun Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
