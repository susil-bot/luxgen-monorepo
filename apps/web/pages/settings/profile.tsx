import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Tab, TabItem, ProfileForm, ProfileFormData, ProfilePicture, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageWrapper } from '@luxgen/ui';

const EditProfilePageContentImpl: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80');

  // Sample user data - in real app, this would come from API
  const [userData, setUserData] = useState<ProfileFormData>({
    firstName: 'Charlene',
    lastName: 'Reed',
    email: 'charlenereed@gmail.com',
    username: 'Charlene Reed',
    password: '**********',
    dateOfBirth: '1990-01-25',
    permanentAddress: 'San Jose, California, USA',
    presentAddress: 'San Jose, California, USA',
    city: 'San Jose',
    country: 'USA',
    postalCode: '45962',
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData(data);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (file: File) => {
    try {
      // Simulate image upload
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        showSuccess('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showError('Failed to update profile picture. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const tabItems: TabItem[] = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      content: (
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-start space-x-6">
            <ProfilePicture
              src={profileImage}
              alt="Profile picture"
              size="xl"
              editable={true}
              onImageChange={handleImageChange}
              fallbackText={`${userData.firstName} ${userData.lastName}`}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profile Picture
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Click on the edit icon to change your profile picture. Recommended size is 400x400 pixels.
              </p>
              <button
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Change Picture
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <ProfileForm
            initialData={userData}
            onSubmit={handleProfileUpdate}
            onCancel={handleCancel}
            loading={loading}
            showPassword={true}
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
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Receive push notifications</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-600">Receive SMS updates</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                  <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Activity Status</h4>
                  <p className="text-sm text-gray-600">Show when you're online</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      content: (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Update Password
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable 2FA</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Enable
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">Current Session</p>
                  <p className="text-xs text-gray-600">Chrome on macOS • San Jose, CA</p>
                </div>
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">Mobile App</p>
                  <p className="text-xs text-gray-600">iOS App • Last active 2 hours ago</p>
                </div>
                <button className="text-xs text-red-600 hover:text-red-800">Revoke</button>
              </div>
            </div>
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
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Tab
                items={tabItems}
                defaultActiveTab="edit-profile"
                variant="underline"
                size="md"
                fullWidth={false}
                responsive={true}
                onTabChange={(tabId) => console.log('Tab changed to:', tabId)}
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

// This page is purely interactive settings UI with no SEO value, and pulls in
// several @luxgen/ui components (Tab, ProfileForm, ProfilePicture) whose
// render output isn't guaranteed safe to execute in Next.js's Node-based
// static export step. Rather than chase the exact throw inside a shared UI
// package, opt this page out of static prerendering entirely via
// next/dynamic's ssr:false - it still works normally once hydrated in the
// browser (including on Vercel), it's just never pre-rendered to static HTML
// at build time. This is the standard fix for "Export encountered errors on
// following paths" when a page is inherently client-only.
const EditProfilePageContent = dynamic(() => Promise.resolve(EditProfilePageContentImpl), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading settings…</p>
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

