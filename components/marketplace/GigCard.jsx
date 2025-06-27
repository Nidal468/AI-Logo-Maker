import Link from 'next/link';
import Image from 'next/image';
import { FiStar, FiHeart } from 'react-icons/fi';

const GigCard = ({ gig }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/marketplace/gig/${gig.id}`}>
        <div className="relative h-48 bg-gray-200">
          {gig.images && gig.images.length > 0 ? (
            <Image
              src={gig.images[0].url}
              alt={gig.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-600 hover:text-primary-600 focus:outline-none">
            <FiHeart className="w-5 h-5" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex-shrink-0 mr-2">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
              {gig.seller?.displayName?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
          <Link href={`/seller/${gig.sellerId}`} className="text-sm font-medium text-gray-800 hover:text-primary-600">
            {gig.seller?.displayName || 'Seller'}
          </Link>
        </div>

        <Link href={`/marketplace/gig/${gig.id}`}>
          <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-2 hover:text-primary-600">
            {gig.title}
          </h3>
        </Link>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <FiStar className="text-yellow-400 mr-1" />
          <span className="font-medium">{gig.rating || '0'}</span>
          <span className="mx-1">•</span>
          <span>({gig.reviewCount || '0'} reviews)</span>
        </div>

        <div className="border-t pt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">Starting at</span>
          <span className="text-lg font-semibold text-gray-900">${gig.price}</span>
        </div>
      </div>
    </div>
  );
};

export default GigCard;