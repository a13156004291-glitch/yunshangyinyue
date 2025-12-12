import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, ApplicationStatus, DiscountCode, SystemSettings } from '../types';
import { useToast } from './ToastContext';

interface UserContextType {
  currentUser: User | null;
  users: User[]; 
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  isApplyModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  isVipModalOpen: boolean;
  discountCodes: DiscountCode[];
  systemSettings: SystemSettings;
  
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  openApplyModal: () => void;
  closeApplyModal: () => void;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;
  openVipModal: () => void;
  closeVipModal: () => void;

  login: (account: string, password?: string) => Promise<boolean>;
  register: (username: string, password?: string, contact?: string, contactType?: 'email' | 'phone') => Promise<boolean>;
  resetPassword: (contact: string, newPassword: string) => boolean;
  logout: () => void;
  
  applyForMusician: (artistName: string, bio: string) => void;
  reviewMusicianApplication: (userId: string, approved: boolean) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  adminResetUserPassword: (userId: string) => void;
  toggleFollow: (targetUserId: string) => void;
  upgradeToVip: (plan: string) => void;
  
  createDiscountCode: (code: string, type: 'percent' | 'fixed', value: number) => void;
  deleteDiscountCode: (id: string) => void;
  validatePromoCode: (code: string) => DiscountCode | null;
  syncUserData: (data: Partial<User>) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      try {
          const saved = localStorage.getItem('nebula_current_user');
          return saved ? JSON.parse(saved) : null;
      } catch { return null; }
  });

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [isVipModalOpen, setVipModalOpen] = useState(false);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ announcement: '', maintenanceMode: false });

  // Refresh Users List & Current User Data
  const refreshUsers = useCallback(async () => {
      try {
          const res = await fetch('/api/users');
          if (res.ok) setUsers(await res.json());
      } catch (e) { console.error("Failed to fetch users list"); }
  }, []);

  const refreshSettings = useCallback(async () => {
      try {
          const res = await fetch('/api/settings');
          if (res.ok) setSystemSettings(await res.json());
      } catch (e) { console.error("Failed to fetch settings"); }
  }, []);

  // Fetch fresh current user data on init
  useEffect(() => {
      refreshUsers();
      refreshSettings();
      if (currentUser?.id) {
          fetch(`/api/users/${currentUser.id}`)
              .then(res => res.ok ? res.json() : null)
              .then(freshData => {
                  if (freshData) {
                      setCurrentUser(prev => ({ ...prev, ...freshData }));
                  }
              })
              .catch(console.error);
      }
  }, []); // Run once on mount

  useEffect(() => {
      if (currentUser) {
          localStorage.setItem('nebula_current_user', JSON.stringify(currentUser));
      } else {
          localStorage.removeItem('nebula_current_user');
      }
  }, [currentUser]);

  const syncUserData = async (data: Partial<User>) => {
      if (!currentUser) return;
      try {
          const updated = { ...currentUser, ...data };
          setCurrentUser(updated);
          await fetch(`/api/users/${currentUser.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
      } catch (e) {
          console.error("Sync failed", e);
      }
  };

  const updateSystemSettings = async (settings: Partial<SystemSettings>) => {
      try {
          const res = await fetch('/api/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(settings)
          });
          if (res.ok) {
              setSystemSettings(await res.json());
              showToast('系统设置已更新', 'success');
          }
      } catch (e) {
          showToast('设置更新失败', 'error');
      }
  };

  const openLogin = useCallback(() => { setAuthModalTab('login'); setAuthModalOpen(true); }, []);
  const openRegister = useCallback(() => { setAuthModalTab('register'); setAuthModalOpen(true); }, []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);
  const openApplyModal = useCallback(() => setApplyModalOpen(true), []);
  const closeApplyModal = useCallback(() => setApplyModalOpen(false), []);
  const openEditProfileModal = useCallback(() => setEditProfileModalOpen(true), []);
  const closeEditProfileModal = useCallback(() => setEditProfileModalOpen(false), []);
  const openVipModal = useCallback(() => setVipModalOpen(true), []);
  const closeVipModal = useCallback(() => setVipModalOpen(false), []);

  const login = async (account: string, password?: string) => {
      try {
          const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ account, password })
          });
          if (res.ok) {
              const user = await res.json();
              setCurrentUser(user);
              setAuthModalOpen(false);
              showToast(`欢迎回来, ${user.username}!`, 'success');
              return true;
          } else {
              showToast('账号或密码错误', 'error');
              return false;
          }
      } catch (e) {
          showToast('登录请求失败', 'error');
          return false;
      }
  };

  const register = async (username: string, password?: string, contact?: string, contactType?: 'email' | 'phone') => {
      try {
          const res = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password, contact, contactType })
          });
          if (res.ok) {
              const user = await res.json();
              setCurrentUser(user);
              setAuthModalOpen(false);
              showToast('注册成功！', 'success');
              refreshUsers();
              return true;
          } else {
              const err = await res.json();
              showToast(err.error || '注册失败', 'error');
              return false;
          }
      } catch (e) {
          showToast('注册请求失败', 'error');
          return false;
      }
  };

  const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem('nebula_current_user');
      window.location.reload(); 
  };

  const applyForMusician = (artistName: string, bio: string) => {
      syncUserData({ username: artistName, bio, musicianStatus: 'pending' });
      showToast('申请已提交', 'success');
      setApplyModalOpen(false);
  };

  const updateUser = (userId: string, data: Partial<User>) => {
      if (currentUser?.id === userId) {
          syncUserData(data);
      } else {
          fetch(`/api/users/${userId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          }).then(() => {
              refreshUsers();
              showToast('用户更新成功', 'success');
          });
      }
  };

  const reviewMusicianApplication = (userId: string, approved: boolean) => {
      updateUser(userId, { 
          role: approved ? 'musician' : 'user', 
          musicianStatus: approved ? 'approved' : 'rejected' 
      });
  };

  const deleteUser = async (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId)); 
      showToast('用户已删除', 'success');
  };

  const adminResetUserPassword = (userId: string) => {
      updateUser(userId, { password: 'password123' });
      showToast('密码重置为 password123', 'success');
  };

  const toggleFollow = (targetUserId: string) => {
      if (!currentUser) return openLogin();
      const isFollowing = currentUser.followingIds?.includes(targetUserId);
      const newIds = isFollowing 
          ? currentUser.followingIds?.filter(id => id !== targetUserId)
          : [...(currentUser.followingIds || []), targetUserId];
      syncUserData({ followingIds: newIds, following: newIds?.length });
      showToast(isFollowing ? '已取消关注' : '已关注', 'success');
  };

  const upgradeToVip = (plan: string) => {
      syncUserData({ isVip: true });
      showToast(`VIP 开通成功 (${plan})`, 'success');
      setVipModalOpen(false);
  };

  const resetPassword = (contact: string, newPassword: string) => { showToast('功能演示：密码重置成功', 'success'); return true; };
  const createDiscountCode = (c: string, t: any, v: number) => setDiscountCodes(p => [...p, { id: Date.now().toString(), code: c, type: t, value: v, active: true }]);
  const deleteDiscountCode = (id: string) => setDiscountCodes(p => p.filter(d => d.id !== id));
  const validatePromoCode = (c: string) => discountCodes.find(d => d.code === c && d.active) || null;

  return (
    <UserContext.Provider value={{
      currentUser, users, isAuthenticated: !!currentUser,
      isAuthModalOpen, authModalTab, isApplyModalOpen, isEditProfileModalOpen, isVipModalOpen, discountCodes, systemSettings,
      openLogin, openRegister, closeAuthModal, openApplyModal, closeApplyModal, openEditProfileModal, closeEditProfileModal, openVipModal, closeVipModal,
      login, register, resetPassword, logout, applyForMusician, reviewMusicianApplication, updateUser, deleteUser, adminResetUserPassword, toggleFollow, upgradeToVip,
      createDiscountCode, deleteDiscountCode, validatePromoCode, syncUserData, updateSystemSettings
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
