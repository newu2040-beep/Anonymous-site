# Security Specification & Threat Model for ANONYMOUSSITE

## 1. Core Data Invariants & Access Control Policy

1. **Anonymous Identity Separation**: Real user identifiers (Google account email, Firebase Auth UID) must never be required for reading confessions or comments. Public content only displays `authorAlias` and `authorAvatar`.
2. **Author Sovereignty**: Only the authenticated creator (`request.auth.uid == resource.data.authorId`) can edit or delete their own confession or comment.
3. **No Impersonation on Creation**: When creating a confession or comment, `incoming().authorId` MUST strictly match `request.auth.uid`.
4. **Counter & Aggregate Integrity**: Clients cannot arbitrary inflate counter fields (`likesCount`, `commentsCount`, `bookmarksCount`) beyond atomic batch limits or unauthorized updates.
5. **Private Profile Isolation**: A user's document in `/users/{userId}` can only be read or written by that specific user (`request.auth.uid == userId`). No user may list or scrape other users' profile records.
6. **Unique Interaction Records**: Likes and bookmarks use deterministic document IDs (`${confessionId}_${userId}` or `${userId}_${confessionId}`) with `request.auth.uid == userId` to prevent double-voting or voting on behalf of others.
7. **Abuse Reporting Safeguards**: Any authenticated user can submit a report, but reports are append-only (`create` allowed, `update` denied, `delete` denied) to prevent tampering.
8. **Private Drafts Protection**: Confession drafts stored in `/drafts/{draftId}` are strictly owned by `incoming().userId == request.auth.uid` and readable only by the owner.
9. **Private Notifications**: User notifications in `/notifications/{notificationId}` can only be read or marked read by `resource.data.recipientId == request.auth.uid`.

---

## 2. The "Dirty Dozen" Threat Payloads (Malicious Payloads)

1. **Payload 1: Impersonate Another Author on Confession Create**
   - Attempt: Create confession with `authorId: "victim-uid-999"` while `auth.uid == "attacker-123"`.
   - Expected Result: `PERMISSION_DENIED`
2. **Payload 2: Arbitrary Counter Injection**
   - Attempt: Create confession directly with `likesCount: 999999` and `viewsCount: 50000`.
   - Expected Result: `PERMISSION_DENIED` (Initial likesCount must be 0)
3. **Payload 3: Unauthenticated Confession Publication**
   - Attempt: Create confession without `request.auth` (null auth).
   - Expected Result: `PERMISSION_DENIED`
4. **Payload 4: Confession Shadow Update**
   - Attempt: Modify `authorId` or `createdAt` on an existing confession.
   - Expected Result: `PERMISSION_DENIED` (authorId and createdAt are immutable)
5. **Payload 5: Delete Another User's Confession**
   - Attempt: Delete confession where `resource.data.authorId != request.auth.uid`.
   - Expected Result: `PERMISSION_DENIED`
6. **Payload 6: Read Another User's Private Profile / Settings**
   - Attempt: `get` on `/users/victim-user-id` by `attacker-uid`.
   - Expected Result: `PERMISSION_DENIED`
7. **Payload 7: Read Blanket List of Users**
   - Attempt: List all documents in `/users`.
   - Expected Result: `PERMISSION_DENIED`
8. **Payload 8: Forge Like on Behalf of Another User**
   - Attempt: Create `/post_likes/conf123_victim999` with `userId: "victim999"` while authenticated as attacker.
   - Expected Result: `PERMISSION_DENIED`
9. **Payload 9: Modify or Tamper with Submitted Report**
   - Attempt: Update `/reports/rep123` to status "dismissed" as regular user.
   - Expected Result: `PERMISSION_DENIED`
10. **Payload 10: Read Notifications Belonging to Another User**
    - Attempt: List or get `/notifications/notif-456` where `recipientId != request.auth.uid`.
    - Expected Result: `PERMISSION_DENIED`
11. **Payload 11: Create Comment with Spoofed Author ID**
    - Attempt: Add comment to `/comments/comm-789` with `authorId: "someone-else"`.
    - Expected Result: `PERMISSION_DENIED`
12. **Payload 12: Oversized Denial of Wallet Content Attack**
    - Attempt: Post confession with content > 3000 characters or title > 120 characters.
    - Expected Result: `PERMISSION_DENIED`
