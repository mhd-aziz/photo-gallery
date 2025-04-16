import { ref, onMounted, watch } from "vue";
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { isPlatform } from "@ionic/vue";
import { Capacitor } from "@capacitor/core";

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

export const usePhotoGallery = () => {
  const PHOTO_STORAGE = "photos";

  const photos = ref<UserPhoto[]>([]);

  const convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  const savePicture = async (
    photo: Photo,
    fileName: string
  ): Promise<UserPhoto> => {
    let base64Data: string | Blob;
    // "hybrid" will detect mobile - iOS or Android
    if (isPlatform("hybrid")) {
      const file = await Filesystem.readFile({
        path: photo.path!,
      });
      base64Data = file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      base64Data = (await convertBlobToBase64(blob)) as string;
    }
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    if (isPlatform("hybrid")) {
      // Display the new image by rewriting the 'file://' path to HTTP
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
      };
    }
  };

  // Cache photos to Preferences
  const cachePhotos = () => {
    Preferences.set({
      key: PHOTO_STORAGE,
      value: JSON.stringify(photos.value),
    });
  };

  // Watch for changes to the photos array and cache them
  watch(photos, cachePhotos);

  // Load saved photos from Preferences and the Filesystem
  const loadSaved = async () => {
    const photoList = await Preferences.get({ key: PHOTO_STORAGE });
    const photosInPreferences = photoList.value
      ? JSON.parse(photoList.value)
      : [];

    // If running on the web...
    if (!isPlatform("hybrid")) {
      for (const photo of photosInPreferences) {
        const file = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });
        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      }
    }

    photos.value = photosInPreferences;
  };

  // Delete a photo from the gallery
  const deletePhoto = async (photo: UserPhoto, index?: number) => {
    console.log("Attempting to delete photo with filepath:", photo.filepath);

    try {
      // Jika index diberikan dan filepath tidak valid, gunakan index
      if (
        index !== undefined &&
        (!photo.filepath || photo.filepath === "undefined")
      ) {
        console.log("Using index to delete photo:", index);
        photos.value = photos.value.filter((_, i) => i !== index);
        return;
      }

      // Remove this photo from the Photos reference data array
      photos.value = photos.value.filter((p) => p.filepath !== photo.filepath);

      if (isPlatform("hybrid")) {
        // For mobile - check if filepath exists and has expected format
        if (photo.filepath && photo.filepath.startsWith("file://")) {
          console.log("Deleting file on mobile:", photo.filepath);
          await Filesystem.deleteFile({
            path: photo.filepath,
          });
        } else {
          console.log("Invalid filepath format on mobile:", photo.filepath);
          // Jika filepath tidak dalam format yang diharapkan, cukup hapus dari array tanpa mencoba menghapus file
        }
      } else {
        // For web
        const filename = photo.filepath.substr(
          photo.filepath.lastIndexOf("/") + 1
        );
        console.log("Deleting file on web:", filename);
        await Filesystem.deleteFile({
          path: filename,
          directory: Directory.Data,
        });
      }
    } catch (e) {
      console.error("Error deleting file:", e);
      // Jika error, tetap hapus dari array photos
      photos.value = photo.filepath
        ? photos.value.filter((p) => p.filepath !== photo.filepath)
        : index !== undefined
        ? photos.value.filter((_, i) => i !== index)
        : photos.value;
    }
  };

  // Load saved photos when the component mounts
  onMounted(loadSaved);

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = Date.now() + ".jpeg";
    const savedFileImage = await savePicture(photo, fileName);

    photos.value = [savedFileImage, ...photos.value];
  };

  return {
    photos,
    takePhoto,
    deletePhoto,
  };
};
