<template>
<v-container fill-height fluid grid-list-xl>
  <v-layout justify-center wrap>
    <v-flex xs12 md12>
      <material-card color="green" title="ویرایش محصول">
        <v-form>
          <v-container py-0>
            <v-layout wrap>
              <v-flex xs12 md6 text-xs-right>
                <v-text-field label="* عنوان محصول " v-model="product.title" />
              </v-flex>
              <v-flex xs12 md6 text-xs-right>
                <label class="body-1">برند *</label>
                <multiselect :multiple="false" v-model='product.selected_brand' :options="brands" placeholder="جستجو و انتخاب کنید" label="title" track-by="id"><span slot="noResult">نتیجه ای یافت نشد!</span></multiselect>
              </v-flex>
              <v-flex xs12 text-xs-right>
                <h3 class="mt-4">مشخصه ها</h3>
              </v-flex>
              <v-flex xs6 text-xs-right v-for="(feature,k) in product.features" :key="k" @keyup.enter="add(k)" class="mb-4">
                <v-text-field label="مشخصه *" v-model="feature.feature" />
                <v-icon @click="remove(k)" color="red" v-show="k || ( !k && product.features.length > 1)">mdi-close-circle</v-icon>
                <v-icon @click="add(k)" color="success" v-show="k == product.features.length-1">mdi-plus</v-icon>
              </v-flex>
              <v-flex xs12></v-flex>
              <v-flex xs12 md6 text-xs-right>
                <label class="body-1">دسته بندی *</label>
                <multiselect :multiple="false" v-model='product.selected_category' @select="ChangeCategory" :options="categories" placeholder="جستجو و انتخاب کنید" label="name" track-by="id"><span slot="noResult">نتیجه ای یافت نشد!</span>
                </multiselect>
              </v-flex>
              <v-flex xs12 md6 text-xs-right>
                <div v-for="attribute in product.selected_attributes">
                  <h3>{{attribute.name}}</h3>
                  <v-text-field label="مقدار *" v-model="attribute.value" />
                </div>
              </v-flex>
              <v-flex xs12 text-xs-right>
                <label class="body-1">* آپشن</label>
                <multiselect :multiple="false" v-model="product.selected_option" :options="product.selected_attributes" @select="resetOptions" placeholder="جستجو و انتخاب کنید" label="name" track-by="id"><span slot="noResult">نتیجه ای یافت
                    نشد!</span></multiselect>
              </v-flex>
              <v-layout xs12 text-xs-right class="mb-4" v-if="product.selected_option" v-for="(option,k) in product.option_values" :key="k" @keyup.enter="addOption(k)">
                <v-flex xs12 text-xs-right>
                  <h3>تعداد</h3>
                  <v-text-field label="تعداد * " v-model="option.quantity" />
                </v-flex>
                <v-flex xs12 text-xs-right>
                  <h3>مقدار</h3>
                  <v-text-field label="مقدار  *" v-model="option.value" />
                </v-flex>
                <v-flex xs12 text-xs-right>
                  <h3>قیمت</h3>
                  <v-text-field label="قیمت  *" v-model="option.price" />
                </v-flex>
                <v-icon @click="removeOption(k)" color="red" v-show="k || ( !k && product.option_values.length > 1)">mdi-close-circle</v-icon>
                <v-icon @click="addOption(k)" color="success" v-show="k == product.option_values.length-1">mdi-plus</v-icon>
              </v-layout>
              <v-flex xs12 md6 text-xs-right>
                <uploader v-model="fileList" title="اپلود عکس  های محصول"></uploader>
              </v-flex>
              <v-flex class="text-center" xs6 v-for='image in product_images'>
                <img class="image mx-auto" :src="image" width="100%" alt="">
                <v-btn :loading="loading" class="mx-0 font-weight-light mx-auto text-center mt-4" color="error" @click="DeleteProductPicture(image)">
                  حذف
                </v-btn>
              </v-flex>
              <v-flex xs12 md12 text-xs-right>
                <v-textarea label="* توضیحات" v-model="product.description" />
              </v-flex>
              <v-flex xs12 text-xs-left>
                <v-btn :loading="loading" class="mx-0 font-weight-light" color="success" :disabled="!isProductValid" @click="EditProduct()">
                  ویرایش محصول
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </material-card>
    </v-flex>
  </v-layout>
  <v-snackbar :color="color" :bottom="bottom" :top="top" :left="left" :right="right" v-model="snackbar_success" dark>
    <v-icon size="16" @click="snackbar = false" color="white">
      mdi-close-circle
    </v-icon>
    <div>عملیات درخواستی شما موفقیت آمیز بود.</div>
  </v-snackbar>
  <v-snackbar :color="color" :bottom="bottom" :top="top" :left="left" :right="right" v-model="snackbar_error" dark>
    <v-icon size="16" @click="snackbar = false" color="white">
      mdi-close-circle
    </v-icon>
    <div>عملیات درخواستی شما موفقیت آمیز نبود.</div>
  </v-snackbar>
</v-container>
</template>
<script >
import PictureInput from 'vue-picture-input'
import Multiselect from 'vue-multiselect'
import Uploader from "vux-uploader-component"
export default {
  data() {
    return {
      loader: null,
      fileList: [],
      image: null,
      loading: false,
      color: null,
      top: false,
      bottom: true,
      left: false,
      right: false,
      snackbar_success: false,
      snackbar_error: false,
      imageChange: false,
      product_images: [],
      attributes: [],
      booths: [],
      categories: [],
      brands: [],
      product: {
        title: '',
        price: '',
        quantity: '',
        description: '',
        selected_category: null,
        selected_brand: null,
        //an element must be in array deafualt
        features: [{
          feature: ''
        }],
        selected_booth: null,
        selected_attributes: null,
        selected_option: null,
        option_values: []
      },
    }
  },
  components: {
    Uploader,
    PictureInput,
    Multiselect,
  },
  methods: {
    resetOptions() {
      this.product.option_values = [{
        value: '',
        quantity: '',
        price: ''
      }]
    },
    addOption(index) {
      this.product.option_values.push({
        value: '',
        quantity: '',
        price: ''
      });
    },
    removeOption(index) {
      this.product.option_values.splice(index, 1);
    },
    add(index) {
      this.product.features.push({
        feature: ''
      });
    },
    remove(index) {
      this.product.features.splice(index, 1);
    },
    removeAction() {
      this.imageChange = false
    },
    snack_error() {
      this.color = 'error'
      this.snackbar_error = true
    },
    snack_success() {
      this.color = 'success'
      this.snackbar_success = true
    },
    onChange(image) {
      if (image) {
        this.imageChange = true
      } else {
        this.imageChange = false
      }
    },
    ChangeCategory(category) {
      this.getCategoryAttributesList(category.id)
    },
    AppendImages(formData) {
      let i = 0;
      this.fileList.forEach(item => {
        formData.append(`gallery[${i}]`, item.blob)
        i++;
      })
    },
    AppendAttributes(data) {
      let i = 0;
      this.product.selected_attributes.forEach(item => {
        if (item.value) {
          formData.append(`attributes[${i}][id]`, item.id)
          formData.append(`attributes[${i}][value]`, item.value)
          i++;
        }
      })
    },
    AppendAttributesToData(data) {
      data.attributes = []
      this.product.selected_attributes.forEach(item => {
        if (item.value) {
          data.attributes.push(item)
        }
      })
    },
    AppendFeatures(data) {
      let i = 0;
      this.product.features.forEach(item => {
        data.features[i] = item.feature
        i++;
      })
    },
    AppendOptions(data) {
      this.product.option_values.forEach(item => {
        data.items[0].values.push({
          value: item.value
        }, {
          price: item.price
        }, {
          quantity: item.quantity
        })
      })
    },
    EditProduct() {
      console.log(this.product);
      this.loader = 'loading'
      const l = this.loader
      this[l] = !this[l]
      let formData = new FormData();
      // formData.append('title', this.product.title)
      formData.append('id', this.$route.params.id)
      // formData.append('price', this.product.price)
      // formData.append('purchased_price', this.product.purchased_price)
      // formData.append('quantity', this.product.quantity)
      // formData.append('description', this.product.description)
      // formData.append('category_id', this.product.selected_category.id)
      let data = {
        id: this.$route.params.id,
        title: this.product.title,
        price: this.product.price,
        description: this.product.description,
        category_id: this.product.selected_category.id,
        brand_id: this.product.selected_brand.id,
      }
      data.items = [{
        values: []
      }]
      this.AppendOptions(data)
      this.AppendAttributesToData(data)
      data.features = []
      if (this.product.features) {
        this.AppendFeatures(data)
      }
      this.AppendImages(formData)
      this.$store.dispatch('editProductRequest', data)
        .then(response => {
          // console.log(this.fileList[0].blob);
          if (this.fileList[0]) {
            this.$store.dispatch('updateProductPicturesRequest', formData)
              .then(response => {})
              .catch(error => {
                this[l] = false
                this.loader = null
                this.$store.dispatch('handleError', error)
                this.snack_error()
              })
          }
          this[l] = false
          this.loader = null
          this.snack_success()
          setTimeout(() => {
            this.$router.push({
              name: 'ProductList'
            })
          }, 500)
        })
        .catch(error => {
          this[l] = false
          this.loader = null
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
      // this.$store.dispatch('updateProductPicturesRequest', formData)
      //   .then(response => {})
      //   .catch(error => {
      //     this[l] = false
      //     this.loader = null
      //     this.$store.dispatch('handleError', error)
      //     this.snack_error()
      //   })
    },
    UpdateProductPictures() {
      this.loader = 'loading'
      const l = this.loader
      this[l] = !this[l]
      let formData = new FormData();
      formData.append('id', this.$route.params.id)
      if (this.imageChange) {
        formData.append('logo', this.$refs.pictureInput.file)
      }
      if (this.product_images) {
        this.AppendImages(formData)
      }
      this.$store.dispatch('updateProductPicturesRequest', formData)
        .then(response => {
          this[l] = false
          this.loader = null
          this.snack_success()
          setTimeout(() => {
            this.$router.push({
              name: 'ProductList'
            })
          }, 500)
        })
        .catch(error => {
          this[l] = false
          this.loader = null
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    DeleteProduct() {
      this.loader = 'loading'
      const l = this.loader

      this[l] = !this[l]
      this.$store.dispatch('deleteProductRequest', this.$route.params.id)
        .then(response => {
          this[l] = false
          this.loader = null
          this.snack_success()
          setTimeout(() => {
            this.$router.push({
              name: 'ProductList'
            })
          }, 500)
        })
        .catch(error => {
          this[l] = false
          this.loader = null
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    DeleteProductPicture(image) {
      this.loader = 'loading'
      const l = this.loader
      this[l] = !this[l]
      let split_image = image.split("/")
      let data = {
        'id': this.$route.params.id,
        'picture': split_image[split_image.length - 1]
      }
      this.$store.dispatch('deleteProductPictureRequest', data)
        .then(response => {
          this[l] = false
          this.loader = null
          this.snack_success()
          setTimeout(() => {
            this.$router.push({
              name: 'ProductList'
            })
          }, 500)
        })
        .catch(error => {
          this[l] = false
          this.loader = null
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    setFeatures(features) {
      this.product.features = []
      features.forEach((item, i) => {
        if (i == 1) {
          this.product.features[0].feature = item
        } else {
          this.product.features.push({
            feature: item
          })
        }
      });
    },
    fetchProductValues() {
      this.$store.dispatch('fetchProductValuesRequest', {
          id: this.$route.params.id
        })
        .then(response => {
          this.product.title = response.data.data.title
          this.product.selected_category = response.data.data.category
          this.product.selected_brand = response.data.data.brand
          this.product.selected_attributes = response.data.data.attributes
          this.product.description = response.data.data.description
          // this.product.description = response.data.data.features
          if (response.data.data.gallery) {
            this.product_images = response.data.data.gallery
          }
          if (response.data.data.items) {
            this.product.selected_option = response.data.data.items[0].attribute
            this.product.option_values = response.data.data.items
          }
          console.log(response.data.data.features);
          this.setFeatures(response.data.data.features)
          // this.product_images = response.data.data.pictures
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    getAllAttributesList() {
      this.$store.dispatch('getAttributeListRequest')
        .then(response => {
          this.attributes = response.data.data
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    getAllCategories() {
      this.$store.dispatch('getAllCategoriesRequest')
        .then(response => {
          this.categories = response.data.data
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    getAllBrandsList() {
      this.$store.dispatch('getBrandListRequest')
        .then(response => {
          this.brands = response.data.data
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    getBoothsList() {
      this.$store.dispatch('fetchListRequest', {
          type: 'booths'
        })
        .then(response => {
          this.booths = response.data.data
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    getCategoryAttributesList(id) {
      this.$store.dispatch('getCategoryAttributesListRequest', {
          category_id: id
        })
        .then(response => {
          this.product.selected_attributes = response.data.data
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
  },
  computed: {
    isProductValid() {
      return Boolean(this.product.title && this.product.selected_brand)
    }
  },
  mounted() {
    this.fetchProductValues()
    // this.getAllAttributesList()
    this.getAllCategories()
    this.getAllBrandsList()
    // this.getBoothsList()
  }
}
</script>
<style >
.image {
  display: block;
  width: 20em !important;
  height: 20em !important;
}
</style>
<style src="vue-multiselect/dist/vue-multiselect.min.css">
</style>
