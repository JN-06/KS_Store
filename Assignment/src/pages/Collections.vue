<script>
import API from "@/services/api";
import { ipInfo } from "@/data/ipData";

export default {
  data() {
    return {
      products: [],
      sortBy: "",
loading: false,

    posters: {
      all: "/Poster.png",
      molly: "/ip/Molly/Poster.jpg",
      twinkle: "/ip/Twinkle/Poster.jpeg",
      labubu: "/ip/TheMonster/Poster.jpg",
      dimoo: "/ip/Dimoo/Poster.jpg",
      hacipupu: "/ip/Hacipupu/Poster.jpg",
      hirono: "/ip/Hirono/Poster.jpg",
      spongebob: "/ip/SpongeBob/Poster.jpg",
      sweetbean: "/ip/SweetBean/Poster.jpg",
      crybaby: "/ip/Crybaby/Poster.jpg",
      skullpanda: "/ip/Skullpanda/Poster.jpg"
    }
  };
},

  async mounted() {
    try {
    this.loading = true;

    const res = await API.get("/products");
    this.products = res.data || [];

  } catch (err) {
    console.error(err);
    this.products = [];

  } finally {
    this.loading = false;
  }
},

  methods: {
    getImg(img) {
      if (!img) return "";

      if (img.startsWith("http")) return img;

      if (!img.startsWith("/")) {
        img = "/" + img;
      }

      return `https://ks-store.onrender.com${img}`;
    }
  },

  computed: {
    filteredProducts() {
      const ip = this.$route.params.ip;

      let result = [...this.products];

      result = result.filter(p => {
        return (
          p.status !== "draft" &&
          p.visibleIn &&
          Array.isArray(p.visibleIn.ip)
        );
      });

      if (ip !== "all") {
        result = result.filter(p =>
          p.visibleIn.ip.includes(ip)
        );
      }

      switch (this.sortBy) {
        case "name":
          result.sort((a, b) =>
            a.title.localeCompare(b.title)
          );
          break;

        case "date":
          result.sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          );
          break;

        case "price-low":
          result.sort(
            (a, b) =>
              (a.price || a.variants?.[0]?.price || 0) -
              (b.price || b.variants?.[0]?.price || 0)
          );
          break;

        case "price-high":
          result.sort(
            (a, b) =>
              (b.price || b.variants?.[0]?.price || 0) -
              (a.price || a.variants?.[0]?.price || 0)
          );
          break;
      }

      return result;
    },
    currentPoster() {
      const ip = this.$route.params.ip;
      return this.posters[ip] || this.posters.all;
    },
    posterTitle() {
      const ip = this.$route.params.ip;

      if (ip === "all") return "ALL PRODUCTS";

      const data = ipInfo[ip];

      return data?.name ? `${data.name} Series` : "All Products";
    },
    otherProducts() {
      const current = this.$route.params.ip;
      const grouped = {};

      this.products.forEach(p => {
        const ips = p.visibleIn?.ip || [];

        const isComingSoon =
          p.status === "coming_soon" ||
          p.visibleIn?.activity === "coming_soon";

        const isOutOfStock =
          (p.variants?.[0]?.stock ?? 0) <= 0;

        if (isComingSoon || isOutOfStock) return;

        ips.forEach(ip => {
          if (ip !== current) {
            if (!grouped[ip]) grouped[ip] = [];
            grouped[ip].push(p);
          }
        });
      });

      return Object.values(grouped)
        .flatMap(products =>
          [...products]
            .sort(() => Math.random() - 0.5)
            .slice(0, 2)
        );
    }
  }
};
</script>

<template>
  <div class="container">
    <div class="ip-poster hero-animate">
      <img :src="currentPoster" />

      <div class="ip-overlay">
        <div class="overlay-content">
          <h1>{{ posterTitle }}</h1>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <select v-model="sortBy">
        <option value="">Sort By</option>
        <option value="name">Name (A-Z)</option>
        <option value="date">Newest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div class="product-grid">

      <div
        class="card"
        v-for="p in filteredProducts"
        :key="p._id"
      >

        <div class="img-box">

          <img :src="getImg((p.images && p.images[0]) || p.image)" />
          <span
            v-if="p.status === 'coming_soon' || p.visibleIn?.activity === 'coming_soon'"
            class="badge coming"
          >
            Coming Soon
          </span>

          <span
            v-if="(p.variants?.[0]?.stock ?? 0) <= 0 && p.status !== 'coming_soon'"
            class="badge out"
          >
            Out of Stock
          </span>

          <span
            v-if="p.status === 'new' || p.visibleIn?.activity === 'new_arrivals'"
            class="badge new"
          >
            New
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

    <div class="other-ip" v-if="$route.params.ip !== 'all'">
      <h3>Explore Other IP Collections</h3>

      <div class="product-grid">
        <div
          class="card"
          v-for="p in otherProducts"
          :key="p._id"
        >
          <div class="img-box">
            <img :src="getImg((p.images && p.images[0]) || p.image)" />
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
  </div>
</template>

<style>

.ip-overlay h1 {
    font-size: 2rem;
    letter-spacing: 2px;
    text-align: center;
    padding: 0 20px;
  }
  
.ip-poster {
  width: auto;
  height:600px;
  margin-bottom: 30px;
  background: transparent;
  overflow: hidden;
  position: relative;
}

.ip-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 300px;
  text-align: center;
  color: #666;
  font-weight: 600;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top: 4px solid #ff6b81;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hero-animate {
  position: relative;
  height: 420px;
  overflow: hidden;
}

.hero-animate img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: heroZoom 8s ease-in-out infinite alternate;
}

.ip-overlay {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.35),
    rgba(0,0,0,0.75)
  );
  animation: overlayFade 1.2s ease;
}

.ip-overlay h1 {
  color: white;
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 3px;

  text-transform: uppercase;

  animation: fadeUp 1.2s ease;
  text-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

@keyframes heroZoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes overlayFade {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(2px);
  }
}

.other-ip {
  margin-top: 70px;
  padding-top: 40px;
  border-top: 1px solid #eee;
}

.other-ip h3 {
  text-align: center;
  font-size: 26px;
  margin-bottom: 30px;
}

.filter-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 20px;
  padding: 10px;

  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);

  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

  width: fit-content;
  margin-left: auto;
}

.filter-bar select {

  padding: 8px 34px 8px 12px;
  border-radius: 10px;

  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;

  font-size: 13px;
  font-weight: 500;
  color: #222;

  cursor: pointer;
  outline: none;

  transition: all 0.25s ease;
}

.filter-bar select:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 107, 129, 0.4);
  box-shadow: 0 10px 22px rgba(255, 107, 129, 0.12);
}
.filter-bar select:focus {
  border-color: #ff6b81;
  box-shadow: 0 0 0 3px rgba(255, 107, 129, 0.15);
}

@media (max-width: 900px) {
  .ip-overlay h1 {
    font-size: 2rem;
    letter-spacing: 2px;
    text-align: center;
    padding: 0 20px;
  }
}
</style>