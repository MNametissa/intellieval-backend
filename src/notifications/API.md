# Notifications Module API Documentation

Base URL: `/api/v1/notifications`

## Overview

In-app notifications module for user notifications. Notifies users about campagne start/end, new cours uploads, and system events.

**Note**: Email notifications are sent automatically via event listeners and are not directly accessible via API.

## Endpoints

### 1. Get User Notifications

**GET** `/api/v1/notifications`

Retrieves all notifications for the authenticated user.

**Authentication**: Required
**Authorization**: Any authenticated user

**Query Parameters**:
- `unreadOnly` (optional, boolean): Filter to show only unread notifications

**Success Response** (200 OK):
```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "CAMPAGNE_STARTED",
      "titre": "Nouvelle campagne d'évaluation",
      "message": "La campagne 'Évaluation Semestre 1 - POO' a démarré",
      "data": {
        "campagneId": "uuid",
        "matiereId": "uuid",
        "dateDebut": "2024-01-15T00:00:00.000Z",
        "dateFin": "2024-01-31T23:59:59.000Z"
      },
      "read": false,
      "createdAt": "2024-01-15T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "COURS_UPLOADED",
      "titre": "Nouveau cours disponible",
      "message": "Un nouveau cours 'Chapitre 1 - Introduction' a été ajouté pour POO",
      "data": {
        "coursId": "uuid",
        "matiereId": "uuid",
        "titre": "Chapitre 1 - Introduction"
      },
      "read": true,
      "createdAt": "2024-01-14T10:30:00.000Z"
    }
  ],
  "unreadCount": 1,
  "totalCount": 2
}
```

**Examples**:
```bash
# Get all notifications
GET /api/v1/notifications

# Get only unread notifications
GET /api/v1/notifications?unreadOnly=true
```

---

### 2. Get Unread Count

**GET** `/api/v1/notifications/unread-count`

Retrieves the count of unread notifications for the authenticated user.

**Authentication**: Required
**Authorization**: Any authenticated user

**Success Response** (200 OK):
```json
{
  "unreadCount": 5
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/v1/notifications/unread-count \
  -H "Authorization: Bearer <token>"
```

---

### 3. Mark Notification as Read

**POST** `/api/v1/notifications/:id/read`

Marks a specific notification as read.

**Authentication**: Required
**Authorization**: Any authenticated user (own notifications only)

**URL Parameters**:
- `id`: Notification UUID

**Success Response** (200 OK):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "CAMPAGNE_STARTED",
  "titre": "Nouvelle campagne d'évaluation",
  "message": "La campagne 'Évaluation Semestre 1 - POO' a démarré",
  "data": {
    "campagneId": "uuid"
  },
  "read": true,
  "createdAt": "2024-01-15T00:00:00.000Z",
  "readAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Notification not found or doesn't belong to user

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/notifications/notif-uuid/read \
  -H "Authorization: Bearer <token>"
```

---

### 4. Mark All Notifications as Read

**POST** `/api/v1/notifications/read-all`

Marks all notifications as read for the authenticated user.

**Authentication**: Required
**Authorization**: Any authenticated user

**Success Response** (200 OK):
```json
{
  "message": "All notifications marked as read",
  "updatedCount": 5
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/v1/notifications/read-all \
  -H "Authorization: Bearer <token>"
```

---

### 5. Delete Notification

**DELETE** `/api/v1/notifications/:id`

Deletes a specific notification.

**Authentication**: Required
**Authorization**: Any authenticated user (own notifications only)

**URL Parameters**:
- `id`: Notification UUID

**Success Response** (204 No Content)

**Error Responses**:
- `404 Not Found`: Notification not found or doesn't belong to user

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/notifications/notif-uuid \
  -H "Authorization: Bearer <token>"
```

---

### 6. Delete All Notifications

**DELETE** `/api/v1/notifications`

Deletes all notifications for the authenticated user.

**Authentication**: Required
**Authorization**: Any authenticated user

**Success Response** (204 No Content)

**Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### Notification Entity
```typescript
{
  id: string;              // UUID
  userId: string;          // FK to User
  type: NotificationType;  // Notification category
  titre: string;           // Notification title
  message: string;         // Notification message
  data?: object;           // Additional structured data
  read: boolean;           // Read status
  readAt?: Date;           // When marked as read
  createdAt: Date;
  user?: User;
}
```

### NotificationType Enum
```typescript
enum NotificationType {
  CAMPAGNE_STARTED = 'CAMPAGNE_STARTED',
  CAMPAGNE_ENDING = 'CAMPAGNE_ENDING',
  CAMPAGNE_ENDED = 'CAMPAGNE_ENDED',
  COURS_UPLOADED = 'COURS_UPLOADED',
  EVALUATION_RECEIVED = 'EVALUATION_RECEIVED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}
```

### NotificationFilterDto
```typescript
{
  unreadOnly?: boolean;    // Default: false
}
```

---

## Notification Types Explained

### 1. CAMPAGNE_STARTED
**Sent to**: Students in the target filiere
**Trigger**: When a campagne's dateDebut is reached
**Data**:
```json
{
  "campagneId": "uuid",
  "matiereId": "uuid",
  "titre": "Évaluation Semestre 1 - POO",
  "dateDebut": "2024-01-15T00:00:00.000Z",
  "dateFin": "2024-01-31T23:59:59.000Z"
}
```

### 2. CAMPAGNE_ENDING
**Sent to**: Students who haven't completed evaluation
**Trigger**: 24 hours before campagne's dateFin
**Data**:
```json
{
  "campagneId": "uuid",
  "matiereId": "uuid",
  "titre": "Évaluation Semestre 1 - POO",
  "dateFin": "2024-01-31T23:59:59.000Z",
  "hoursRemaining": 24
}
```

### 3. CAMPAGNE_ENDED
**Sent to**: Enseignants teaching the evaluated matiere
**Trigger**: When a campagne's dateFin is reached
**Data**:
```json
{
  "campagneId": "uuid",
  "matiereId": "uuid",
  "titre": "Évaluation Semestre 1 - POO",
  "totalEvaluations": 85,
  "participationRate": 78.5
}
```

### 4. COURS_UPLOADED
**Sent to**: Students in the matiere's filiere
**Trigger**: When an enseignant uploads new cours
**Data**:
```json
{
  "coursId": "uuid",
  "matiereId": "uuid",
  "titre": "Chapitre 1 - Introduction",
  "uploadedBy": "Dr. Dupont"
}
```

### 5. EVALUATION_RECEIVED
**Sent to**: Enseignants
**Trigger**: When they receive new evaluation
**Data**:
```json
{
  "matiereId": "uuid",
  "matiere": "Programmation Orientée Objet",
  "averageScore": 4.5,
  "totalEvaluations": 45
}
```

### 6. SYSTEM_ALERT
**Sent to**: Admins or specific users
**Trigger**: System events, errors, or administrative alerts
**Data**: Variable based on alert type

---

## Email Notifications

**Note**: Email notifications are sent automatically via event listeners and are NOT accessible via REST API.

### Email Types Sent

1. **Welcome Email**: When user account is created
2. **Campagne Started**: When evaluation campagne begins
3. **Campagne Reminder**: 24h before campagne ends
4. **Cours Available**: When new course material uploaded
5. **Password Reset**: When user requests password reset

### Email Configuration

Configured via environment variables:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@intellieval.com
SMTP_PASS=password
SMTP_FROM=IntelliEval <noreply@intellieval.com>
```

---

## Business Rules

### 1. Notification Creation
- Automatically created by event listeners
- Cannot be created directly via API
- System generates based on events

### 2. Access Control
- Users can only access their own notifications
- Cannot view other users' notifications
- Admin has no special privileges for notifications

### 3. Read Status
- Initially `read: false`
- User marks as read via API
- `readAt` timestamp recorded

### 4. Notification Lifetime
- Notifications persist indefinitely
- Users can delete individually or all at once
- Optional: Auto-cleanup after 30 days (not implemented)

### 5. Real-time Updates
- Polling recommended: every 30-60 seconds
- WebSocket support: future enhancement
- Unread count badge in UI

---

## Events That Trigger Notifications

### From Campagnes Module
- `campagne.started` → CAMPAGNE_STARTED notification
- `campagne.ending.soon` → CAMPAGNE_ENDING notification
- `campagne.ended` → CAMPAGNE_ENDED notification

### From Cours Module
- `cours.uploaded` → COURS_UPLOADED notification

### From Reponses Module
- `evaluation.submitted` → EVALUATION_RECEIVED notification (to enseignant)

### From Users Module
- `user.created` → Welcome email (no in-app notification)

---

## Integration with Frontend

### Notification Bell Icon
```javascript
// Poll for unread count
setInterval(async () => {
  const { unreadCount } = await fetch('/api/v1/notifications/unread-count')
    .then(r => r.json());
  updateBadge(unreadCount);
}, 60000); // Every minute
```

### Notification Panel
```javascript
// Get all notifications
const { notifications, unreadCount } = await fetch('/api/v1/notifications')
  .then(r => r.json());

// Mark as read when clicked
const markAsRead = async (notificationId) => {
  await fetch(`/api/v1/notifications/${notificationId}/read`, {
    method: 'POST'
  });
};
```

### Mark All as Read
```javascript
const markAllAsRead = async () => {
  await fetch('/api/v1/notifications/read-all', {
    method: 'POST'
  });
};
```

---

## Related Modules

- **Campagnes**: Triggers campagne-related notifications
- **Cours**: Triggers cours upload notifications
- **Reponses**: Triggers evaluation received notifications
- **Users**: User accounts receive notifications

---

## Use Cases

### 1. Student checks notifications
```bash
GET /api/v1/notifications
```

### 2. Display unread count in UI badge
```bash
GET /api/v1/notifications/unread-count
```

### 3. Mark notification as read when clicked
```bash
POST /api/v1/notifications/notif-uuid/read
```

### 4. Clear all notifications
```bash
DELETE /api/v1/notifications
```

### 5. Show only unread notifications
```bash
GET /api/v1/notifications?unreadOnly=true
```

---

## UI/UX Recommendations

### Notification Panel Design
```
┌─────────────────────────────────────┐
│  Notifications               [Clear] │
├─────────────────────────────────────┤
│  🔵 Nouvelle campagne d'évaluation   │
│     La campagne 'POO' a démarré      │
│     Il y a 2 heures                 │
├─────────────────────────────────────┤
│  ⚪ Nouveau cours disponible         │
│     Chapitre 1 ajouté pour POO      │
│     Il y a 1 jour                   │
├─────────────────────────────────────┤
│  [Marquer tout comme lu]            │
└─────────────────────────────────────┘

🔵 = Unread
⚪ = Read
```

### Notification Types with Icons
- 📚 CAMPAGNE_STARTED
- ⏰ CAMPAGNE_ENDING
- ✅ CAMPAGNE_ENDED
- 📄 COURS_UPLOADED
- ⭐ EVALUATION_RECEIVED
- ⚠️ SYSTEM_ALERT

---

## Performance Considerations

1. **Indexing**: Index on userId and read status
2. **Pagination**: Implement for users with many notifications
3. **Caching**: Cache unread count for 30 seconds
4. **Cleanup**: Implement soft delete or archival after 30 days
5. **Batch operations**: Mark all as read in single query

---

## Future Enhancements

1. **WebSocket**: Real-time push notifications
2. **Preferences**: User notification preferences
3. **Categories**: Filter by notification type
4. **Archival**: Auto-archive old notifications
5. **Rich notifications**: Support for images, actions
6. **Push notifications**: Browser/mobile push support
