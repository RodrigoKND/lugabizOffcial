import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Plus, Pencil, Menu, LogOut, BarChart3, Loader2, Award, BadgeCheck, Sparkles } from 'lucide-react';
import { User } from '@domain/entities';
import { CdnImage } from '@presentation/components/reusables';

interface ProfileHeaderProps {
  user: User;
  // ¿El negocio principal (el que se muestra acá) tiene sus DOCUMENTOS aprobados?
  // La insignia dorada se basa en ESTO (estado por-negocio), no en una bandera de
  // cuenta: tener un negocio con docs verificados no debe dorar a otro negocio que
  // solo tiene la identidad verificada.
  businessDocsApproved: boolean;
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
  user, businessDocsApproved, myPlacesCount, reviewsCount, myEventsCount,
  isUploadingAvatar, avatarInputRef, isAdmin, showMobileMenu,
  onAvatarChange, onEditClick, onEventCreate, onToggleMobileMenu, onLogout,
}) => (
  <div className="bg-lg-surface rounded-2xl p-5 sm:p-6 border border-lg-surface-2 shadow-xs mb-6">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
      <div className="relative shrink-0">
        <CdnImage src={user.avatar || '/avatar.png'} width={160} priority
          className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-2 ring-lg-surface-2" alt={user.name} />
        <button onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar}
          className="absolute -bottom-1 -right-1 bg-lg-accent text-lg-ink p-1.5 rounded-lg hover:scale-110 transition-transform shadow-sm disabled:opacity-50">
          {isUploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        </button>
        <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
      </div>
      <div className="flex-1 text-center sm:text-left min-w-0">
        <div className="flex items-center justify-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-lg-text">{user.name}</h1>
            <p className="text-sm text-lg-dim">{user.email}</p>
          </div>
          <button onClick={onEditClick}
            className="hidden sm:flex p-2 bg-lg-surface-2 hover:bg-lg-surface-2 rounded-lg transition-colors text-lg-accent shrink-0">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        {user.bio && <p className="text-sm text-lg-dim mt-1">{user.bio}</p>}
        {user.isOwner && user.ownerBusinessName && (
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2">
            {businessDocsApproved ? (
              // DORADA: solo cuando el admin aprobó los DOCUMENTOS de este negocio.
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lg-accent text-lg-ink rounded-lg text-xs font-bold ring-1 ring-amber-300/60 shadow-sm shadow-amber-500/30">
                <BadgeCheck className="w-3.5 h-3.5" /> Negocio verificado
              </span>
            ) : user.identityVerified ? (
              // GRIS: identidad verificada pero sin documentos de negocio aprobados.
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lg-surface-2 text-lg-dim rounded-lg text-xs font-semibold ring-1 ring-lg-surface-2">
                <Sparkles className="w-3.5 h-3.5" /> Negocio emergente
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lg-surface-2 text-lg-accent rounded-lg text-xs font-semibold">
                <Award className="w-3 h-3" /> {user.ownerBusinessName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-lg-surface-2">
      <div className="text-center">
        <p className="text-lg font-bold text-lg-text">{myPlacesCount}</p>
        <p className="text-[10px] font-semibold text-lg-dim uppercase">Lugares</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-lg-text">{reviewsCount}</p>
        <p className="text-[10px] font-semibold text-lg-dim uppercase">Reseñas</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-lg-text">{myEventsCount}</p>
        <p className="text-[10px] font-semibold text-lg-dim uppercase">Eventos</p>
      </div>
    </div>

    <div className="flex gap-2 mt-4 sm:hidden">
      <button onClick={onEventCreate}
        className="flex-1 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-lg-accent transition-all">
        <Plus className="w-3.5 h-3.5" /> Crear Evento
      </button>
      <button onClick={onEditClick}
        className="py-2.5 px-4 bg-lg-surface-2 text-lg-accent rounded-xl font-semibold text-xs hover:bg-lg-surface-2 transition-all">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={onToggleMobileMenu}
        className="py-2.5 px-4 bg-lg-surface-2 text-lg-accent rounded-xl font-semibold text-xs hover:bg-lg-surface-2 transition-all">
        <Menu className="w-3.5 h-3.5" />
      </button>
    </div>

    {showMobileMenu && (
      <div className="mt-2 space-y-1 sm:hidden">
        {isAdmin && (
          <Link to="/admin" onClick={onToggleMobileMenu}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-lg-dim hover:bg-lg-surface-2 transition-colors">
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
