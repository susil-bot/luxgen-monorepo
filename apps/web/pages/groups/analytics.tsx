import React from 'react';
import Head from 'next/head';

export default function GroupAnalyticsPage() {
  return (
    <>
      <Head>
        <title>Group Analytics - LuxGen</title>
        <meta name="description" content="View group analytics" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Group Analytics</h1>
            <p className="mt-2 text-gray-600">View insights and metrics for your groups</p>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Groups</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
              <p className="text-sm text-gray-500">+2 from last month</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">156</p>
              <p className="text-sm text-gray-500">+12 from last week</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900">Engagement Rate</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">87%</p>
              <p className="text-sm text-gray-500">+5% from last month</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900">Growth Rate</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">23%</p>
              <p className="text-sm text-gray-500">+3% from last quarter</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Activity</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart placeholder - Group activity over time</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Groups</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Development Team</span>
                  <span className="text-green-600 font-semibold">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Marketing Team</span>
                  <span className="text-green-600 font-semibold">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Design Team</span>
                  <span className="text-green-600 font-semibold">82%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}