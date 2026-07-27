import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import { EditProfileData } from '@domain/entities/ProfileTypes';

export function useProfileEdit() {
  const { user, uploadAvatar, updateProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editData, setEditData] = useState<EditProfileData>({
    name: '', phone: '', bio: '', isOwner: false, ownerBusinessName: '', username: '',
  });

  useEffect(() => {
    if (!user) return;
    setEditData({
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      isOwner: user.isOwner || false,
      ownerBusinessName: user.ownerBusinessName || '',
      username: user.username || '',
    });
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    await uploadAvatar(file);
    setIsUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    const isOwner = !!editData.ownerBusinessName;
    const ok = await updateProfile({ ...editData, isOwner });
    if (!ok) { toast.error('No se pudo guardar. ¿Ese nombre de usuario ya está en uso?'); return; }
    setIsEditing(false);
  };

  return {
    isEditing, editData, isUploadingAvatar, avatarInputRef,
    setIsEditing, setEditData, handleAvatarChange, handleSaveProfile,
  };
}
