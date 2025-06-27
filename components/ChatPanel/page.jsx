'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { FiSend, FiUser, FiTrash2, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext'; // Assuming path
import { listenToMessages, sendMessage, deleteMessage, getUserProfile } from '@/firebase/firestore'; // Assuming path
import Button from '@/components/common/Button'; // Assuming path
import Loading from '../common/Loading'; // Assuming path

const ChatPanel = ({ conversationId, currentUserId, currentUserProfile }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherParticipant, setOtherParticipant] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null); // Ref for the scrollable container

    // --- Effects ---

    // Fetch participant info and listen to messages
    useEffect(() => {
        setIsLoadingMessages(true);
        setError(null);
        setMessages([]);
        setOtherParticipant(null);

        if (!conversationId || !currentUserId) {
            setIsLoadingMessages(false);
            setError("Invalid conversation or user ID.");
            return;
        }

        console.log(`Setting up listener & fetching info for conversation: ${conversationId}`);
        let isMounted = true;

        const unsubscribeMessages = listenToMessages(conversationId, (fetchedMessages) => {
            if (isMounted) {
                console.log(`Received message update for ${conversationId}:`, fetchedMessages);
                setMessages(fetchedMessages);
                setIsLoadingMessages(false);
            }
        }, (err) => {
             console.error(`Error listening to messages for ${conversationId}:`, err);
             if (isMounted) {
                setError("Could not load messages. Please try again later.");
                setIsLoadingMessages(false);
             }
        });

        const fetchParticipantInfo = async () => {
             try {
                 const participants = conversationId.split('_');
                 const otherUserId = participants.find(id => id !== currentUserId);
                 if (otherUserId) {
                     const profile = await getUserProfile(otherUserId);
                     if (isMounted) setOtherParticipant(profile);
                 } else {
                     console.warn("Could not determine other participant ID from conversation ID.");
                     if (isMounted) setError("Could not load participant details.");
                 }
             } catch (err) {
                 console.error("Error fetching participant info:", err);
                 if (isMounted) setError("Could not load participant details.");
             }
        };

        fetchParticipantInfo();

        return () => {
            isMounted = false;
            console.log(`Unsubscribing from messages for conversation: ${conversationId}`);
            unsubscribeMessages();
        };

    }, [conversationId, currentUserId]);

    // Scroll to bottom when messages change or initially load
    useEffect(() => {
        // Scroll logic remains the same, targets the element within the scrollable container
        if (messagesEndRef.current) {
             // Use setTimeout to ensure DOM update before scrolling
             setTimeout(() => {
                 messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
             }, 100);
        }
    }, [messages]);


    // --- Handlers ---

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage || isSending || !otherParticipant?.uid) {
            if (!otherParticipant?.uid) toast.warn("Recipient details not loaded.");
            return;
        }
        setIsSending(true); setError(null);
        try {
            await sendMessage(conversationId, currentUserId, otherParticipant.uid, trimmedMessage);
            setNewMessage('');
            console.log("Message sent successfully.");
            // Scroll immediately after sending
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 150);
        } catch (err) {
            console.error("Error sending message:", err);
            const errorText = `Failed to send message: ${err.message}`;
            setError(errorText); toast.error(errorText);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        // Optional: Add confirmation
        console.log(`Attempting to delete message: ${messageId}`);
        try {
            await deleteMessage(conversationId, messageId);
            toast.info("Message deleted.");
        } catch (err) {
             console.error("Error deleting message:", err);
             toast.error(`Failed to delete message: ${err.message}`);
        }
    };

    // --- UI Formatting ---
     const formatMessageTimestamp = (timestamp) => {
        if (!timestamp) return '';
        try { return format(timestamp, 'p'); }
        catch (e) { return '--:--'; }
    };

    // --- Render ---

    return (
        // Main container: Full height, flex column
        // **Ensure the PARENT of this component provides a constrained height**
        // Example: h-full or h-[calc(100vh-header_height)]
        <div className="flex flex-col h-full bg-white">

            {/* Chat Header */}
            <div className="flex items-center p-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-slate-200 border border-slate-300">
                    {otherParticipant?.profileImage ? (
                        <Image src={otherParticipant.profileImage} alt={otherParticipant?.displayName || 'User'} fill className="object-cover" sizes="40px" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><FiUser className="w-5 h-5 text-slate-400" /></div>
                    )}
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{otherParticipant?.displayName || 'Loading...'}</p>
                </div>
            </div>

            {/* Message Area: Takes remaining space, scrolls, MAX HEIGHT ADDED */}
            <div
                ref={chatContainerRef}
                // **FIX: Added max-h-[500px] (or adjust value) and kept overflow-y-auto**
                className="flex-grow overflow-y-auto p-4 space-y-4 bg-blue-50/30 max-h-[570px]"
            >
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full"> <Loading message="Loading messages..." /> </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-600 flex flex-col items-center justify-center h-full"> <FiAlertCircle className="w-8 h-8 mb-2"/> <span>{error}</span> </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-slate-500"> <p>No messages yet. Send the first message!</p> </div>
                ) : (
                    messages.map((msg) => {
                        const isSender = msg.senderId === currentUserId;
                        const canDelete = isSender && !msg.deleted;
                        return (
                            <div key={msg.id} className={`flex group ${isSender ? 'justify-end' : 'justify-start'}`}>
                                <div className={`relative max-w-sm md:max-w-md lg:max-w-lg px-3.5 py-2 rounded-xl shadow-sm ${ isSender ? 'bg-primary-600 text-gray-600 rounded-br-none' : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none' }`}>
                                    <p className={`text-sm leading-relaxed ${msg.deleted ? 'italic text-slate-500' : 'break-words'}`}> {msg.text} </p>
                                    <span className={`block text-[11px] mt-1 ${isSender ? 'text-primary-100 text-right' : 'text-slate-400 text-left'}`}> {formatMessageTimestamp(msg.timestamp)} </span>
                                    {canDelete && (
                                        <button onClick={() => handleDeleteMessage(msg.id)} className={`absolute top-0 p-1 rounded-full bg-white/30 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 ${isSender ? '-left-2 -translate-x-full' : '-right-2 translate-x-full'} ${isSender ? 'text-red-100 hover:text-white hover:bg-red-500' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'}`} aria-label="Delete message" title="Delete message" >
                                            <FiTrash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                {/* Invisible element to target for scrolling */}
                <div ref={messagesEndRef} style={{ height: '1px' }} />
            </div>

            {/* Message Input Area */}
            <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
                 {error && !isLoadingMessages && ( <p className="text-xs text-red-500 mb-1">{error}</p> )}
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                     <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-grow block w-full rounded-full border-slate-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 sm:text-sm py-2 px-4" disabled={isSending || isLoadingMessages || !otherParticipant} autoComplete="off" />
                    <Button type="submit" disabled={!newMessage.trim() || isSending || isLoadingMessages || !otherParticipant} isLoading={isSending} className="flex-shrink-0 !rounded-full !p-2.5" aria-label="Send message" variant='primary' >
                        <FiSend className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
