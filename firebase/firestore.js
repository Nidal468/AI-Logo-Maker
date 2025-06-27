// firestore.js
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp, // Import Timestamp
  onSnapshot, // Import onSnapshot for real-time listeners
  writeBatch, // Import writeBatch for atomic operations
  arrayUnion // Import arrayUnion for adding messages
} from 'firebase/firestore';

import { db } from './config'; // Assuming your config file path

// --- Gigs Collection Operations (Keep existing functions) ---

export const createGig = async (gigData) => {
  if (!gigData || typeof gigData !== 'object') { throw new Error('Invalid gig data provided.'); }
  if (!gigData.sellerId?.trim()) { console.error('Attempted to create gig without sellerId:', gigData); throw new Error('Seller ID missing.'); }
  try {
    const newGigRef = doc(collection(db, 'gigs'));
    await setDoc(newGigRef, { ...gigData, id: newGigRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), status: 'active' });
    return newGigRef.id;
  } catch (error) { console.error('Error creating gig:', error); throw new Error(`Firestore error: ${error.message}`); }
};

export const getGigById = async (gigId) => {
  if (!gigId) throw new Error('Gig ID required.');
  try {
    const gigDocRef = doc(db, 'gigs', gigId); const gigDoc = await getDoc(gigDocRef);
    return gigDoc.exists() ? { id: gigDoc.id, ...gigDoc.data() } : null;
  } catch (error) { console.error(`Error fetching gig ${gigId}:`, error); throw error; }
};

export const updateGig = async (gigId, gigData) => {
  if (!gigId) throw new Error('Gig ID required for update.');
  if (!gigData || typeof gigData !== 'object') throw new Error('Invalid gig data for update.');
  try {
    const gigRef = doc(db, 'gigs', gigId);
    await updateDoc(gigRef, { ...gigData, updatedAt: serverTimestamp() }); return true;
  } catch (error) { console.error(`Error updating gig ${gigId}:`, error); throw error; }
};

export const deleteGig = async (gigId) => { // Soft delete
  if (!gigId) throw new Error('Gig ID required for deletion.');
  try {
    const gigRef = doc(db, 'gigs', gigId);
    await updateDoc(gigRef, { status: 'deleted', updatedAt: serverTimestamp() }); return true;
  } catch (error) { console.error(`Error deleting gig ${gigId}:`, error); throw error; }
};

export const getGigsBySellerId = async (sellerId) => {
  if (!sellerId) throw new Error('Seller ID required.');
  try {
    const q = query( collection(db, 'gigs'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc') );
    const querySnapshot = await getDocs(q); const gigs = [];
    querySnapshot.forEach((doc) => { gigs.push({ id: doc.id, ...doc.data() }); }); return gigs;
  } catch (error) { console.error(`Error fetching gigs for seller ${sellerId}:`, error); throw error; }
};

export const getAllGigs = async (lastVisible = null, itemsPerPage = 10, category = null) => {
  try {
    const constraints = [ where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(itemsPerPage) ];
    if (category) { constraints.splice(1, 0, where('category', '==', category)); }
    if (lastVisible) { constraints.push(startAfter(lastVisible)); }
    const q = query(collection(db, 'gigs'), ...constraints);
    const querySnapshot = await getDocs(q); const gigs = [];
    querySnapshot.forEach((doc) => { gigs.push({ id: doc.id, ...doc.data() }); });
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]; return { gigs, lastDoc };
  } catch (error) { console.error('Error fetching all gigs:', error); throw error; }
};

// --- Orders Collection Operations (Keep existing functions) ---

export const createOrder = async (orderData) => {
  if (!orderData || typeof orderData !== 'object') { throw new Error('Invalid order data.'); }
  if (!orderData.buyerId || !orderData.sellerId || !orderData.gigId || orderData.gigPrice === undefined) { console.error('Missing required order fields:', orderData); throw new Error('Missing required order info.'); }
  try {
    const newOrderRef = doc(collection(db, 'orders'));
    await setDoc(newOrderRef, { ...orderData, id: newOrderRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), status: orderData.status || 'pending' });
    return newOrderRef.id;
  } catch (error) { console.error('Error creating order:', error); throw new Error(`Firestore error: ${error.message}`); }
};

 export const getOrderById = async (orderId) => {
  if (!orderId) throw new Error('Order ID required.');
  try {
    const orderDocRef = doc(db, 'orders', orderId); const orderDoc = await getDoc(orderDocRef);
    return orderDoc.exists() ? { id: orderDoc.id, ...orderDoc.data() } : null;
  } catch (error) { console.error(`Error fetching order ${orderId}:`, error); throw error; }
};

export const updateOrderStatus = async (orderId, status, message = null) => {
  if (!orderId || !status) throw new Error('Order ID and status required.');
  try {
    const orderRef = doc(db, 'orders', orderId); const updateData = { status, updatedAt: serverTimestamp() };
    if (message !== null && message !== undefined) { updateData.statusMessage = message; }
    await updateDoc(orderRef, updateData); return true;
  } catch (error) { console.error(`Error updating status for order ${orderId}:`, error); throw error; }
};

export const getBuyerOrders = async (buyerId) => {
  if (!buyerId) throw new Error('Buyer ID required.');
  try {
    const q = query( collection(db, 'orders'), where('buyerId', '==', buyerId), orderBy('createdAt', 'desc') );
    const querySnapshot = await getDocs(q); const orders = [];
    querySnapshot.forEach((doc) => { orders.push({ id: doc.id, ...doc.data() }); }); return orders;
  } catch (error) { console.error(`Error fetching orders for buyer ${buyerId}:`, error); throw error; }
};

export const getSellerOrders = async (sellerId) => {
  if (!sellerId) throw new Error('Seller ID required.');
  try {
    const q = query( collection(db, 'orders'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc') );
    const querySnapshot = await getDocs(q); const orders = [];
    querySnapshot.forEach((doc) => { orders.push({ id: doc.id, ...doc.data() }); }); return orders;
  } catch (error) { console.error(`Error fetching orders for seller ${sellerId}:`, error); throw error; }
};

// --- User Profile Operations (Keep existing functions) ---

export const getUserProfile = async (userId) => {
    if (!userId) throw new Error('User ID required.');
    try {
        const userDocRef = doc(db, 'users', userId); const userDoc = await getDoc(userDocRef);
        return userDoc.exists() ? { uid: userDoc.id, ...userDoc.data() } : null;
    } catch (error) { console.error(`Error fetching user profile ${userId}:`, error); throw error; }
};

export const updateUserProfile = async (userId, profileData) => {
    if (!userId) throw new Error('User ID required for update.');
    if (!profileData || typeof profileData !== 'object') throw new Error('Invalid profile data.');
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { ...profileData, updatedAt: serverTimestamp() }); return true;
    } catch (error) { console.error(`Error updating user profile ${userId}:`, error); throw error; }
};

export const createUserProfile = async (userId, profileData) => {
    if (!userId) throw new Error('User ID required for creation.');
    if (!profileData || typeof profileData !== 'object') throw new Error('Invalid profile data.');
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { ...profileData, uid: userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); return true;
    } catch (error) { console.error(`Error creating user profile ${userId}:`, error); throw error; }
};

// --- Chat / Conversation Operations ---

/**
 * Creates or retrieves a conversation between two users.
 * Uses a consistent composite ID: `${uid1}_${uid2}` (sorted alphabetically).
 * @param {string} user1Id - UID of the first user.
 * @param {string} user2Id - UID of the second user.
 * @param {object} user1Info - { displayName, profileImage }
 * @param {object} user2Info - { displayName, profileImage }
 * @returns {Promise<string>} The ID of the conversation document.
 */
export const getOrCreateConversation = async (user1Id, user2Id, user1Info, user2Info) => {
  if (!user1Id || !user2Id) throw new Error("Both user IDs are required.");
  // Create a consistent, sorted conversation ID
  const participants = [user1Id, user2Id].sort();
  const conversationId = participants.join('_');
  const conversationRef = doc(db, 'conversations', conversationId);

  try {
      const docSnap = await getDoc(conversationRef);
      if (docSnap.exists()) {
          console.log(`Conversation ${conversationId} already exists.`);
          // Optionally update participant info if needed
          await updateDoc(conversationRef, {
              [`participantInfo.${user1Id}`]: user1Info,
              [`participantInfo.${user2Id}`]: user2Info,
              // Don't overwrite lastMessage or timestamps here
          });
          return conversationId;
      } else {
          console.log(`Creating new conversation ${conversationId}`);
          await setDoc(conversationRef, {
              id: conversationId,
              participants: participants,
              participantInfo: {
                  [user1Id]: user1Info,
                  [user2Id]: user2Info,
              },
              lastMessage: null, // No messages yet
              lastUpdatedAt: serverTimestamp(),
              // Initialize unread counts (optional)
              // unreadCount: { [user1Id]: 0, [user2Id]: 0 }
          });
          return conversationId;
      }
  } catch (error) {
      console.error("Error getting or creating conversation:", error);
      throw new Error("Could not initiate conversation.");
  }
};

/**
 * Listens for real-time updates to a user's conversations.
 * @param {string} userId - The UID of the current user.
 * @param {function} callback - Function to call with the conversations array on update.
 * @returns {function} Unsubscribe function.
 */
export const listenToUserConversations = (userId, callback) => {
  if (!userId) return () => {}; // Return no-op unsubscribe if no userId

  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastUpdatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    callback(conversations);
  }, (error) => {
    console.error("Error listening to conversations:", error);
    // Handle error appropriately in the UI
    callback([]); // Return empty array on error
  });

  return unsubscribe; // Return the unsubscribe function
};

/**
 * Listens for real-time updates to messages within a conversation.
 * @param {string} conversationId - The ID of the conversation.
 * @param {function} callback - Function to call with the messages array on update.
 * @returns {function} Unsubscribe function.
 */
export const listenToMessages = (conversationId, callback) => {
  if (!conversationId) return () => {};

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc')); // Order messages chronologically

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      // Ensure timestamp is converted correctly if needed
      const data = doc.data();
      messages.push({
           id: doc.id,
           ...data,
           // Convert Firestore Timestamp to JS Date if necessary for display/formatting
           timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : null
      });
    });
    callback(messages);
  }, (error) => {
    console.error(`Error listening to messages for conversation ${conversationId}:`, error);
    callback([]);
  });

  return unsubscribe;
};

/**
* Sends a message within a conversation.
* Updates the conversation's last message and timestamp.
* @param {string} conversationId - The ID of the conversation.
* @param {string} senderId - UID of the message sender.
* @param {string} receiverId - UID of the message receiver.
* @param {string} text - The message content.
* @returns {Promise<void>}
*/
export const sendMessage = async (conversationId, senderId, receiverId, text) => {
  if (!conversationId || !senderId || !receiverId || !text?.trim()) {
      throw new Error("Missing required fields for sending message.");
  }

  const conversationRef = doc(db, 'conversations', conversationId);
  const messagesRef = collection(conversationRef, 'messages');
  const newMessageRef = doc(messagesRef); // Generate ref for the new message

  const messageData = {
      id: newMessageRef.id, // Store message ID within the document
      senderId: senderId,
      receiverId: receiverId,
      text: text.trim(),
      timestamp: serverTimestamp(),
      deleted: false, // Default for new messages
      // isRead: false, // Optional read status
  };

  const lastMessageData = {
      text: text.trim(),
      senderId: senderId,
      timestamp: serverTimestamp(), // Use server timestamp here too
  };

  try {
      // Use a batch write for atomicity
      const batch = writeBatch(db);

      // 1. Add the new message document
      batch.set(newMessageRef, messageData);

      // 2. Update the parent conversation document
      batch.update(conversationRef, {
          lastMessage: lastMessageData,
          lastUpdatedAt: serverTimestamp(),
          // Optionally update unread counts here
          // [`unreadCount.${receiverId}`]: increment(1) // Requires importing increment
      });

      // Commit the batch
      await batch.commit();
      console.log("Message sent and conversation updated.");

  } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Could not send message.");
  }
};


/**
 * Deletes a message (soft delete).
 * Sets the 'deleted' flag to true.
 * @param {string} conversationId - The ID of the conversation.
 * @param {string} messageId - The ID of the message to delete.
 * @returns {Promise<void>}
 */
export const deleteMessage = async (conversationId, messageId) => {
  if (!conversationId || !messageId) {
      throw new Error("Conversation ID and Message ID are required for deletion.");
  }
  try {
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await updateDoc(messageRef, {
          deleted: true,
          text: "This message was deleted." // Optional: Replace text
          // Keep senderId and timestamp for context
      });
      console.log(`Message ${messageId} in conversation ${conversationId} marked as deleted.`);
      // Note: This doesn't update the conversation's lastMessage automatically if the deleted message was the last one.
      // Handling that requires more complex logic (fetching messages to find the new last one).
  } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Could not delete message.");
  }
};
