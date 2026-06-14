<script>
import API from "@/services/api";

export default {
  data() {
    return { 
      products: [],
      loading: false
     };
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

      return `http://localhost:5000${img}`;
    },

    isComingSoon(p) {
      return (
        p.status === "coming_soon" ||
        p.visibleIn?.activity === "coming_soon"
      );
    }
  },

  computed: {
    filteredProducts() {
      const category = this.$route.params.category;

      let result = [...this.products];
      result = result.filter(p => p.status !== "draft");
      if (category && category !== "all") {
        result = result.filter(p => {
          const visibleCategories = p.visibleIn?.category || [];

          return (
            visibleCategories.includes(category) ||
            p.category === category
          );
        });
      }

      return result;
    },

    pageTitle() {
      const map = {
        blind_boxes: "Blind Box",
        plush_toys: "Plush Toys",
        accessories: "Accessories"
      };

      const category = this.$route.params.category;

      if (!category || category === "all") {
        return "All Products";
      }

      return map[category] || category;
    }
  }
};
</script>

<template>
  <div class="container">

    <h2 class="ip-title">{{ pageTitle }}</h2>

    <div v-if="loading" class="loading-wrapper">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else class="product-grid">

      <div class="card" v-for="p in filteredProducts" :key="p._id">

        <div class="img-box">
          <img :src="getImg((p.images && p.images[0]) || p.image)" />

          <span v-if="isComingSoon(p)" class="badge coming">
            Coming Soon
          </span>

          <span v-else-if="p.status === 'new'" class="badge new">
            New
          </span>

          <span
            v-else-if="(p.variants?.[0]?.stock ?? 0) <= 0"
            class="badge out"
          >
            Out of Stock
          </span>
        </div>

        <div class="card-content">

          <h4 class="title">{{ p.title }}</h4>

          <p class="price">
            RM {{ p.price || (p.variants?.[0]?.price || 0) }}
          </p>


          <router-link
            :to="'/product/' + p._id"
            class="view-btn"
          >
            View Details
          </router-link>

        </div>

      </div>

    </div>

  </div>
</template>