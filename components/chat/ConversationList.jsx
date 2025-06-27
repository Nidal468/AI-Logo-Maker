'use client';

import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';
import { FiUser } from 'react-icons/fi';

// Helper to format timestamp for display
const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatDistanceToNowStrict(date, { addSuffix: true });
    } catch (e) {
        return 'Invalid date';
    }
};

const ConversationList = ({ conversations, selectedConversationId, onSelectConversation, currentUserId }) => {

    const getOtherParticipant = (convo) => {
        if (!convo?.participants || !convo?.participantInfo || !currentUserId) return null;
        const otherUserId = convo.participants.find(id => id !== currentUserId);
        return otherUserId ? convo.participantInfo[otherUserId] : null;
    };

    return (
        <div className="overflow-y-auto flex-grow">
            {conversations.map((convo) => {
                const otherParticipant = getOtherParticipant(convo);
                const isSelected = convo.id === selectedConversationId;
                const lastMessageText = convo.lastMessage?.text || 'No messages yet...';
                const lastMessageTime = formatLastMessageTime(convo.lastMessage?.timestamp);

                return (
                    <button
                        key={convo.id}
                        onClick={() => onSelectConversation(convo.id)}
                        className={`w-full flex items-center p-3 text-left hover:bg-gray-100 transition-colors duration-150  border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                            isSelected ? 'bg-primary-50  border-primary-500' : ''
                        }`}
                        aria-current={isSelected ? 'page' : undefined}
                    >
                        {/* Profile Image */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-gray-200 border">
                            {otherParticipant?.profileImage ? (
                                <Image
                                    src={otherParticipant.profileImage}
                                    alt={otherParticipant?.displayName || 'User'}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                    onError={(e) => { e.target.style.display = 'none'; }} // Hide on error
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <FiUser className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                            {/* Add online status indicator later if needed */}
                        </div>

                        {/* Text Content */}
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className={`font-semibold text-sm text-gray-800 truncate ${isSelected ? 'text-primary-700' : ''}`}>
                                    {otherParticipant?.displayName || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                    {lastMessageTime}
                                </p>
                            </div>
                            <p className={`text-xs text-gray-500 truncate ${convo.lastMessage?.senderId !== currentUserId ? 'font-medium' : ''}`}> {/* Optionally bold unread */}
                                {convo.lastMessage?.senderId === currentUserId && "You: "}
                                {lastMessageText}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default ConversationList;
