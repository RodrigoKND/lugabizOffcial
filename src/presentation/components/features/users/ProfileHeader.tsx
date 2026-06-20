import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Plus, Pencil, Menu, LogOut, BarChart3, Loader2, Award, BadgeCheck, Sparkles } from 'lucide-react';
import { User } from '@domain/entities';

interface ProfileHeaderProps {
  user: User;
  myPlacesCount: number;
  reviewsCount: number;
  myEventsCount: number;
  isUploadingAvatar: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement>;
  isAdmin: boolean;
  showMobileMenu: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick: () => void;
  onEventCreate: () => void;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user, myPlacesCount, reviewsCount, myEventsCount,
  isUploadingAvatar, avatarInputRef, isAdmin, showMobileMenu,
  onAvatarChange, onEditClick, onEventCreate, onToggleMobileMenu, onLogout,
}) => (
  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-primary-100/40 shadow-xs mb-6">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
      <div className="relative shrink-0">
        <img src={user.avatar || '/avatar.png'}
          className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-2 ring-primary-100" alt={user.name} />
        <button onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar}
          className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-1.5 rounded-lg hover:scale-110 transition-transform shadow-sm disabled:opacity-50">
          {isUploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        </button>
        <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
      </div>
      <div className="flex-1 text-center sm:text-left min-w-0">
        <div className="flex items-center justify-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{user.name}</h1>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
          <button onClick={onEditClick}
            className="hidden sm:flex p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-primary-500 shrink-0">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        {user.bio && <p className="text-sm text-text-secondary mt-1">{user.bio}</p>}
        {user.isOwner && user.ownerBusinessName && (
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2">
            {user.businessDocsVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold ring-1 ring-amber-200">
                <BadgeCheck className="w-3.5 h-3.5" /> Negocio verificado
              </span>
            ) : user.identityVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold ring-1 ring-primary-200">
                <Sparkles className="w-3.5 h-3.5" /> Negocio emergente
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold">
                <Award className="w-3 h-3" /> {user.ownerBusinessName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-primary-100/30">
      <div className="text-center">
        <p className="text-lg font-bold text-text-primary">{myPlacesCount}</p>
        <p className="text-[10px] font-semibold text-text-secondary uppercase">Lugares</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-text-primary">{reviewsCount}</p>
        <p className="text-[10px] font-semibold text-text-secondary uppercase">Reseñas</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-text-primary">{myEventsCount}</p>
        <p className="text-[10px] font-semibold text-text-secondary uppercase">Eventos</p>
      </div>
    </div>

    <div className="flex gap-2 mt-4 sm:hidden">
      <button onClick={onEventCreate}
        className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-600 transition-all">
        <Plus className="w-3.5 h-3.5" /> Crear Evento
      </button>
      <button onClick={onEditClick}
        className="py-2.5 px-4 bg-primary-50 text-primary-500 rounded-xl font-semibold text-xs hover:bg-primary-100 transition-all">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={onToggleMobileMenu}
        className="py-2.5 px-4 bg-primary-50 text-primary-500 rounded-xl font-semibold text-xs hover:bg-primary-100 transition-all">
        <Menu className="w-3.5 h-3.5" />
      </button>
    </div>

    {showMobileMenu && (
      <div className="mt-2 space-y-1 sm:hidden">
        {isAdmin && (
          <Link to="/admin" onClick={onToggleMobileMenu}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-primary-50 transition-colors">
            <BarChart3 className="w-4 h-4" /> Panel Admin
          </Link>
        )}
        <button onClick={() => { onLogout(); onToggleMobileMenu(); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    )}
  </div>
);

export default ProfileHeader;
