<template>
  <div>
    <input type="file" @change="uploadImage" />
    <button @click="submit">Upload</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const file = ref(null);

    const uploadImage = (event) => {
      file.value = event.target.files[0];
    };

    const submit = async () => {
      if (!file.value) return;

      const formData = new FormData();
      formData.append('file', file.value);

     
    };

    return {
      uploadImage,
      submit,
    };
  },
};
</script>