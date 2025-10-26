import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function GroupsPage() {
  const router = useRouter();

  const handleCreateGroup = () => {
    router.push('/groups/create');
  };

  const handleViewAnalytics = () => {
    router.push('/groups/analytics');
  };

  return (
    <>
      <Head>
        <title>Groups - LuxGen</title>
        <meta name="description" content="Manage your groups and team members" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
            <p className="mt-2 text-gray-600">Manage your groups and team members</p>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex space-x-4">
            <button
              onClick={handleCreateGroup}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create New Group
            </button>
            <button
              onClick={handleViewAnalytics}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              View Analytics
            </button>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Group Cards */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Development Team</h3>
              <p className="text-gray-600 mb-4">Software development and engineering team</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">12 members</span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Team</h3>
              <p className="text-gray-600 mb-4">Marketing and communications team</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">8 members</span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Design Team</h3>
              <p className="text-gray-600 mb-4">UI/UX design and creative team</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">6 members</span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}