<script>
import API from "@/services/api";

export default {
  data() {
    return {
      products: [],
      loading: false
    };
  },

  computed: {
    newProducts() {
      return this.products.filter(p => {
        const isDraft = p.status === "draft";

        const isNew =
          p.status === "new" ||
          p.visibleIn?.activity === "new_arrivals";

        return !isDraft && isNew;
      });
    }
  },

  async mounted() {
    await this.fetchProducts();
  },

  methods: {
    async fetchProducts() {
      try {
        this.loading = true;

        const res = await API.get("/products");
        this.products = res.data || [];

      } catch (err) {
        console.error("Failed to load products", err);
        this.products = [];

      } finally {
        this.loading = false;
      }
    },
    getImg(img) {
      if (!img) return "";

      if (typeof img !== "string") return "";

      if (img.startsWith("http")) return img;

      if (!img.startsWith("/")) {
        img = "/" + img;
      }

      return `https://ks-store.onrender.com${img}`;
    }
  }
};
</script>

<template>
  <div class="container">

    <h2 class="ip-title">NEW ARRIVALS</h2>

    <div v-if="loading" class="loading-wrapper">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else class="product-grid">
      <div class="card" v-for="p in newProducts" :key="p._id">

        <div class="img-box">
          <img :src="getImg(p.images?.[0])" />

          <span class="badge new">New</span>
        </div>

        <div class="card-content">
          <h4 class="title">{{ p.title }}</h4>

          <p class="price">
            RM {{ p.variants?.[0]?.price || 0 }}
          </p>

          <router-link :to="'/product/' + p._id" class="view-btn">
            View Details
          </router-link>
        </div>

      </div>

    </div>
  </div>
</template>