<template>
<v-container fill-height fluid grid-list-xl>
  <v-layout justify-center wrap>
    <v-flex xs12 md12>
      <material-card color="green" title="ایجاد کد تخفیف" text="تمامی فیلد ها ضروریند">
        <v-form>
          <v-container py-0>
            <v-layout wrap>
              <v-flex xs12 md6 text-xs-right>
                <v-text-field label="درصد تخفیف *" type="number" v-model="discount.off" />
              </v-flex>
              <v-flex xs12 md6 text-xs-right>
                <label class="body-1">دسته بندی *</label>
                <multiselect :multiple="false" v-model='discount.selected_category' :options="categories" placeholder="جستجو و انتخاب کنید" label="name" track-by="id" @search-change="asyncFind1" :disabled="disableCategory"><span slot="noResult">نتیجه
                    ای یافت
                    نشد!</span>
                </multiselect>
              </v-flex>
              <v-flex xs12 md6 text-xs-right>
                <label class="body-1">محصول *</label>
                <multiselect :multiple="false" v-model='discount.selected_product' :options="products" placeholder="جستجو و انتخاب کنید" label="title" track-by="id" @select="fetchProductValues" @search-change="asyncFind2" :disabled="disableProduct">
                  <span slot="noResult">نتیجه ای
                    یافت
                    نشد!</span>
                </multiselect>
              </v-flex>
              <v-flex xs12 md6 text-xs-right v-if="discount.selected_product && options">
                <label class="body-1">{{options[0].attribute.name}} *</label>
                <multiselect :multiple="false" v-model='discount.selected_product_item' :options="options" placeholder="جستجو و انتخاب کنید" label="value" track-by="id" :disabled="disableAttribute"><span slot="noResult">نتیجه ای یافت نشد!</span>
                </multiselect>
              </v-flex>
              <v-flex xs12 text-xs-right>
                <label>تاریخ شروع :</label>
                <date-picker format="jYYYY-jMM-jDD" v-model="discount.starting_date"></date-picker>
                <v-spacer></v-spacer>
              </v-flex>
              <v-flex xs12 md6 text-xs-right>
                <label>تاریخ انقضا:</label>
                <date-picker format="jYYYY-jMM-jDD" v-model="discount.expiration_date"></date-picker>
                <v-spacer></v-spacer>
              </v-flex>
              <v-flex xs12 text-xs-left>
                <v-btn :loading="loading" class="mx-0 font-weight-light" color="success" :disabled="!isDiscountValid" @click="CreateDiscount()">
                  ایجاد تخفیف
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
import VuePersianDatetimePicker from 'vue-persian-datetime-picker'
import Multiselect from 'vue-multiselect'
import lodash from 'lodash'
export default {
  data() {
    return {
      loader: null,
      loading: false,
      color: null,
      top: false,
      bottom: true,
      left: false,
      right: false,
      snackbar_success: false,
      snackbar_error: false,
      expire_date_switch: false,
      category_search: '',
      product_search: '',
      categories: [],
      options: [],
      products: [],
      expires_date: null,
      discount: {
        off: '',
        starting_date: null,
        expiration_date: null,
        selected_category: null,
        selected_product: null,
        selected_product_item: null
      }
    }
  },
  methods: {
    asyncFind1: lodash.debounce(function(search) {
      this.category_search = search
      this.getCategories()
    }, 500),
    asyncFind2: lodash.debounce(function(search) {
      this.product_search = search
      this.getProductSearch()
    }, 500),
    snack_error() {
      this.color = 'error'
      this.snackbar_error = true
    },
    snack_success() {
      this.color = 'success'
      this.snackbar_success = true
    },
    CreateDiscount() {
      this.loader = 'loading'
      const l = this.loader
      this[l] = !this[l]
      let data = {
        'off': this.discount.off,
        'expiration_date': this.discount.expiration_date,
        'starting_date': this.discount.starting_date
      }
      if (this.discount.selected_product) {
        data.product_id = this.discount.selected_product.id
      }
      if (this.discount.selected_category) {
        data.category_id = this.discount.selected_category.id
      }
      if (this.discount.selected_product_item) {
        data.product_item_id = this.discount.selected_product_item.id
      }
      this.$store.dispatch('createDiscountRequest', data)
        .then(response => {
          this[l] = false
          this.loader = null
          this.snack_success()
          setTimeout(() => {
            this.$router.push({
              name: 'DiscountList'
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
    getCategories() {
      this.$store.dispatch('getAllCategoriesRequest', {
          search: this.category_search
        })
        .then(response => {
          this.categories = response.data.data
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    fetchProductValues() {
      this.$store.dispatch('fetchProductValuesRequest', {
          id: this.discount.selected_product.id
        })
        .then(response => {
          console.log(response.data.data);
          this.options = response.data.data.items
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    getProductsList() {
      this.$store.dispatch('fetchListRequest', {
          type: 'products',
        })
        .then(response => {
          this.products = response.data.data
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
    getProductSearch() {
      this.$store.dispatch('getProductSearchRequest', {
          search: this.product_search,
        })
        .then(response => {
          console.log(response.data.data.products);
          this.products = response.data.data.products
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    },
  },
  components: {
    Multiselect,
    datePicker: VuePersianDatetimePicker
  },
  computed: {
    isDiscountValid() {
      return (Boolean(this.discount.off && this.discount.expiration_date && this.discount.starting_date && (this.discount.selected_product || this.discount.selected_category)))
    },
    disableCategory() {
      return Boolean(this.discount.selected_product)
    },
    disableProduct() {
      return Boolean(this.discount.selected_category)
    },
  },
  mounted() {
    this.getCategories()
    this.getProductsList()
  }
}
</script>
<style lang="scss" scoped>
.v-input--selection-controls__input {
    margin-right: 0 !important;
    margin-left: 8px !important;
}
</style>
