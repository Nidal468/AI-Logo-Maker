import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config'; // Assuming your config file path
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a single file to Firebase Storage.
 * @param {File} file - The file object to upload.
 * @param {string} path - The destination path in storage (e.g., 'images/profile').
 * @returns {Promise<{url: string, path: string, name: string, type: string, size: number}>} Object containing URL, path, and metadata.
 * @throws {Error} If upload fails.
 */
export const uploadFile = async (file, path) => {
  if (!file || !path) {
    throw new Error("File and path are required for upload.");
  }
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const fullPath = `${path}/${fileName}`;
    const storageRef = ref(storage, fullPath);

    console.log(`Uploading single file ${file.name} to ${fullPath}`);
    const snapshot = await uploadBytes(storageRef, file); // Pass the file object
    console.log(`File ${file.name} uploaded successfully.`);

    const downloadURL = await getDownloadURL(storageRef);
    console.log(`Got download URL for ${file.name}: ${downloadURL}`);

    return {
      url: downloadURL,
      path: fullPath, // Return the full path used
      name: file.name,
      type: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error(`Error uploading file ${file.name} to ${path}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
};

/**
 * Deletes a file from Firebase Storage using its storage path.
 * @param {string} path - The full path to the file in storage (e.g., 'images/profile/uuid.jpg').
 * @returns {Promise<boolean>} True if deletion is successful.
 * @throws {Error} If deletion fails.
 */
export const deleteFile = async (path) => {
   if (!path) {
    console.warn("Attempted to delete file with empty path.");
    return false; // Or throw an error if path is mandatory
  }
  try {
    const storageRef = ref(storage, path);
    console.log(`Attempting to delete file at path: ${path}`);
    await deleteObject(storageRef);
    console.log(`Successfully deleted file at path: ${path}`);
    return true;
  } catch (error) {
     // Handle specific errors like 'object-not-found' gracefully if needed
    if (error.code === 'storage/object-not-found') {
        console.warn(`File not found at path ${path}, skipping deletion.`);
        return true; // Consider deletion successful if file doesn't exist
    } else {
        console.error(`Error deleting file at path ${path}:`, error);
        throw error; // Re-throw other errors
    }
  }
};

/**
 * Deletes a file from Firebase Storage using its download URL.
 * Extracts the storage path from the URL.
 * @param {string} url - The full download URL of the file.
 * @returns {Promise<boolean>} True if deletion is successful.
 * @throws {Error} If URL is invalid or deletion fails.
 */
export const deleteFileByUrl = async (url) => {
  if (!url || typeof url !== 'string') {
    console.warn("Attempted to delete file with invalid URL:", url);
    return false; // Or throw
  }
  try {
    // Create a reference from the download URL
    const storageRef = ref(storage, url);
    console.log(`Attempting to delete file via URL: ${url}`);
    await deleteObject(storageRef);
    console.log(`Successfully deleted file via URL: ${url}`);
    return true;
  } catch (error) {
     if (error.code === 'storage/object-not-found') {
        console.warn(`File not found for URL ${url}, skipping deletion.`);
        return true;
    } else {
        console.error(`Error deleting file via URL ${url}:`, error);
        throw error;
    }
  }
};


/**
 * Uploads multiple files concurrently to Firebase Storage.
 * @param {File[]} files - An array of File objects to upload.
 * @param {string} path - The base destination path in storage (e.g., 'gigs/userId/gigId').
 * @returns {Promise<Array<{url: string, path: string, name: string, type: string, size: number}>>} Array of objects for each uploaded file.
 * @throws {Error} If any upload fails (using Promise.all).
 */
export const uploadMultipleFiles = async (files, path) => {
  if (!Array.isArray(files) || files.length === 0) {
    return []; // Return empty array if no files provided
  }
   if (!path) {
    throw new Error("Base path is required for uploading multiple files.");
  }

  console.log(`Starting upload of ${files.length} files to base path: ${path}`);

  const uploadPromises = files.map(async (file) => {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const fullPath = `${path}/${fileName}`;
      const storageRef = ref(storage, fullPath);

      console.log(` -> Uploading ${file.name} (${(file.size / 1024).toFixed(1)} KB) to ${fullPath}`);
      // **FIX: Pass the 'file' object as the second argument to uploadBytes**
      const snapshot = await uploadBytes(storageRef, file);
      console.log(` -> Upload complete for ${file.name}`);

      const downloadURL = await getDownloadURL(storageRef);
      console.log(` -> Got URL for ${file.name}`);

      // Return the structured data for this file
      return {
        url: downloadURL,
        path: fullPath, // Use the full path
        name: file.name,
        type: file.type,
        size: file.size,
      };
    } catch (error) {
      console.error(` -> Failed to upload ${file.name}:`, error);
      // Throw the error to make Promise.all fail if any upload fails
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  });

  try {
    // Wait for all individual upload promises to complete
    const fileDataArray = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded all ${fileDataArray.length} files.`);
    return fileDataArray; // Return the array of results
  } catch (error) {
    // This catch block will execute if any promise in uploadPromises rejects
    console.error("Error during multiple file upload process:", error);
    // Re-throw the error that caused Promise.all to fail
    throw error;
  }
};
