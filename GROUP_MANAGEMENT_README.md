# Group Management System

A comprehensive group management system for LuxGen that allows admins and super admins to create, manage, and monitor user groups with advanced features for training and nudge tracking.

## 🚀 Features

### Core Functionality
- **Group Creation & Management**: Create, edit, and delete groups
- **Member Management**: Add, remove, and manage group members
- **Role-based Access**: Admin, Moderator, and Member roles
- **Progress Tracking**: Visual progress indicators for group activities
- **Dashboard Overview**: Comprehensive dashboard with statistics
- **Responsive Design**: Works on all devices and screen sizes

### Advanced Features
- **Training Integration**: Track training progress for group members
- **Nudge System**: Send targeted nudges to group members
- **Reporting**: Generate detailed reports for group activities
- **Analytics**: Group-level performance metrics
- **Notifications**: Real-time notifications for group activities
- **Bulk Operations**: Manage multiple members at once

## 📁 Project Structure

```
luxgen-monorepo/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── schema/group/
│   │   │   │   ├── typeDefs.ts          # GraphQL type definitions
│   │   │   │   └── resolvers.ts         # GraphQL resolvers
│   │   │   └── services/
│   │   │       └── groupService.ts       # Group business logic
│   │   └── ...
│   └── web/
│       ├── pages/
│       │   ├── groups/
│       │   │   ├── dashboard.tsx        # Group dashboard page
│       │   │   ├── index.tsx           # Groups listing page
│       │   │   └── [id]/
│       │   │       └── members.tsx     # Group members page
│       │   └── ...
│       └── ...
└── packages/
    └── ui/
        └── src/
            ├── GroupCard/               # Group card component
            ├── GroupForm/               # Group form component
            ├── GroupMemberList/         # Member list component
            ├── GroupDashboardCard/      # Dashboard card component
            └── ...
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB
- Redis

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd luxgen-monorepo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Access the application**
   - Web App: http://demo.localhost:3000
   - API: http://demo.localhost:4000
   - GraphQL Playground: http://demo.localhost:4000/graphql

## 📚 API Documentation

### GraphQL Schema

#### Types

```graphql
type Group {
  id: ID!
  name: String!
  description: String
  color: String
  icon: String
  tenant: Tenant!
  createdBy: User!
  members: [User!]!
  memberCount: Int!
  isActive: Boolean!
  settings: GroupSettings
  createdAt: Date!
  updatedAt: Date!
}

type GroupSettings {
  allowSelfJoin: Boolean!
  requireApproval: Boolean!
  maxMembers: Int
  trainingEnabled: Boolean!
  nudgeEnabled: Boolean!
  reportingEnabled: Boolean!
  notifications: GroupNotificationSettings
}

type GroupMember {
  id: ID!
  user: User!
  group: Group!
  role: GroupMemberRole!
  joinedAt: Date!
  isActive: Boolean!
  permissions: GroupMemberPermissions
}

enum GroupMemberRole {
  ADMIN
  MODERATOR
  MEMBER
}
```

#### Queries

```graphql
# Get all groups
query GetGroups($first: Int, $after: String, $search: String) {
  groups(first: $first, after: $after, search: $search) {
    edges {
      node {
        id
        name
        description
        memberCount
        isActive
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}

# Get group by ID
query GetGroup($id: ID!) {
  group(id: $id) {
    id
    name
    description
    members {
      id
      firstName
      lastName
      email
    }
    settings {
      trainingEnabled
      nudgeEnabled
      reportingEnabled
    }
  }
}

# Get group members
query GetGroupMembers($groupId: ID!) {
  groupMembers(groupId: $groupId) {
    edges {
      node {
        id
        role
        joinedAt
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
}
```

#### Mutations

```graphql
# Create group
mutation CreateGroup($input: CreateGroupInput!) {
  createGroup(input: $input) {
    id
    name
    description
    memberCount
    isActive
  }
}

# Update group
mutation UpdateGroup($input: UpdateGroupInput!) {
  updateGroup(input: $input) {
    id
    name
    description
    settings {
      trainingEnabled
      nudgeEnabled
      reportingEnabled
    }
  }
}

# Add group member
mutation AddGroupMember($input: AddGroupMemberInput!) {
  addGroupMember(input: $input) {
    id
    role
    joinedAt
  }
}

# Remove group member
mutation RemoveGroupMember($input: RemoveGroupMemberInput!) {
  removeGroupMember(input: $input)
}

# Bulk add members
mutation BulkAddGroupMembers($groupId: ID!, $userIds: [ID!]!, $role: GroupMemberRole) {
  bulkAddGroupMembers(groupId: $groupId, userIds: $userIds, role: $role) {
    id
    role
    joinedAt
  }
}
```

## 🎨 UI Components

### GroupDashboardCard

A comprehensive dashboard card component for displaying group information.

```tsx
import { GroupDashboardCard } from '@luxgen/ui';

<GroupDashboardCard
  group={{
    id: '1',
    name: 'Development Team',
    totalUsers: 8,
    activeUsers: 6,
    role: 'Super Admin',
    progress: 7,
    maxProgress: 10,
    status: 'Active',
    members: [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' },
    ],
    tasks: 12,
    comments: 8,
  }}
  onEdit={() => console.log('Edit group')}
  onViewDetails={() => console.log('View details')}
  onManageUsers={() => console.log('Manage users')}
/>
```

### GroupCard

A card component for displaying group information in lists.

```tsx
import { GroupCard } from '@luxgen/ui';

<GroupCard
  group={{
    id: '1',
    name: 'Development Team',
    description: 'Software development team',
    color: '#3B82F6',
    icon: 'users',
    memberCount: 8,
    isActive: true,
    settings: {
      trainingEnabled: true,
      nudgeEnabled: true,
      reportingEnabled: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }}
  onEdit={(group) => console.log('Edit group', group)}
  onDelete={(groupId) => console.log('Delete group', groupId)}
  onViewMembers={(groupId) => console.log('View members', groupId)}
/>
```

### GroupForm

A comprehensive form component for creating and editing groups.

```tsx
import { GroupForm } from '@luxgen/ui';

<GroupForm
  initialData={{
    name: 'Development Team',
    description: 'Software development team',
    color: '#3B82F6',
    icon: 'users',
    settings: {
      allowSelfJoin: false,
      requireApproval: true,
      maxMembers: 20,
      trainingEnabled: true,
      nudgeEnabled: true,
      reportingEnabled: true,
    },
  }}
  onSubmit={(data) => console.log('Submit group', data)}
  onCancel={() => console.log('Cancel')}
  loading={false}
/>
```

### GroupMemberList

A component for managing group members with role management.

```tsx
import { GroupMemberList } from '@luxgen/ui';

<GroupMemberList
  members={[
    {
      id: '1',
      user: {
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN',
      },
      role: 'ADMIN',
      joinedAt: '2024-01-01T00:00:00Z',
      isActive: true,
      permissions: {
        canInviteMembers: true,
        canRemoveMembers: true,
        canEditGroup: true,
        canViewReports: true,
        canManageTraining: true,
        canSendNudges: true,
      },
    },
  ]}
  onRoleChange={(memberId, role) => console.log('Change role', memberId, role)}
  onRemoveMember={(memberId) => console.log('Remove member', memberId)}
  onAddMembers={() => console.log('Add members')}
  onBulkAction={(action, memberIds) => console.log('Bulk action', action, memberIds)}
/>
```

## 🎯 Usage Examples

### Creating a Group

```tsx
import { GroupForm } from '@luxgen/ui';

const CreateGroupPage = () => {
  const handleSubmit = async (data) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // Group created successfully
        router.push('/groups');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <GroupForm
      onSubmit={handleSubmit}
      onCancel={() => router.push('/groups')}
    />
  );
};
```

### Managing Group Members

```tsx
import { GroupMemberList } from '@luxgen/ui';

const GroupMembersPage = ({ groupId }) => {
  const [members, setMembers] = useState([]);

  const handleRoleChange = async (memberId, role) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      
      if (response.ok) {
        // Role updated successfully
        setMembers(members.map(member => 
          member.id === memberId ? { ...member, role } : member
        ));
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <GroupMemberList
      members={members}
      onRoleChange={handleRoleChange}
      onRemoveMember={handleRemoveMember}
      onAddMembers={handleAddMembers}
    />
  );
};
```

### Dashboard Overview

```tsx
import { GroupDashboardCard } from '@luxgen/ui';

const GroupDashboard = () => {
  const [groups, setGroups] = useState([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map(group => (
        <GroupDashboardCard
          key={group.id}
          group={group}
          onEdit={() => handleEditGroup(group.id)}
          onViewDetails={() => handleViewDetails(group.id)}
          onManageUsers={() => handleManageUsers(group.id)}
        />
      ))}
    </div>
  );
};
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/luxgen
REDIS_URL=redis://localhost:6379

# API
API_PORT=4000
API_URL=http://localhost:4000

# Web
WEB_PORT=3000
WEB_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Group Settings

```typescript
interface GroupSettings {
  allowSelfJoin: boolean;        // Allow users to join without approval
  requireApproval: boolean;      // Require admin approval for new members
  maxMembers: number;           // Maximum number of members
  trainingEnabled: boolean;      // Enable training tracking
  nudgeEnabled: boolean;         // Enable nudge system
  reportingEnabled: boolean;     // Enable reporting features
  notifications: {
    onMemberJoin: boolean;       // Notify on member join
    onMemberLeave: boolean;      // Notify on member leave
    onTrainingUpdate: boolean;   // Notify on training updates
    onNudgeSent: boolean;        // Notify on nudge sent
    onReportGenerated: boolean;  // Notify on report generation
  };
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern=GroupDashboardCard

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

```
packages/ui/src/GroupDashboardCard/
├── GroupDashboardCard.spec.tsx    # Component tests
├── styles.spec.ts                 # Style tests
└── README.md                      # Component documentation
```

### Test Examples

```typescript
describe('GroupDashboardCard', () => {
  it('renders without crashing', () => {
    render(<GroupDashboardCard group={mockGroupData} />);
    expect(screen.getByText('Total 8 Users')).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const mockOnEdit = jest.fn();
    render(<GroupDashboardCard group={mockGroupData} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByTitle('Edit Group'));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });
});
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start production environment
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb://mongo:27017/luxgen
REDIS_URL=redis://redis:6379
API_URL=https://api.luxgen.com
WEB_URL=https://app.luxgen.com
```

## 📊 Monitoring & Analytics

### Group Metrics

- **Total Groups**: Number of active groups
- **Total Members**: Number of group members
- **Active Users**: Currently active members
- **Training Progress**: Training completion rates
- **Nudge Effectiveness**: Nudge response rates
- **Group Performance**: Group activity metrics

### Performance Monitoring

- **API Response Times**: GraphQL query performance
- **Database Queries**: MongoDB query optimization
- **Cache Hit Rates**: Redis cache performance
- **Error Rates**: Application error tracking

## 🔒 Security

### Authentication & Authorization

- **JWT Tokens**: Secure authentication
- **Role-based Access**: Admin, Moderator, Member roles
- **Permission System**: Granular permissions for group management
- **Tenant Isolation**: Multi-tenant data separation

### Data Protection

- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: Cross-site request forgery prevention

## 🐛 Troubleshooting

### Common Issues

1. **Group Creation Fails**
   - Check user permissions
   - Verify tenant configuration
   - Check database connection

2. **Member Management Issues**
   - Verify group exists
   - Check user permissions
   - Validate member data

3. **Dashboard Not Loading**
   - Check API connectivity
   - Verify authentication
   - Check browser console for errors

### Debug Mode

```typescript
// Enable debug mode
const debugMode = process.env.NODE_ENV === 'development';

if (debugMode) {
  console.log('Group management debug mode enabled');
}
```

## 📈 Performance Optimization

### Database Optimization

- **Indexing**: Proper database indexes for queries
- **Query Optimization**: Efficient GraphQL resolvers
- **Connection Pooling**: Database connection management
- **Caching**: Redis caching for frequently accessed data

### Frontend Optimization

- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Minimized JavaScript bundles
- **Image Optimization**: Optimized images and assets
- **Caching**: Browser caching strategies

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests**
5. **Submit a pull request**

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **React Testing Library**: Component testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check this README and component documentation
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

## 🔄 Changelog

### Version 1.0.0
- Initial release of group management system
- Group creation and management
- Member management with roles
- Dashboard overview
- Responsive design
- TypeScript support
- Comprehensive testing

---

**Built with ❤️ by the LuxGen Team**
