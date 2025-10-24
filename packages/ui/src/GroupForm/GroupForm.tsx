import React, { useState, useEffect } from 'react';
import { withSSR } from '../ssr';
import { defaultTheme, TenantTheme } from '../theme';
import { Form } from '../Form';
import { Input } from '../Input';
import { TextArea } from '../TextArea';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';
import { Button } from '../Button';

export interface GroupFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  settings: {
    allowSelfJoin: boolean;
    requireApproval: boolean;
    maxMembers: number | null;
    trainingEnabled: boolean;
    nudgeEnabled: boolean;
    reportingEnabled: boolean;
    notifications: {
      onMemberJoin: boolean;
      onMemberLeave: boolean;
      onTrainingUpdate: boolean;
      onNudgeSent: boolean;
      onReportGenerated: boolean;
    };
  };
}

export interface GroupFormProps {
  tenantTheme?: TenantTheme;
  initialData?: Partial<GroupFormData>;
  onSubmit: (data: GroupFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  title?: string;
  submitText?: string;
  cancelText?: string;
}

const GroupFormComponent: React.FC<GroupFormProps> = ({
  tenantTheme = defaultTheme,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  className = '',
  title = 'Create Group',
  submitText = 'Create Group',
  cancelText = 'Cancel',
  ...props
}) => {
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'users',
    settings: {
      allowSelfJoin: false,
      requireApproval: true,
      maxMembers: null,
      trainingEnabled: true,
      nudgeEnabled: true,
      reportingEnabled: true,
      notifications: {
        onMemberJoin: true,
        onMemberLeave: true,
        onTrainingUpdate: true,
        onNudgeSent: true,
        onReportGenerated: true,
      },
    },
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }

    if (formData.settings.maxMembers && formData.settings.maxMembers < 1) {
      newErrors['settings.maxMembers'] = 'Maximum members must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', color: '#3B82F6' },
    { value: '#10B981', label: 'Green', color: '#10B981' },
    { value: '#F59E0B', label: 'Yellow', color: '#F59E0B' },
    { value: '#EF4444', label: 'Red', color: '#EF4444' },
    { value: '#8B5CF6', label: 'Purple', color: '#8B5CF6' },
    { value: '#EC4899', label: 'Pink', color: '#EC4899' },
    { value: '#6B7280', label: 'Gray', color: '#6B7280' },
    { value: '#1F2937', label: 'Dark', color: '#1F2937' },
  ];

  const iconOptions = [
    { value: 'users', label: 'Users' },
    { value: 'user-group', label: 'User Group' },
    { value: 'academic-cap', label: 'Academic Cap' },
    { value: 'book-open', label: 'Book Open' },
    { value: 'lightning-bolt', label: 'Lightning Bolt' },
    { value: 'chart-bar', label: 'Chart Bar' },
    { value: 'cog', label: 'Cog' },
    { value: 'star', label: 'Star' },
  ];

  return (
    <div className={`max-w-2xl mx-auto ${className}`} {...props}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Group Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div>
                <Select
                  label="Group Icon"
                  value={formData.icon}
                  onChange={(value) => handleInputChange('icon', value)}
                  options={iconOptions}
                />
              </div>
            </div>

            <div>
              <TextArea
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter group description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('color', option.value)}
                    className={`
                      w-12 h-12 rounded-lg border-2 transition-all duration-200
                      ${formData.color === option.value
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                    style={{ backgroundColor: option.color }}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Group Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Group Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Maximum Members"
                  type="number"
                  value={formData.settings.maxMembers || ''}
                  onChange={(e) => handleInputChange('settings.maxMembers', e.target.value ? parseInt(e.target.value) : null)}
                  error={errors['settings.maxMembers']}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Checkbox
                label="Allow self-join"
                checked={formData.settings.allowSelfJoin}
                onChange={(checked) => handleInputChange('settings.allowSelfJoin', checked)}
                description="Allow users to join the group without approval"
              />

              <Checkbox
                label="Require approval for new members"
                checked={formData.settings.requireApproval}
                onChange={(checked) => handleInputChange('settings.requireApproval', checked)}
                description="New members need approval from group admins"
              />

              <Checkbox
                label="Enable training tracking"
                checked={formData.settings.trainingEnabled}
                onChange={(checked) => handleInputChange('settings.trainingEnabled', checked)}
                description="Track training progress for group members"
              />

              <Checkbox
                label="Enable nudge system"
                checked={formData.settings.nudgeEnabled}
                onChange={(checked) => handleInputChange('settings.nudgeEnabled', checked)}
                description="Send nudges to group members"
              />

              <Checkbox
                label="Enable reporting"
                checked={formData.settings.reportingEnabled}
                onChange={(checked) => handleInputChange('settings.reportingEnabled', checked)}
                description="Generate reports for group activities"
              />
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            
            <div className="space-y-3">
              <Checkbox
                label="Notify on member join"
                checked={formData.settings.notifications.onMemberJoin}
                onChange={(checked) => handleInputChange('settings.notifications.onMemberJoin', checked)}
                description="Send notification when a new member joins"
              />

              <Checkbox
                label="Notify on member leave"
                checked={formData.settings.notifications.onMemberLeave}
                onChange={(checked) => handleInputChange('settings.notifications.onMemberLeave', checked)}
                description="Send notification when a member leaves"
              />

              <Checkbox
                label="Notify on training updates"
                checked={formData.settings.notifications.onTrainingUpdate}
                onChange={(checked) => handleInputChange('settings.notifications.onTrainingUpdate', checked)}
                description="Send notification when training is updated"
              />

              <Checkbox
                label="Notify on nudge sent"
                checked={formData.settings.notifications.onNudgeSent}
                onChange={(checked) => handleInputChange('settings.notifications.onNudgeSent', checked)}
                description="Send notification when nudges are sent"
              />

              <Checkbox
                label="Notify on report generated"
                checked={formData.settings.notifications.onReportGenerated}
                onChange={(checked) => handleInputChange('settings.notifications.onReportGenerated', checked)}
                description="Send notification when reports are generated"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </Button>
            )}
            
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const GroupForm = withSSR(GroupFormComponent);
