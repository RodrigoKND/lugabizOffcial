import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Bookmark, Calendar, CheckCircle2, BarChart3, Activity } from 'lucide-react';
import { useAuth, usePlaces } from '@presentation/context';
import { EventForm, OwnerAnnouncement, CreateSurveyModal, SurveyStats } from '@presentation/components/features';
import { ProfileHeader, ProfileTabs, SavedPlacesTab, MyEventsTab, AttendingEventsTab, DashboardTab, AdminTab, EditProfileModal, VerificationWizard, MyBusinessesModal } from '@presentation/components/features/users';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { MarketSurvey, ProfileTab } from '@domain/entities';
import { eventsService } from '@lib/supabase';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { useProfileData, useProfileEdit } from '@presentation/hooks';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout, isAdmin, notifications, unreadCount } = useAuth();
  const { getLengthPlacesByUserId, getLengthReviewsByUserId } = usePlaces();

  const { savedPlaces, myEvents, attendingEvents, mySurveys, setMyEvents, refreshSurveys } = useProfileData();
  const { isEditing, editData, isUploadingAvatar, avatarInputRef, setIsEditing, setEditData, handleAvatarChange, handleSaveProfile } = useProfileEdit();

  const [activeTab, setActiveTab] = useState('saved');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [statsTarget, setStatsTarget] = useState<MarketSurvey | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [showBusinesses, setShowBusinesses] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useSEO({ title: user?.name || 'Perfil', description: 'Perfil de usuario en Lugabiz' });

  // Abrir el wizard de verificación si se llega con ?verify=1 (ej. desde el asesor)
  useEffect(() => {
    if (searchParams.get('verify') === '1') {
      setShowVerification(true);
      searchParams.delete('verify');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => { if (isAdmin) edgeService.createOwnerAnnouncement('', '').catch(() => {}); }, [isAdmin]);

  if (!user) return <Navigate to="/" replace />;

  const myPlacesArr = getLengthPlacesByUserId(user.id);
  const reviewsCount = getLengthReviewsByUserId(user.id);

  const tabs: ProfileTab[] = useMemo(() => {
    const items: ProfileTab[] = [
      { id: 'saved', label: 'Colección', icon: Bookmark },
      { id: 'events', label: 'Mis Eventos', icon: Calendar },
      { id: 'attending', label: 'Asistiré', icon: CheckCircle2 },
    ];
    if (user.isOwner) items.push({ id: 'dashboard', label: 'Dashboard', icon: BarChart3 });
    if (isAdmin) items.push({ id: 'admin', label: 'Admin', icon: Activity });
    return items;
  }, [user.isOwner, isAdmin]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'saved':
        return <SavedPlacesTab places={savedPlaces} />;
      case 'events':
        return <MyEventsTab events={myEvents} onEventCreate={() => setShowEventForm(true)} onDelete={setDeleteConfirmId} />;
      case 'attending':
        return <AttendingEventsTab events={attendingEvents} />;
      case 'dashboard':
        return (
          <DashboardTab
            myPlaces={myPlacesArr}
            myEvents={myEvents}
            mySurveys={mySurveys}
            onAnnouncement={() => setShowAnnouncement(true)}
            onSurveyCreate={() => setShowSurveyModal(true)}
            onSurveyStats={setStatsTarget}
          />
        );
      case 'admin':
        return (
          <AdminTab
            myPlacesCount={myPlacesArr.length}
            myEventsCount={myEvents.length}
            unreadCount={unreadCount}
            notifications={notifications}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-feed-bg pb-24 md:pb-0">
      <div className="purple-blob w-72 h-72 bg-primary-200/20 -top-20 -left-20" />
      <div className="purple-blob w-80 h-80 bg-pink-200/10 top-1/3 -right-32" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <ProfileHeader
          user={user}
          myPlacesCount={myPlacesArr.length}
          reviewsCount={reviewsCount}
          myEventsCount={myEvents.length}
          isUploadingAvatar={isUploadingAvatar}
          avatarInputRef={avatarInputRef}
          isAdmin={isAdmin}
          showMobileMenu={showMobileMenu}
          onAvatarChange={handleAvatarChange}
          onEditClick={() => setIsEditing(true)}
          onEventCreate={() => setShowEventForm(true)}
          onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
          onLogout={logout}
        />

        <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <EventForm isOpen={showEventForm} onClose={() => setShowEventForm(false)} />
      <OwnerAnnouncement isOpen={showAnnouncement} onClose={() => setShowAnnouncement(false)} />
      <EditProfileModal
        isOpen={isEditing}
        editData={editData}
        onClose={() => setIsEditing(false)}
        onChange={setEditData}
        onSave={handleSaveProfile}
        onVerify={() => setShowVerification(true)}
        onManageBusinesses={() => setShowBusinesses(true)}
      />
      <VerificationWizard isOpen={showVerification} onClose={() => setShowVerification(false)} />
      <MyBusinessesModal isOpen={showBusinesses} onClose={() => setShowBusinesses(false)} />

      <CreateSurveyModal
        open={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onCreated={refreshSurveys}
      />
      {statsTarget && (
        <SurveyStats survey={statsTarget} onClose={() => setStatsTarget(null)} />
      )}
      <ConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={async () => {
          if (!deleteConfirmId) return;
          try {
            await eventsService.deleteEvent(deleteConfirmId);
            setMyEvents(prev => prev.filter(e => e.id !== deleteConfirmId));
            toast.success('Evento eliminado');
          } catch { toast.error('Error al eliminar'); }
          setDeleteConfirmId(null);
        }}
        title="Eliminar evento"
        message="¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};

export default Profile;
