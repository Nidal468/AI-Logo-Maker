'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Using Next.js Image for existing images
import { toast } from 'react-toastify';
import { FiPlus, FiImage, FiTrash2, FiInfo, FiUploadCloud, FiLoader, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
// **Ensure these paths are correct for your project structure**
import { getGigById, createGig, updateGig } from '@/firebase/firestore';
// **CRITICAL: The implementation of these storage functions needs verification**
import { uploadMultipleFiles, deleteFileByUrl } from '@/firebase/storage';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Select from '@/components/common/Select';
import { serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp

// Define categories
const categories = [
  { value: '', label: 'Select a category' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'content-writing', label: 'Content Writing' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'video-animation', label: 'Video & Animation' },
];

// Define revision options
const revisionOptions = [
    { value: 'unlimited', label: 'Unlimited' },
    { value: '0', label: '0 Revisions' },
    { value: '1', label: '1 Revision' },
    { value: '2', label: '2 Revisions' },
    { value: '3', label: '3 Revisions' },
    { value: '5', label: '5 Revisions' },
    { value: '10', label: '10 Revisions' },
];

// --- GigForm Component ---
const GigForm = ({ gigId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const isEditing = !!gigId;

  // --- State ---
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [features, setFeatures] = useState(['']);
  // Stores image objects from Firestore: { url, path, name?, size?, type? }
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Blob URLs for previews
  const [imagesToDelete, setImagesToDelete] = useState([]); // URLs to delete from Storage

  // --- Form Hook ---
  const { register, handleSubmit, control, formState: { errors }, setValue, reset, watch } = useForm({
    defaultValues: {
      title: '', category: '', description: '', price: '', deliveryTime: '', revisions: 'unlimited',
    }
  });
  const descriptionValue = watch('description');

  // --- Fetch Data (Edit Mode) ---
  useEffect(() => {
    if (isEditing && user?.uid) {
      setIsLoading(true);
      const fetchGig = async () => {
        try {
          const gigData = await getGigById(gigId);
          if (!gigData) {
            toast.error('Service not found.'); setFormError('Service not found.');
            setIsLoading(false); router.push('/seller/gigs'); return;
          }
          if (gigData.sellerId !== user.uid) {
            toast.error('Permission denied.'); setFormError('Access denied.');
            setIsLoading(false); router.push('/seller/gigs'); return;
          }
          // Populate form
          setValue('title', gigData.title || '');
          setValue('category', gigData.category || '');
          setValue('description', gigData.description || '');
          setValue('price', gigData.price || '');
          setValue('deliveryTime', gigData.deliveryTime || '');
          setValue('revisions', gigData.revisions ?? 'unlimited');
          setFeatures(gigData.features?.length > 0 ? gigData.features : ['']);
          // Validate and set existing images
          const validImages = Array.isArray(gigData.images)
            ? gigData.images.filter(img => img && typeof img.url === 'string' && typeof img.path === 'string')
            : [];
          setExistingImages(validImages);
          console.log("Fetched and validated existing images:", validImages);

        } catch (error) {
          console.error('Error fetching gig:', error);
          toast.error('Failed to load service data.');
          setFormError('Could not load service information.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchGig();
    } else if (isEditing && !user) {
        setIsLoading(false); setFormError('Please log in to edit.'); toast.error('Authentication required.');
    } else {
        setIsLoading(false);
    }
  }, [gigId, isEditing, setValue, user, router]);

  // --- Image Handling ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = existingImages.length + newImageFiles.length;
    if (files.length === 0) return;
    if (currentTotal + files.length > 5) {
      toast.warn(`Maximum 5 images allowed.`); return;
    }
    const validFiles = []; const previews = [];
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { toast.error(`Image "${file.name}" > 5MB.`); return; }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          toast.error(`Unsupported format: "${file.name}".`); return;
      }
      validFiles.push(file); previews.push(URL.createObjectURL(file));
    });
    setNewImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...previews]);
    e.target.value = null;
  };

  const removeImage = (index, isNew) => {
    if (isNew) {
      URL.revokeObjectURL(imagePreviews[index]);
      setNewImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      const imageToRemove = existingImages[index];
      console.log("Marking existing image for deletion:", imageToRemove);
      if (imageToRemove?.url) { setImagesToDelete(prev => [...prev, imageToRemove.url]); }
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  useEffect(() => { // Cleanup previews
    return () => { imagePreviews.forEach(preview => URL.revokeObjectURL(preview)); };
  }, [imagePreviews]);

  // --- Feature Handling ---
  const addFeature = () => {
    if (features.length < 10) { setFeatures([...features, '']); }
    else { toast.info("Max features reached."); }
  };
  const removeFeature = (index) => {
    if (features.length > 1) { setFeatures(prev => prev.filter((_, i) => i !== index)); }
    else { setFeatures(['']); } // Clear last one
  };
  const updateFeature = (index, value) => {
    setFeatures(prev => prev.map((f, i) => (i === index ? value : f)));
  };

  // --- Form Submission ---
  const onSubmit = async (data) => {
    setIsSubmitting(true); setFormError('');
    console.log('--- Starting Form Submission ---');

    // 1. Validate prerequisites
    if (!user?.uid) {
      setFormError('Authentication error.'); toast.error('Please log in.');
      setIsSubmitting(false); console.log('Aborted: User not authenticated.'); return;
    }
    const validFeatures = features.map(f => f.trim()).filter(Boolean);
    if (validFeatures.length === 0) {
      toast.error('Please add at least one feature.'); setIsSubmitting(false);
      console.log('Aborted: No valid features.'); return;
    }
    if (existingImages.length === 0 && newImageFiles.length === 0) {
        toast.error('Please upload at least one image.'); setIsSubmitting(false);
        console.log('Aborted: No images.'); return;
    }

    let uploadedImageObjects = []; // Scope for try block

    try {
      // 2. Upload New Images (if any)
      if (newImageFiles.length > 0) {
        const uploadPath = `gigs/${user.uid}/${gigId || Date.now()}`;
        console.log(`Uploading ${newImageFiles.length} new image(s) to path: ${uploadPath}`);
        // **EXPECTATION: uploadMultipleFiles returns array of { url, path, name?, type?, size? }**
        uploadedImageObjects = await uploadMultipleFiles(newImageFiles, uploadPath);
        console.log('Result from uploadMultipleFiles:', uploadedImageObjects);

        // Validate upload result structure
        if (!Array.isArray(uploadedImageObjects) || uploadedImageObjects.some(img => !img?.url || !img?.path)) {
             console.error("Upload function returned invalid data structure:", uploadedImageObjects);
             throw new Error("Image upload failed. Check storage function.");
        }
        console.log("Uploaded image objects validated.");
      }

      // 3. Combine Image Data
      console.log('Existing images before combining:', existingImages);
      const validExisting = existingImages.filter(img => img?.url && img?.path); // Re-validate just in case
      const finalImageObjects = [...validExisting, ...uploadedImageObjects];
      console.log('Final combined image objects for Firestore:', finalImageObjects);
       if (finalImageObjects.some(img => img === undefined || img === null)) {
           console.error("Found undefined/null values in final image array:", finalImageObjects);
           throw new Error("Invalid image data prepared.");
       }

      // 4. Prepare Firestore Data
      const gigData = {
        title: data.title.trim(),
        category: data.category,
        description: data.description.trim(),
        price: parseFloat(data.price),
        deliveryTime: parseInt(data.deliveryTime, 10),
        revisions: data.revisions,
        features: validFeatures,
        images: finalImageObjects, // Final combined array
        updatedAt: serverTimestamp(),
        ...(!isEditing && { // Fields only for creation
            sellerId: user.uid,
            sellerName: user.displayName || 'Unknown Seller',
            createdAt: serverTimestamp(),
            rating: 0, reviewCount: 0, orderCount: 0, status: 'active',
        })
      };
      // Preserve status when editing
      if (isEditing) {
          const currentGig = await getGigById(gigId);
          gigData.status = currentGig?.status || 'active';
      }
      console.log('Final data object for Firestore:', gigData);

      // 5. Save to Firestore
      let savedGigId = gigId;
      if (isEditing) {
        await updateGig(gigId, gigData); toast.success('Service updated!');
      } else {
        savedGigId = await createGig(gigData); toast.success('Service created!');
      }
      console.log(`Firestore save successful. Gig ID: ${savedGigId}`);

      // 6. Delete Old Images from Storage (if any marked)
      console.log('Attempting to delete images from Storage:', imagesToDelete);
      if (imagesToDelete.length > 0) {
        toast.info(`Removing ${imagesToDelete.length} old image(s)...`);
        const deletionPromises = imagesToDelete.map(url =>
            deleteFileByUrl(url).catch(err => ({ url, error: err })) // Catch errors per file
        );
        const results = await Promise.allSettled(deletionPromises);
        results.forEach((result, i) => {
          if (result.status === 'rejected' || (result.status === 'fulfilled' && result.value?.error)) {
            console.error(`Failed to delete image ${imagesToDelete[i]}`, result.reason || result.value?.error);
            toast.warning(`Could not delete an old image.`);
          } else { console.log(`Deleted ${imagesToDelete[i]}`); }
        });
        setImagesToDelete([]);
      }

      // 7. Redirect
      router.push(`/seller/gigs/${savedGigId}`);

    } catch (error) {
      console.error('Error during form submission:', error);
      setFormError(`Failed to save service: ${error.message || 'Unexpected error.'}`);
      toast.error(`Failed to save service: ${error.message || 'Check console.'}`);
    } finally {
      setIsSubmitting(false);
      console.log('--- Form Submission Ended ---');
    }
  };

  // --- Render Loading ---
  if (isLoading) {
      return ( <div className="flex justify-center items-center p-10 bg-white rounded-lg shadow-md border"> <FiLoader className="animate-spin h-8 w-8 text-primary-500 mr-3" /> Loading... </div> );
  }

  // --- Render Form ---
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {formError && ( <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md border border-red-200 flex items-center"> <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> <span>{formError}</span> </div> )}

        {/* Sections: Basic Info, Description, Pricing, Features, Images */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">1. Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input id="title" label="Service Title" placeholder="e.g., I will design..." error={errors.title?.message} {...register('title', { required: 'Title is required', minLength: { value: 15, message: 'Min 15 characters' }, maxLength: { value: 80, message: 'Max 80 characters' } })} maxLength={80} />
            <Controller name="category" control={control} rules={{ required: 'Category is required' }} render={({ field }) => ( <Select id="category" label="Category" error={errors.category?.message} options={categories} {...field} /> )} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">2. Description</h2>
          <Controller name="description" control={control} rules={{ required: 'Description is required', minLength: { value: 100, message: 'Min 100 characters' }, maxLength: { value: 1200, message: 'Max 1200 characters' } }} render={({ field }) => ( <Textarea id="description" label="Service Description" placeholder="Describe your service..." rows={8} error={errors.description?.message} {...field} maxLength={1200} footerText={`${descriptionValue?.length || 0}/1200 characters`} /> )} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">3. Pricing & Scope</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input id="price" label="Price ($)" type="number" placeholder="e.g., 50" min="5" step="0.01" error={errors.price?.message} {...register('price', { required: 'Price is required', valueAsNumber: true, min: { value: 5, message: 'Min $5' }, validate: v => !isNaN(v) || 'Invalid number' })} />
            <Input id="deliveryTime" label="Delivery Time (days)" type="number" placeholder="e.g., 3" min="1" max="90" step="1" error={errors.deliveryTime?.message} {...register('deliveryTime', { required: 'Delivery time required', valueAsNumber: true, min: { value: 1, message: 'Min 1 day' }, max: { value: 90, message: 'Max 90 days' }, validate: v => Number.isInteger(v) || 'Whole days only' })} />
            <Controller name="revisions" control={control} render={({ field }) => ( <Select id="revisions" label="Revisions Included" options={revisionOptions} {...field} /> )} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">4. Features</h2>
          <p className="text-sm text-gray-600 mb-5">List items included (e.g., "Source files", "3 concepts").</p>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input id={`feature-${index}`} value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder={`Feature ${index + 1}`} className="flex-grow" aria-label={`Feature ${index + 1}`} />
                <Button type="button" onClick={() => removeFeature(index)} variant="icon" className="text-gray-500 hover:text-red-600 flex-shrink-0 p-1" disabled={features.length === 1 && feature === ''} aria-label={`Remove feature ${index + 1}`}> <FiTrash2 className="h-5 w-5" /> </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={addFeature} disabled={features.length >= 10}> <FiPlus className="mr-1 h-4 w-4" /> Add Feature </Button>
        </section>

        <section>
           <h2 className="text-xl font-semibold text-gray-800 mb-2">5. Gallery Images</h2>
           <p className="text-sm text-gray-600 mb-5">Upload up to 5 images (JPEG, PNG, GIF, WebP, max 5MB each).</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <div key={image.url || `existing-${index}`} className="relative group aspect-video border rounded-lg overflow-hidden shadow-sm bg-gray-100">
                <Image src={image.url} alt={`Existing image ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw" onError={(e) => { console.error(`Error loading image: ${image.url}`); e.target.style.display='none'; }} />
                <button type="button" onClick={() => removeImage(index, false)} className="absolute top-1.5 right-1.5 z-10 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 ring-red-500 ring-offset-1" aria-label={`Remove image ${index + 1}`}> <FiTrash2 className="h-4 w-4" /> </button>
              </div>
            ))}
            {/* New Image Previews */}
            {imagePreviews.map((preview, index) => (
              <div key={`new-${index}`} className="relative group aspect-video border rounded-lg overflow-hidden shadow-sm bg-gray-100">
                <img src={preview} alt={`New preview ${index + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(index, true)} className="absolute top-1.5 right-1.5 z-10 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 ring-red-500 ring-offset-1" aria-label={`Remove preview ${index + 1}`}> <FiTrash2 className="h-4 w-4" /> </button>
              </div>
            ))}
            {/* Upload Area */}
            {(existingImages.length + newImageFiles.length) < 5 && (
              <label htmlFor="image-upload" className="relative aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center text-gray-500 hover:border-primary-500 hover:text-primary-600 cursor-pointer transition-colors">
                <FiUploadCloud className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Add Image</span>
                <span className="text-xs mt-1">({5 - (existingImages.length + newImageFiles.length)} left)</span>
                <input id="image-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/jpeg, image/png, image/webp, image/gif" multiple onChange={handleImageChange} aria-label="Upload images" />
              </label>
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t mt-10">
           <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="w-full sm:w-auto"> <FiArrowLeft className="mr-2"/> Cancel </Button>
           <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || isLoading} className="w-full sm:w-auto"> {isEditing ? 'Save Changes' : 'Create Service'} </Button>
        </div>
      </form>
    </div>
  );
};

export default GigForm;
