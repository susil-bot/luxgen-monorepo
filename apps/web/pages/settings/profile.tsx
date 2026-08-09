import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import {
  Tab,
  TabItem,
  ProfileForm,
  ProfileFormData,
  ProfilePicture,
  SnackbarProvider,
  useSnackbar,
  PageWrapper,
} from '@luxgen/ui';
import { AUTH_SESSION_CHANGE_EVENT, getStoredUser, updateStoredUser, type SessionUser } from '../../lib/session';
import { UPDATE_USER } from '../../graphql/queries/auth';

function emptyProfile(): ProfileFormData {
  return {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    dateOfBirth: '',
    permanentAddress: '',
    presentAddress: '',
    city: '',
    country: '',
    postalCode: '',
  };
}

function sessionToProfile(user: SessionUser): ProfileFormData {
  return {
    ...emptyProfile(),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    username: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
  };
}

const EditProfilePageContentImpl: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<ProfileFormData>(emptyProfile());
  const [updateUser] = useMutation(UPDATE_USER);

  useEffect(() => {
    const refresh = () => {
      const stored = getStoredUser();
      setSessionUser(stored);
      if (stored) {
        setUserData(sessionToProfile(stored));
        setProfileImage(stored.avatar || undefined);
      }
      setHydrated(true);
    };
    refresh();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionUser) {
      void router.replace('/login?reason=session_required&next=/settings/profile');
    }
  }, [hydrated, sessionUser, router]);

  const handleProfileUpdate = async (data: ProfileFormData) => {
    if (!sessionUser) return;
    setLoading(true);
    try {
      await updateUser({
        variables: {
          id: sessionUser.id,
          input: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          },
        },
      });
      updateStoredUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
      setUserData(data);
      showSuccess('Profile updated successfully!');
    } catch (_error) {
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setProfileImage(dataUrl);
        updateStoredUser({ avatar: dataUrl });
        showSuccess('Profile picture updated locally. Cloud upload is coming soon.');
      };
      reader.readAsDataURL(file);
    } catch (_error) {
      showError('Failed to update profile picture. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!hydrated || !sessionUser) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg-secondary)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-label-secondary)' }}>
          {hydrated ? 'Redirecting to login…' : 'Loading profile…'}
        </p>
      </div>
    );
  }

  const tabItems: TabItem[] = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      content: (
        <div className="space-y-6">
          <div className="flex items-start space-x-6">
            <ProfilePicture
              src={profileImage}
              alt="Profile picture"
              size="xl"
              editable={true}
              onImageChange={handleImageChange}
              fallbackText={`${userData.firstName} ${userData.lastName}`.trim() || sessionUser.email}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-label-primary)' }}>
                Profile Picture
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-label-secondary)' }}>
                Click the edit icon to change your picture. Recommended size is 400×400.
              </p>
            </div>
          </div>

          <ProfileForm
            initialData={userData}
            onSubmit={handleProfileUpdate}
            onCancel={handleCancel}
            loading={loading}
            showPassword={false}
            showAddress={true}
            showPersonalInfo={true}
          />
        </div>
      ),
    },
    {
      id: 'preferences',
      label: 'Preferences',
      content: (
        <div className="space-y-6">
          <div className="ios-card p-6">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-label-primary)' }}>
              Notification Preferences
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-label-tertiary)' }}>
              Preference persistence will use engagement user preferences API in a follow-up.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      content: (
        <div className="space-y-6">
          <div className="ios-card p-6">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-label-primary)' }}>
              Password & sessions
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-label-tertiary)' }}>
              Use forgot-password flow for resets. Session revoke UI is not wired yet.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Edit Profile - Settings</title>
        <meta name="description" content="Edit your profile settings" />
      </Head>

      <PageWrapper>
        <div className="min-h-screen py-8" style={{ background: 'var(--color-bg-secondary)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-label-primary)' }}>
                Settings
              </h1>
              <p className="mt-2" style={{ color: 'var(--color-label-secondary)' }}>
                Manage your account settings and preferences
              </p>
            </div>

            <div className="ios-card p-6">
              <Tab
                items={tabItems}
                defaultActiveTab="edit-profile"
                variant="underline"
                size="md"
                fullWidth={false}
                responsive={true}
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

const EditProfilePageContent = dynamic(() => Promise.resolve(EditProfilePageContentImpl), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-secondary)' }}>
      <p style={{ color: 'var(--color-label-secondary)' }}>Loading settings…</p>
    </div>
  ),
});

export default function EditProfile() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <EditProfilePageContent />
    </SnackbarProvider>
  );
}
