

'use server';

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

initializeApp();
const db = getFirestore();

interface ManageFriendRequestData {
  action: 'send' | 'accept' | 'reject' | 'remove';
  userCode?: string;
  requestId?: string;
  friendId?: string;
}

// Helper to check for existing requests or friendships.
const checkExistingConnection = async (userId1: string, userId2:string) => {
    const user1Doc = await db.collection('users').doc(userId1).get();
    const user1Friends = user1Doc.data()?.friends || [];
    if (user1Friends.includes(userId2)) {
        return { type: 'friend', message: 'You are already friends with this user.' };
    }

    const requestsRef = db.collection('friendRequests');
    const existingRequestQuery = await requestsRef
        .where('participants', 'array-contains', userId1)
        .get();

    for (const doc of existingRequestQuery.docs) {
        const participants = doc.data().participants;
        if (participants.includes(userId2)) {
            // Check direction to provide a more specific message
            if (doc.data().from === userId1) {
                 return { type: 'request', message: 'You have already sent a request to this user.' };
            }
            return { type: 'request', message: 'This user has already sent you a friend request.' };
        }
    }

    return null;
}


// Helper function to send a friend request
const sendRequest = async (currentUserId: string, userCode: string) => {
  logger.info(`[sendRequest] User ${currentUserId} sending to code: ${userCode}`);

  if (!userCode || userCode.trim() === '') {
    throw new HttpsError('invalid-argument', 'User code is required.');
  }

  const usersRef = db.collection('users');
  const userSnapshot = await usersRef.where('userCode', '==', userCode).limit(1).get();

  if (userSnapshot.empty) {
    logger.error(`[sendRequest] User with code ${userCode} not found.`);
    throw new HttpsError('not-found', 'User with that code does not exist.');
  }

  const targetUserDoc = userSnapshot.docs[0];
  const targetUserId = targetUserDoc.id;

  if (targetUserId === currentUserId) {
    throw new HttpsError('invalid-argument', "You can't send a request to yourself.");
  }
  
  const currentUserDoc = await usersRef.doc(currentUserId).get();
  if (!currentUserDoc.exists) {
    throw new HttpsError('not-found', 'Your user profile could not be found.');
  }

  const existingConnection = await checkExistingConnection(currentUserId, targetUserId);
  if (existingConnection) {
      throw new HttpsError('already-exists', existingConnection.message);
  }

  await db.collection('friendRequests').add({
    from: currentUserId,
    to: targetUserId,
    participants: [currentUserId, targetUserId],
    fromName: currentUserDoc.data()?.name || 'A user',
    fromUserCode: currentUserDoc.data()?.userCode || 'UNKNOWN',
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'Friend request sent!' };
};

// Helper function to accept a friend request
const acceptRequest = async (currentUserId: string, requestId: string) => {
  const requestRef = db.collection('friendRequests').doc(requestId);
  
  return db.runTransaction(async (transaction) => {
    const requestDoc = await transaction.get(requestRef);
    if (!requestDoc.exists || requestDoc.data()?.to !== currentUserId) {
      throw new HttpsError('permission-denied', 'You do not have permission to accept this request.');
    }
    
    const fromId = requestDoc.data()?.from;
    const toId = requestDoc.data()?.to;

    const fromUserRef = db.collection('users').doc(fromId);
    const toUserRef = db.collection('users').doc(toId);

    transaction.update(fromUserRef, { friends: FieldValue.arrayUnion(toId) });
    transaction.update(toUserRef, { friends: FieldValue.arrayUnion(fromId) });
    transaction.delete(requestRef);

    return { success: true, message: 'Friend request accepted!' };
  });
};

// Helper function to reject a friend request
const rejectRequest = async (currentUserId: string, requestId: string) => {
    const requestDocRef = db.collection('friendRequests').doc(requestId);
    const requestDoc = await requestDocRef.get();

    if (!requestDoc.exists || !requestDoc.data()?.participants.includes(currentUserId)) {
        throw new HttpsError('permission-denied', 'You do not have permission to modify this request.');
    }

    await requestDocRef.delete();
    return { success: true, message: 'Friend request rejected.' };
};


// Helper function to remove a friend
const removeFriend = async (currentUserId: string, friendId: string) => {
  const currentUserRef = db.collection('users').doc(currentUserId);
  const friendUserRef = db.collection('users').doc(friendId);

  await db.runTransaction(async (transaction) => {
    transaction.update(currentUserRef, { friends: FieldValue.arrayRemove(friendId) });
    transaction.update(friendUserRef, { friends: FieldValue.arrayRemove(currentUserId) });
  });
  
  return { success: true, message: 'Friend removed.' };
};

// Main Cloud Function
export const manageFriendRequest = onCall<ManageFriendRequestData>({ cors: true }, async (request) => {
  const currentUserId = request.auth?.uid;
  if (!currentUserId) {
    throw new HttpsError('unauthenticated', 'You must be logged in to perform this action.');
  }

  const { action, userCode, requestId, friendId } = request.data;
  logger.info(`[manageFriendRequest] Triggered with action: ${action}`, { auth: request.auth, data: request.data });

  try {
    switch (action) {
      case 'send':
        if (!userCode) throw new HttpsError('invalid-argument', 'User code is required.');
        return await sendRequest(currentUserId, userCode);
      case 'accept':
        if (!requestId) throw new HttpsError('invalid-argument', 'Request ID is required.');
        return await acceptRequest(currentUserId, requestId);
      case 'reject':
        if (!requestId) throw new HttpsError('invalid-argument', 'Request ID is required.');
        return await rejectRequest(currentUserId, requestId);
      case 'remove':
        if (!friendId) throw new HttpsError('invalid-argument', 'Friend ID is required.');
        return await removeFriend(currentUserId, friendId);
      default:
        throw new HttpsError('invalid-argument', 'Invalid action specified.');
    }
  } catch(error) {
    if (error instanceof HttpsError) {
      logger.error(`[manageFriendRequest] HttpsError: ${error.message}`, {code: error.code, details: error.details});
      throw error;
    }
    logger.error("[manageFriendRequest] Internal function error:", error);
    throw new HttpsError('internal', 'An unexpected error occurred.');
  }
});
