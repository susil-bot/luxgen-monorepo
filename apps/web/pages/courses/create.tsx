import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo } from '@luxgen/ui';
import { createHandleUserAction } from '../../lib/user-actions';
import { TenantBanner } from '../../components/tenant/TenantBanner';

interface CreateCourseProps {
  tenant: string;
}

export default function CreateCourse({ tenant }: CreateCourseProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'Beginner',
    category: '',
    tags: '',
  });

  useState(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser({
          name: `${parsed.firstName} ${parsed.lastName}`,
          email: parsed.email,
          role: parsed.role,
        });
      } catch {
        setUser(getDefaultUser());
      }
    } else {
      setUser(getDefaultUser());
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, this would POST to /api/courses
    console.log('Creating course:', formData);

    // Navigate to courses list
    router.push('/courses');
  };

  const handleCancel = () => {
    router.push('/courses');
  };

  return (
    <>
      <Head>
        <title>Create Course - LuxGen</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user}
        onUserAction={createHandleUserAction(router)}
        logo={getDefaultLogo()}
        sidebarCollapsible
        responsive
      >
        <TenantBanner tenant={tenant} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="ios-large-title mb-1">Create New Course</h1>
            <p className="text-secondary text-sm">Fill in the details below to create a new course</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="surface p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-primary mb-2">
                  Course Title <span style={{ color: 'var(--color-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Advanced React Development"
                  className="input-field"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
                  Description <span style={{ color: 'var(--color-red)' }}>*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what students will learn in this course..."
                  className="input-field resize-none"
                />
              </div>

              {/* Instructor */}
              <div>
                <label htmlFor="instructor" className="block text-sm font-medium text-primary mb-2">
                  Instructor <span style={{ color: 'var(--color-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="instructor"
                  name="instructor"
                  required
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="Instructor name"
                  className="input-field"
                />
              </div>

              {/* Duration & Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-primary mb-2">
                    Duration <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    required
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 8 weeks"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-primary mb-2">
                    Level <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <select
                    id="level"
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-primary mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Web Development, Data Science, Design"
                  className="input-field"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-primary mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Comma-separated tags (e.g., react, javascript, frontend)"
                  className="input-field"
                />
                <p className="text-xs text-secondary mt-1">
                  Separate tags with commas to help students find your course
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button type="button" onClick={handleCancel} className="ios-btn-secondary" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="ios-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="ios-spinner w-4 h-4" />
                    Creating...
                  </span>
                ) : (
                  'Create Course'
                )}
              </button>
            </div>
          </form>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (context: any) => {
  const { tenant } = context.query;
  return {
    props: {
      tenant: tenant || 'demo',
    },
  };
};
