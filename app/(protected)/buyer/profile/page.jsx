'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { FiUser, FiSave, FiCamera, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { updateProfile } from 'firebase/auth'; // Firebase Auth SDK function
import { auth } from '@/firebase/config'; // Assuming your config is here
import { useAuth } from '@/context/AuthContext'; // Assuming path
// **Verify these paths**
import { updateUserProfile as updateFirestoreProfile } from '@/firebase/firestore'; // Function to update Firestore 'users' doc
import { uploadFile, deleteFileByUrl } from '@/firebase/storage'; // Storage functions
import Button from '@/components/common/Button'; // Assuming path
import Input from '@/components/common/Input'; // Assuming path
// Removed Textarea import as bio might not be needed for buyers
import Loading from '@/components/common/Loading'; // Assuming path

const BuyerProfilePage = () => {
  const { user, userProfile, loading: authLoading } = useAuth(); // Removed forceRefreshUser
  const router = useRouter();

  // --- State ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // --- Form Hook ---
  const { register, handleSubmit, formState: { errors, isDirty }, setValue, reset } = useForm({
    // Simplified default values for buyers
    defaultValues: {
      displayName: '',
      profileImage: '',
    }
  });

  // --- Effects ---
  // Initialize form with user data
  useEffect(() => {
    if (!authLoading && user && userProfile) {
      console.log("Populating buyer form with userProfile:", userProfile);
      // Populate only relevant buyer fields
      setValue('displayName', userProfile.displayName || user.displayName || '');
      setValue('profileImage', userProfile.profileImage || user.photoURL || '');
      setImagePreview(userProfile.profileImage || user.photoURL || null);
      setIsLoading(false);
      reset({ // Reset defaults
          displayName: userProfile.displayName || user.displayName || '',
          profileImage: userProfile.profileImage || user.photoURL || '',
      });
    } else if (!authLoading && !user) {
      setIsLoading(false);
      toast.error("Please log in to view your profile.");
      router.push('/login');
    } else {
        setIsLoading(true);
    }
  }, [user, userProfile, authLoading, setValue, reset, router]);

  // Cleanup image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // --- Handlers ---
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image size should not exceed 2MB."); return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Invalid file type (JPG, PNG, WebP only)."); return;
      }
      setProfileImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setValue('profileImage', previewUrl, { shouldDirty: true });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setFormError('');
    console.log("Submitting buyer profile update:", data);

    const currentUser = auth.currentUser;
    if (!user?.uid || !currentUser) {
      setFormError("Authentication error."); setIsSubmitting(false); return;
    }

    let newImageUrl = userProfile?.profileImage || user?.photoURL || '';
    let newImagePath = userProfile?.storagePath || ''; // Keep track if you store path
    const oldImageUrl = userProfile?.profileImage || user?.photoURL;

    try {
      // 1. Upload new image if selected
      if (profileImageFile) {
        console.log("Uploading new profile image...");
        const uploadPath = `profileImages/${user.uid}`; // Same path structure
        const uploadResult = await uploadFile(profileImageFile, uploadPath);
        newImageUrl = uploadResult.url;
        newImagePath = uploadResult.path;
        console.log("New image uploaded:", uploadResult);
        setValue('profileImage', newImageUrl);
      }

      // 2. Prepare data for Firestore update (Buyer specific)
      const firestoreData = {
        displayName: data.displayName.trim(),
        profileImage: newImageUrl,
        storagePath: newImagePath, // Store path if needed
        // No title or bio for buyer unless required
        // profileCompleted might still be relevant
        profileCompleted: true,
      };
      console.log("Data for Firestore update:", firestoreData);

      // 3. Prepare data for Firebase Auth update
      const authUpdateData = {
        displayName: firestoreData.displayName,
        photoURL: newImageUrl,
      };
      console.log("Data for Auth update:", authUpdateData);

      // 4. Perform updates concurrently
      await Promise.all([
        updateFirestoreProfile(user.uid, firestoreData), // Update Firestore 'users' doc
        updateProfile(currentUser, authUpdateData)       // Update Firebase Auth profile
      ]);
      console.log("Firestore and Auth profiles updated.");

      // 5. Delete old image from Storage *after* successful updates
      if (profileImageFile && oldImageUrl && oldImageUrl !== newImageUrl) {
        console.log("Deleting old profile image:", oldImageUrl);
        try {
          await deleteFileByUrl(oldImageUrl);
          console.log("Old image deleted successfully.");
        } catch (deleteError) {
          console.error("Failed to delete old profile image:", deleteError);
          toast.warn("Profile updated, but failed to remove the old profile picture.");
        }
      }

      toast.success("Profile updated successfully!");
      setProfileImageFile(null);
      reset(firestoreData); // Reset form to new values

      // Context might update automatically via listener, or implement refresh in context

    } catch (error) {
      console.error("Error updating profile:", error);
      setFormError(`Failed to update profile: ${error.message}`);
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <Loading message="Loading profile..." />;
  }

  if (!user || !userProfile) {
      return (
          <div className="container mx-auto px-4 py-12 text-center">
              <FiAlertCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
              <p className="text-gray-600">Could not load profile data. Please try logging in again.</p>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl"> {/* Adjusted max-width */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Edit Your Buyer Profile</h1>

      {formError && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md border border-red-200 flex items-center">
          <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">

        {/* Profile Picture Section */}
        <section className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0"> {/* Slightly smaller */}
            {imagePreview ? (
              <Image
                key={imagePreview}
                src={imagePreview}
                alt="Profile picture preview"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 6rem, 7rem"
                onError={(e) => {
                    console.error("Error loading image preview:", imagePreview);
                    setImagePreview(null);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiUser className="w-1/2 h-1/2 text-gray-400" />
              </div>
            )}
            <label
              htmlFor="profileImageUpload"
              className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-opacity duration-200 group"
              title="Change profile picture"
            >
              <FiCamera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <input
                type="file"
                id="profileImageUpload"
                accept="image/jpeg, image/png, image/webp"
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-gray-800">Profile Picture</h2>
            <p className="text-sm text-gray-500 mt-1">Upload a new picture (JPG, PNG, WebP, max 2MB).</p>
          </div>
        </section>

        {/* Text Fields Section */}
        <section className="space-y-6">
          <Input
            id="displayName"
            label="Display Name"
            placeholder="Your public name"
            error={errors.displayName?.message}
            {...register('displayName', {
              required: 'Display name is required',
              minLength: { value: 3, message: 'Must be at least 3 characters' },
              maxLength: { value: 50, message: 'Must be 50 characters or less' }
            })}
          />
          {/* Removed Title and Bio inputs for buyer simplicity */}
        </section>

        {/* Form Actions */}
        <div className="flex justify-end pt-8 border-t">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting || isLoading || !isDirty} // Disable if not dirty
            size="lg"
          >
            <FiSave className="mr-2" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BuyerProfilePage;
