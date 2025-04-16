<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Photo Gallery</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button @click="takePhoto()">
          <ion-icon :icon="camera"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-grid>
        <ion-row>
          <ion-col size="6" :key="i" v-for="(photo, i) in photos">
            <div class="image-container">
              <ion-img
                :src="photo.webviewPath"
                @click="showActionSheet(photo, i)"
              ></ion-img>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { camera, trash, close } from "ionicons/icons";
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
} from "@ionic/vue";
import ExploreContainer from "@/components/ExploreContainer.vue";
import { usePhotoGallery, UserPhoto } from "@/composables/usePhotoGallery";
const { photos, takePhoto, deletePhoto } = usePhotoGallery();

const showActionSheet = async (photo: UserPhoto, index: number) => {
  console.log("Action sheet triggered for photo index:", index);

  const actionSheet = await actionSheetController.create({
    header: "Photos",
    cssClass: "my-custom-action-sheet",
    buttons: [
      {
        text: "Delete",
        role: "destructive",
        icon: trash,
        handler: () => {
          console.log("Delete clicked for index:", index);
          // Menggunakan index foto sebagai backup jika filepath bermasalah
          deletePhoto(photo, index);
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
.image-container {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Tambahan style untuk action sheet pada Android */
:global(.my-custom-action-sheet) {
  --background: white;
  --backdrop-opacity: 0.6;
}

:global(.my-custom-action-sheet .action-sheet-button) {
  padding: 1rem;
  font-size: 1rem;
}
</style>
