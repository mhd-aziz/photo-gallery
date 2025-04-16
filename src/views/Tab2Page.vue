<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="light">
        <ion-title class="ion-text-center title-container">
          <div class="title-text">Photo Gallery</div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" color="light">
      <div class="gallery-header">
        <h2>My Photos</h2>
        <p v-if="photos.length === 0">Take your first photo!</p>
        <p v-else>{{ photos.length }} photos</p>
      </div>

      <ion-grid>
        <ion-row>
          <ion-col size="6" :key="i" v-for="(photo, i) in photos">
            <div class="image-container" @click="showActionSheet(photo, i)">
              <img :src="photo.webviewPath" class="photo-image" />
              <div class="image-overlay">
                <ion-icon :icon="trash" class="delete-icon"></ion-icon>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div class="empty-state" v-if="photos.length === 0">
        <ion-icon :icon="camera" class="empty-icon"></ion-icon>
        <p>Tap the camera button to take a photo</p>
      </div>

      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button
          @click="takePhoto()"
          class="camera-button"
          color="primary"
        >
          <ion-icon :icon="camera"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { camera, trash, close, images } from "ionicons/icons";
import {
  actionSheetController,
  IonPage,
  IonHeader,
  IonFab,
  IonFabButton,
  IonIcon,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  toastController,
} from "@ionic/vue";
import ExploreContainer from "@/components/ExploreContainer.vue";
import { usePhotoGallery, UserPhoto } from "@/composables/usePhotoGallery";
const { photos, takePhoto, deletePhoto } = usePhotoGallery();

const showActionSheet = async (photo: UserPhoto, index: number) => {
  console.log("Action sheet triggered for photo index:", index);

  const actionSheet = await actionSheetController.create({
    header: "Photo Options",
    cssClass: "my-custom-action-sheet",
    buttons: [
      {
        text: "Delete Photo",
        role: "destructive",
        icon: trash,
        handler: async () => {
          console.log("Delete clicked for index:", index);
          deletePhoto(photo, index);

          const toast = await toastController.create({
            message: "Photo deleted successfully",
            duration: 2000,
            position: "bottom",
            color: "success",
            cssClass: "toast-custom",
          });
          await toast.present();
        },
      },
      {
        text: "Cancel",
        icon: close,
        role: "cancel",
        handler: () => {
          console.log("Cancel clicked");
        },
      },
    ],
  });

  await actionSheet.present();
};
</script>

<style scoped>
/* Styling for the title */
.title-container {
  padding: 10px 0;
}

.title-text {
  font-weight: 700;
  font-size: 1.3rem;
  background: linear-gradient(45deg, #3880ff, #5260ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* Gallery header styling */
.gallery-header {
  padding: 20px 16px 10px;
}

.gallery-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.gallery-header p {
  margin: 5px 0 0;
  color: #666;
  font-size: 0.9rem;
}

/* Image container styling */
.image-container {
  position: relative;
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 1/1; /* Ensure square container */
  background-color: #f2f2f2;
}

.image-container:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Overlay effect on hover/touch */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.image-container:active .image-overlay {
  opacity: 1;
}

.delete-icon {
  color: white;
  font-size: 24px;
}

/* Empty state styling */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  font-size: 1rem;
}

/* Camera button styling */
.camera-button {
  --box-shadow: 0 4px 16px rgba(56, 128, 255, 0.4);
  --background: linear-gradient(45deg, #3880ff, #5260ff);
  transition: transform 0.2s ease;
}

.camera-button:active {
  transform: scale(0.95);
}

/* Action sheet styling */
:global(.my-custom-action-sheet) {
  --background: white;
  --backdrop-opacity: 0.7;
  border-radius: 16px 16px 0 0;
}

:global(.my-custom-action-sheet .action-sheet-title) {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

:global(.my-custom-action-sheet .action-sheet-button) {
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
}

:global(.my-custom-action-sheet .action-sheet-destructive) {
  color: #ff4961;
}

:global(.toast-custom) {
  --border-radius: 24px;
  --box-shadow: 0 3px 12px rgba(0, 0, 0, 0.16);
  font-weight: 500;
}
</style>
