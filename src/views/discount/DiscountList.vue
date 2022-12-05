<template>
<v-container fill-height fluid grid-list-xl style="direction: rtl">
  <v-layout justify-center wrap>
    <v-flex md12>
      <material-card color="green" title="لیست کد تخفیف ها" :text="`نمایش موارد ${fromItems} تا ${toItems} از ${totalItems} مورد`" hide-default-footer>
        <v-data-table class="elevation-1" :headers="headers" :items="items" :items-per-page-options="[15]" sort-by="id" hide-default-footer loading-text="در حال لود شدن ... لطفا ضبر کنید">
          <template v-slot:item.operation="{ item }">
            <router-link :to="{name: 'EditDiscount', params: {discount: item}}">
              <v-btn class="my-3  mx-2" color="success">
                ویرایش
              </v-btn>
            </router-link>
          </template>
        </v-data-table>
      </material-card>
    </v-flex>
    <v-flex xs12>
      <div class="text-xs-center pt-2">
        <v-pagination v-model="pagination.page" v-if="items.length" :length="pagesNumber"></v-pagination>
      </div>
    </v-flex>
  </v-layout>
</v-container>
</template>
<script>
import VPagination from 'vuetify/es5/components/VPagination'

export default {
  data: () => ({
    loader: null,
    loading: false,
    color: null,
    top: false,
    bottom: true,
    left: false,
    right: false,
    snackbar_success: false,
    snackbar_error: false,
    totalItems: 0,
    items: [],
    fromItems: 0,
    toItems: 0,
    pagination: {
      page: 1
    },
    headers: [{
        align: 'center',
        sortable: false,
        text: 'ID',
        value: 'id'
      },

      {
        align: 'center',
        sortable: false,
        text: 'درصد تخفیف',
        value: 'off'
      },
      {
        align: 'center',
        sortable: false,
        text: 'تاریخ شروع',
        value: 'starting_date'
      },
      {
        align: 'center',
        sortable: false,
        text: 'تاریخ انقضا',
        value: 'expiration_date'
      },
      {
        align: 'center',
        sortable: false,
        text: 'عملیات',
        value: 'operation'
      },
    ],
  }),
  watch: {
    pagination: {
      handler() {
        this.fetchDiscountsList(this.pagination)
      },
      deep: true
    }
  },
  methods: {
    snack_error() {
      this.color = 'error'
      this.snackbar_error = true
    },
    snack_success() {
      this.color = 'success'
      this.snackbar_success = true
    },
    fetchDiscountsList() {
      this.$store.dispatch('getDiscountListRequest', {
          page: this.pagination.page
        })
        .then(response => {
          this.items = response.data.data
          this.totalItems = response.data.meta.total
          if (response.data.meta.from) {
            this.fromItems = response.data.meta.from
          }
          if (response.data.meta.to) {
            this.toItems = response.data.meta.to
          }
        })
        .catch(error => {
          this.$store.dispatch('handleError', error)
          this.snack_error()
        })
    }
  },
  computed: {
    pagesNumber() {
      return Math.ceil(this.totalItems / 15)
    }
  },
  components: {
    VPagination
  },
  mounted() {
    this.fetchDiscountsList()
  },
}
</script>

<style lang="scss" scoped>
.itemCreate {
    position: absolute;
    top: 0;
    left: 45px;
    i {
        margin-left: 10px;
    }
}
</style>
