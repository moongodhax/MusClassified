<template>
  <div class="container-lg">
    <form @submit.prevent="addAdvertisement">
      <div class="row mb-4">
        <div class="col-6">
          <div class="form-floating">
            <input v-model="headline" type="text" class="form-control" id="inputAdAddHeadline" placeholder="Заголовок" required>
            <label for="inputAdAddHeadline">Заголовок</label>
          </div>
        </div>
        <div class="col-6">
          <div class="form-floating">
            <select v-model="category" class="form-select" id="inputAdAddCategory">
              <option value="1">Электрогитара</option>
            </select>
            <label for="inputAdAddCategory">Категория</label>
          </div>
        </div>
      </div>
      <div class="row mb-4">
        <div class="col-6">
          <div class="form-floating">
            <select v-model="manufacturer" class="form-select" id="inputAdAddManufacturer">
              <option value="1">Gibson</option>
            </select>
            <label for="inputAdAddManufacturer">Производитель</label>
          </div>
        </div>
        <div class="col-6">
          <div class="form-floating">
            <select v-model="model" class="form-select" id="inputAdAddModel">
              <option value="1">Les Paul Custom</option>
            </select>
            <label for="inputAdAddModel">Модель</label>
          </div>
        </div>
      </div>
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-body">
            <h6 class="mb-3">Фотографии товара</h6>
            <div class="row d-flex">
              <div 
                v-for="image in uploadedImages"
                class="col-3"
              >
                <div 
                  class="card card-image card-body card-buttons flex-row justify-content-center align-items-center"
                  :style="{ 'background-image': 'url(' + imageBaseUrl + image.path + ')' }"
                >
                </div>
              </div>
              <div class="col-3">
                <div 
                  @click="startUploadImage()" 
                  class="uploadImageButton card card-image card-body card-buttons flex-row justify-content-center align-items-center">
                  <i class="fa-solid fa-plus fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <input ref='uploadImageField' @change="onImageFieldChange($event)" type='file' accept=".gif,.jpg,.jpeg,.png" hidden/>
      </div>
      <div class="row mb-4">
        <div class="col-12">
          <div class="form-floating">
            <textarea v-model="description" class="form-control" placeholder="Описание товара" id="inputAdAddDescription"></textarea>
            <label for="inputAdAddDescription">Описание товара</label>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="form-floating">
            <input v-model="price" type="number" class="form-control" id="inputAdAddPrice" placeholder="Цена товара" required>
            <label for="inputAdAddPrice">Цена товара</label>
          </div>
        </div>
        <div class="col-6">
          <button type="submit" class="btn btn-primary btn-lg w-100 h-100">Поехали!</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import apiRequest from '@/helpers/apiRequest';
import router from '@/router';

export default {
  setup() {
    return { 
      imageBaseUrl: `${import.meta.env.VITE_API_URL}/upload/images/`,
    }
  },
  data() {
    return {
      headline: '',
      category: 0,
      manufacturer: 0,
      model: 0,
      uploadedImages: [],
      description: '',
      price: 0,
    }
  },
  methods: {
    startUploadImage() {
      this.$refs.uploadImageField.click();
    },
    onImageFieldChange(event) {
      if (event.target && event.target.files) {
        let image = event.target.files[0];

        var data = new FormData();
        data.append('image', image);

        apiRequest("/images/upload", {
          method: 'POST',
          body: data
        }).then(async (response) => {
          if (response.ok == true) {
            let data = await response.json();
            this.uploadedImages.push(data);
          }
        });
      }
    },
    addAdvertisement() {
      let images = this.uploadedImages.map(image => image.id);

      let data = {
        headline: this.headline,
        description: this.description,
        price: this.price,
        category: this.category,
        model: this.model,
        images,
      };

      console.log(data);

      apiRequest("/ads/add", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      .then(async (response) => {
        if (response.ok == true) {
          router.push({ name: 'main' });
        }
      });
    }
  }
}
</script>

<style scoped>
.card-image {
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
.card-image:before {
  content: '';
  padding-bottom: 100%;
}
#inputAdAddDescription {
  height: 300px;
  resize: none;
}
.uploadImageButton {
  cursor: pointer;
}
</style>