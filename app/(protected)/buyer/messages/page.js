'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Assuming path
import { listenToUserConversations, getUserProfile, getOrCreateConversation } from '@/firebase/firestore'; // Assuming path
import ConversationList from '@/components/chat/ConversationList'; // Assuming path
import ChatPanel from '@/components/ChatPanel/page'; // Assuming path
import Loading from '@/components/common/Loading'; // Assuming path
import Button from '@/components/common/Button'; // Assuming path
import { FiMessageSquare, FiAlertCircle, FiInbox, FiEdit, FiSearch, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MessagesPage = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State for search

  const userType = pathname.includes('/buyer/') ? 'buyer' : 'seller';

  // --- Effects ---

  // Listen to conversations
  useEffect(() => {
    if (user?.uid) {
      setIsLoadingConversations(true); setError(null);
      console.log(`Setting up conversation listener for user: ${user.uid}`);
      const unsubscribe = listenToUserConversations(user.uid, (fetchedConversations) => {
        console.log("Received conversations update:", fetchedConversations);
        setConversations(fetchedConversations);
        setIsLoadingConversations(false);
      }, (err) => {
          console.error("Error in conversation listener:", err);
          setError("Could not load conversations list.");
          setIsLoadingConversations(false);
      });
      return () => { console.log("Unsubscribing from conversations listener."); unsubscribe(); };
    } else {
      setConversations([]); setIsLoadingConversations(false);
    }
  }, [user?.uid]);

  // Handle selecting/creating conversation based on query param
  useEffect(() => {
    const contactId = searchParams.get('contact');

    const handleContactParam = async () => {
        // Simplified exit condition
        if (!contactId || !user?.uid || !userProfile || isCreatingConversation || isLoadingConversations) {
            return;
        }

        console.log(`Handling contact param: ${contactId}`);
        const existingConversation = conversations.find(convo => convo.participants.includes(contactId));

        if (existingConversation) {
            console.log("Existing conversation found:", existingConversation.id);
            if(existingConversation.id !== selectedConversationId) {
                setSelectedConversationId(existingConversation.id);
                // Clear param only if we successfully select an existing chat
                router.replace(pathname, undefined);
            }
        } else if (contactId !== user.uid) {
            console.log("No existing conversation, attempting to create one...");
            setIsCreatingConversation(true); setError(null);
            try {
                const otherUserProfile = await getUserProfile(contactId);
                if (!otherUserProfile) throw new Error("Could not find user profile.");

                const currentUserInfo = { displayName: userProfile.displayName || user.displayName || 'Me', profileImage: userProfile.profileImage || user.photoURL || '' };
                const otherUserInfo = { displayName: otherUserProfile.displayName || 'User', profileImage: otherUserProfile.profileImage || '' };

                const newConversationId = await getOrCreateConversation(user.uid, contactId, currentUserInfo, otherUserInfo);
                console.log("Conversation created/retrieved:", newConversationId);
                // Let the listener update the list, then this effect might run again to select it
                router.replace(pathname, undefined); // Clear param after creation attempt

            } catch (err) {
                console.error("Error creating conversation:", err);
                const errorMsg = `Could not start conversation: ${err.message}`;
                setError(errorMsg); toast.error(errorMsg);
                 router.replace(pathname, undefined); // Clear param on error
            } finally {
                setIsCreatingConversation(false);
            }
        } else if (contactId === user.uid) {
             console.log("Attempted to start chat with self, clearing param.");
             router.replace(pathname, undefined);
        }
    };

     handleContactParam();

  }, [searchParams, user, userProfile, conversations, isLoadingConversations, isCreatingConversation, pathname, router, selectedConversationId]);


  // --- Handlers ---
  const handleSelectConversation = useCallback((conversationId) => {
    console.log("Selected conversation:", conversationId);
    setSelectedConversationId(conversationId);
    if (searchParams.get('contact')) {
        router.replace(pathname, undefined); // Clear contact param on manual selection
    }
  }, [pathname, router, searchParams]);

  // --- Filtering Logic ---
  const filteredConversations = conversations.filter(convo => {
    if (!searchTerm) return true;
    const otherUserId = convo.participants.find(id => id !== user?.uid);
    const otherUserInfo = otherUserId ? convo.participantInfo?.[otherUserId] : null;
    const name = otherUserInfo?.displayName?.toLowerCase() || '';
    const lastMessage = convo.lastMessage?.text?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || lastMessage.includes(searchTerm.toLowerCase());
  });


  // --- Render Logic ---

  if (authLoading) {
    return <Loading message="Authenticating..." />;
  }

  if (!user) {
      return (
          <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center h-screen">
              <FiAlertCircle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
              <p className="text-slate-600 mb-4">Please log in to view your messages.</p>
              <Button href="/login" variant="primary">Login</Button>
          </div>
      );
  }

  return (
    // **Layout:** Using CSS variables for header height for flexibility
    <div className="flex h-[calc(100vh-var(--header-height,64px))] bg-gradient-to-br from-sky-50 via-white to-blue-50">

      {/* Left Panel: Conversation List */}
      <aside className={`
          w-full md:w-[340px] lg:w-[380px] xl:w-[400px]
          
          bg-white/80 backdrop-blur-sm 
          flex flex-col transition-transform duration-300 ease-in-out px-6
          ${selectedConversationId ? 'hidden md:flex' : 'flex'}
          flex-shrink-0
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h1 className="text-lg font-bold text-slate-900">Messages</h1>
          <Button size="sm" variant="ghost" className="!p-1.5 text-slate-500 hover:text-primary-600" title="New Message (coming soon)">
            <FiEdit className="w-4 h-4"/>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-200 flex-shrink-0 sticky top-[61px] bg-white/90 backdrop-blur-sm z-10"> {/* Adjust top value based on header height */}
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiSearch className="w-4 h-4 text-slate-400" />
                </span>
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-1.5 border border-slate-300 rounded-full text-sm leading-6 text-slate-700 placeholder-slate-400 bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
            </div>
        </div>

        {/* List or Loading/Empty State */}
        <div className="flex-grow overflow-y-auto">
            {isLoadingConversations || isCreatingConversation ? (
                <div className="p-10 text-center text-slate-500">
                    <Loading message={isCreatingConversation ? "Starting chat..." : "Loading chats..."} />
                </div>
            ) : error ? (
                <div className="p-4 text-center text-red-600">{error}</div>
            ) : filteredConversations.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-10 text-slate-500 min-h-[300px]">
                    <FiInbox className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-sm font-medium mb-1">
                        {searchTerm ? "No matching conversations" : "Your inbox is empty"}
                    </p>
                    <p className="text-xs">
                        {searchTerm ? "Try a different search term." : "Contact a user to start a chat."}
                    </p>
                </div>
            ) : (
                <ConversationList
                    conversations={filteredConversations} // Use filtered list
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                    currentUserId={user.uid}
                />
            )}
        </div>
      </aside>

      {/* Right Panel: Chat Area */}
      <main className={`flex-grow flex flex-col ${selectedConversationId ? 'flex' : 'hidden md:flex'} bg-white`}>
        {selectedConversationId ? (
          <ChatPanel
            key={selectedConversationId}
            conversationId={selectedConversationId}
            currentUserId={user.uid}
            currentUserProfile={userProfile}
          />
        ) : (
          // Placeholder - More engaging
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-slate-500 bg-gradient-to-br from-sky-50 via-white to-blue-50">
             <FiUsers className="w-24 h-24 text-slate-300 mb-6" />
             <h2 className="text-xl font-semibold text-slate-700 mb-2">Your Conversations</h2>
             <p className="max-w-xs text-sm">Select a conversation from your inbox on the left to view messages.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagesPage;
