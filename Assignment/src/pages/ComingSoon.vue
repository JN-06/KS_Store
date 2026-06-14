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
    comingSoon() {
      return this.products.filter(p => {
        return (
          p.status !== "draft" &&
          (
            p.status === "coming_soon" ||
            p.visibleIn?.activity === "coming_soon"
          )
        );
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

    <h2 class="ip-title">COMING SOON</h2>

    <div v-if="loading" class="loading-wrapper">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else class="product-grid">
      <div class="card" v-for="p in comingSoon" :key="p._id">

        <div class="img-box">
          <img :src="getImg(p.images?.[0])" />

          <span class="badge coming">Coming Soon</span>
        </div>

        <div class="card-content">
          <h4 class="title">{{ p.title }}</h4>

          <p class="price">
            RM {{ p.variants?.[0]?.price || 0 }}
          </p>

          <router-link class="view-btn-disabled">
            Coming Soon
          </router-link>        
        </div>
      </div>
    </div>
  </div>
</template>