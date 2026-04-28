# Implementation Plan: Community Direct Messaging

This plan outlines the addition of user-to-user messaging ("DMs") to Rooted Daily, enabling users to connect over shared insights while maintaining strict privacy and safety controls.

## User Review Required

> [!IMPORTANT]
> **Privacy Default**: We need to decide if DMs are "Open by default" or "Disabled until enabled". Most community apps use "Open" but with easy blocking.
> **Admin Control**: I will implement a PIN-protected Admin panel to handle reports and ban users.

## Proposed Changes

### 1. Database Schema (Supabase)

We will add the following tables to handle the social graph and messaging:

#### `conversations`
Tracks active chat threads between two users.
- `id`: UUID (Primary Key)
- `user1_id`: UUID (FK to auth.users)
- `user2_id`: UUID (FK to auth.users)
- `last_message_at`: TIMESTAMPTZ
- `is_active`: BOOLEAN (Default: true)

#### `messages`
Individual chat messages with Realtime enabled.
- `id`: UUID (Primary Key)
- `conversation_id`: UUID (FK)
- `sender_id`: UUID (FK)
- `content`: TEXT
- `is_read`: BOOLEAN
- `created_at`: TIMESTAMPTZ

#### `user_relationships` (Blocking & Reporting)
- `id`: UUID
- `actor_id`: UUID (The user blocking/reporting)
- `target_id`: UUID (The user being blocked/reported)
- `type`: TEXT ('block', 'report')
- `reason`: TEXT (Optional for reports)
- `status`: TEXT ('active', 'resolved')

### 2. Mobile App (iOS/Android)

#### [NEW] [Inbox Screen](file:///Users/matt/Rooted_Daily_iOS/app/chat/inbox.tsx)
- A list of all active conversations.
- Shows the latest message and unread indicators.

#### [NEW] [Conversation Screen](file:///Users/matt/Rooted_Daily_iOS/app/chat/%5Bid%5D.tsx)
- Real-time chat interface.
- "Block" and "Report" buttons in the header.

#### [MODIFY] [CommunityInsights](file:///Users/matt/Rooted_Daily_iOS/src/components/CommunityInsights.tsx)
- Add a "Message" icon next to each insight to initiate a conversation.

### 3. Admin & Moderation

#### [NEW] [Admin Users Panel](file:///Users/matt/Rooted_Daily_iOS/app/admin/users.tsx)
- View all reported users.
- Capability to globally ban/restrict users from posting insights or sending messages.

## Verification Plan

### Automated Tests (Supabase RLS)
- Verify that User A cannot read messages in a conversation between User B and User C.
- Verify that a blocked user cannot send new messages to the blocker.

### Manual Verification
- Test the "Message" flow from a community insight.
- Test the real-time message delivery between two different accounts.
- Test the "Report" flow and verify it appears in the Admin panel.
