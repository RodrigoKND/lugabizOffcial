import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Bookmark, Calendar, CheckCircle2, BarChart3, Activity, Users, CalendarCheck2 } from 'lucide-react';
import { useAuth, usePlaces } from '@presentation/context';
import { EventForm, OwnerAnnouncement, CreateSurveyModal, SurveyStats } from '@presentation/components/features';
import { ProfileHeader, ProfileTabs, SavedPlacesTab, MyEventsTab, AttendingEventsTab, DashboardTab, AdminTab, EditProfileModal, VerificationWizard, MyBusinessesModal } from '@presentation/components/features/users';
import { FriendsTab, PlansTab } from '@presentation/components/features/social';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { MarketSurvey, ProfileTab, TabId } from '@domain/entities';
import { eventsService, ownerBusinessesService } from '@lib/supabase';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { useProfileData, useProfileEdit } from '@presentation/hooks';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout, isAdmin, notifications, unreadCount, refreshUser } = useAuth();
  const { getLengthPlacesByUserId, getLengthReviewsByUserId } = usePlaces();

  const { savedPlaces, myEvents, attendingEvents, mySurveys, setMyEvents, refreshSurveys } = useProfileData();
  const { isEditing, editData, isUploadingAvatar, avatarInputRef, setIsEditing, setEditData, handleAvatarChange, handleSaveProfile } = useProfileEdit();

  const [activeTab, setActiveTab] = useState<TabId>('saved');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [statsTarget, setStatsTarget] = useState<MarketSurvey | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [showBusinesses, setShowBusinesses] = useState(false);
  // ¿El negocio principal (ownerBusinessName) tiene los documentos APROBADOS? La
  // insignia dorada depende de esto (estado por-negocio), no de la bandera de cuenta
  // business_docs_verified (que es "tiene al menos un negocio verificado" y doraba de
  // más a negocios que solo tienen la identidad verificada).
  const [principalDocsApproved, setPrincipalDocsApproved] = useState(false);
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

  // Abre la pestaña indicada al llegar desde una notificación (ej. ?tab=friends)
  const VALID_TABS: TabId[] = ['saved', 'events', 'attending', 'friends', 'plans', 'dashboard', 'admin'];
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (VALID_TABS as string[]).includes(tab)) {
      setActiveTab(tab as TabId);
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Al entrar al perfil, re-leemos las banderas de verificación desde la DB: así la
  // insignia dorada aparece apenas el admin aprueba los documentos, sin re-login.
  useEffect(() => { refreshUser(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Estado de documentos del negocio principal (para la insignia dorada por-negocio).
  // Se recalcula cuando cambia el negocio principal o las banderas de verificación.
  useEffect(() => {
    if (!user?.isOwner) { setPrincipalDocsApproved(false); return; }
    ownerBusinessesService.listMine(user.id)
      .then(list => {
        const principal = list.find(b => b.name === user.ownerBusinessName) ?? list[0];
        setPrincipalDocsApproved(principal?.docsStatus === 'approved');
      })
      .catch(() => setPrincipalDocsApproved(false));
  }, [user?.id, user?.isOwner, user?.ownerBusinessName, user?.businessDocsVerified]);

  // Hook llamado SIEMPRE (antes del return condicional de abajo): un useMemo
  // que solo se ejecuta cuando hay user rompe el orden de hooks entre renders
  // (el primer render sin user todavía no lo llama, el siguiente sí) y React
  // tira "Rendered fewer/more hooks than expected".
  const tabs: ProfileTab[] = useMemo(() => {
    const items: ProfileTab[] = [
      { id: 'saved', label: 'Colección', icon: Bookmark },
      { id: 'events', label: 'Mis Eventos', icon: Calendar },
      { id: 'attending', label: 'Asistiré', icon: CheckCircle2 },
      { id: 'friends', label: 'Amigos', icon: Users },
      { id: 'plans', label: 'Planes', icon: CalendarCheck2 },
    ];
    if (user?.isOwner) items.push({ id: 'dashboard', label: 'Dashboard', icon: BarChart3 });
    if (isAdmin) items.push({ id: 'admin', label: 'Admin', icon: Activity });
    return items;
  }, [user?.isOwner, isAdmin]);

  if (!user) return <Navigate to="/" replace />;

  const myPlacesArr = getLengthPlacesByUserId(user.id);
  const reviewsCount = getLengthReviewsByUserId(user.id);

  const renderTabContent = () => {
    const tabComponents: Record<TabId, React.ReactNode> = {
      saved: <SavedPlacesTab places={savedPlaces} />,
      events: <MyEventsTab events={myEvents} onEventCreate={() => setShowEventForm(true)} onDelete={setDeleteConfirmId} />,
      attending: <AttendingEventsTab events={attendingEvents} />,
      friends: <FriendsTab />,
      plans: <PlansTab />,
      dashboard: (
        <DashboardTab
          myPlaces={myPlacesArr}
          myEvents={myEvents}
          mySurveys={mySurveys}
          onAnnouncement={() => setShowAnnouncement(true)}
          onSurveyCreate={() => setShowSurveyModal(true)}
          onSurveyStats={setStatsTarget}
        />
      ),
      admin: (
        <AdminTab
          myPlacesCount={myPlacesArr.length}
          myEventsCount={myEvents.length}
          unreadCount={unreadCount}
          notifications={notifications}
        />
      ),
    };
    return tabComponents[activeTab] ?? null;
  };

  return (
    <div className="min-h-screen bg-feed-bg pb-24 md:pb-0">
      <div className="purple-blob w-72 h-72 bg-primary-200/20 -top-20 -left-20" />
      <div className="purple-blob w-80 h-80 bg-pink-200/10 top-1/3 -right-32" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <ProfileHeader
          user={user}
          businessDocsApproved={principalDocsApproved}
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

        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pb-20 md:pb-0">
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
        initialUsername={user.username}
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
