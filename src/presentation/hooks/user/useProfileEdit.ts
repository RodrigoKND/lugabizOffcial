import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@presentation/context';
import { EditProfileData } from '@domain/entities/ProfileTypes';

export function useProfileEdit() {
  const { user, uploadAvatar, updateProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editData, setEditData] = useState<EditProfileData>({
    name: '', phone: '', bio: '', isOwner: false, ownerBusinessName: '',
  });

  useEffect(() => {
    if (!user) return;
    setEditData({
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      isOwner: user.isOwner || false,
      ownerBusinessName: user.ownerBusinessName || '',
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
    await updateProfile({ ...editData, isOwner });
    setIsEditing(false);
  };

  return {
    isEditing, editData, isUploadingAvatar, avatarInputRef,
    setIsEditing, setEditData, handleAvatarChange, handleSaveProfile,
  };
}
