<script>
import API from "@/services/api";

export default {
  name: "AdminDashboard",

  data() {
    return {
      stats: {
        products: 0,
        orders: 0,
        users: 0,
        news: 0
      },
      loading: true
    };
  },

  async mounted() {
    this.checkAdmin();
    await this.fetchStats();
  },

  methods: {
    checkAdmin() {
      const role = localStorage.getItem("role");

      if (role !== "admin") {
        alert("Access denied ❌ Admin only");
        this.$router.replace("/");
      }
    },

    extractArray(res) {
      console.log("CHECKING:", res);

      if (!res) return [];

      if (Array.isArray(res)) return res;

      if (res.data && Array.isArray(res.data)) return res.data;

      const possibleKeys = [
        "products",
        "orders",
        "users",
        "user",
        "news",
        "result",
        "data"
      ];

      for (const key of possibleKeys) {
        if (Array.isArray(res[key])) return res[key];

        if (res.data && Array.isArray(res.data[key])) {
          return res.data[key];
        }
      }

      return [];
    },

    async fetchStats() {
      try {
        this.loading = true;

        const responses = await Promise.allSettled([
          API.get("/products"),
          API.get("/orders"),
          API.get("/admin/users"),
          API.get("/news")
        ]);

        console.log("ALL RESPONSES:", responses);

        const products =
          responses[0].status === "fulfilled"
            ? this.extractArray(responses[0].value.data)
            : [];

        const orders =
          responses[1].status === "fulfilled"
            ? this.extractArray(responses[1].value.data)
            : [];

        const users =
          responses[2].status === "fulfilled"
            ? this.extractArray(responses[2].value.data)
            : [];

        const news =
          responses[3].status === "fulfilled"
            ? this.extractArray(responses[3].value.data)
            : [];

        console.log("PRODUCTS:", products);
        console.log("ORDERS:", orders);
        console.log("USERS:", users);
        console.log("NEWS:", news);

        this.stats = {
          products: products.length || 0,
          orders: orders.length || 0,
          users: users.length || 0,
          news: news.length || 0
        };

      } catch (err) {
        console.error("Dashboard error:", err);

        this.stats = {
          products: 0,
          orders: 0,
          users: 0,
          news: 0
        };
      } finally {
        this.loading = false;
      }
    },

    logout() {
      localStorage.removeItem("role");
      localStorage.removeItem("token");
      this.$router.replace("/login");
    }
  }
};
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1 class="admin-title">Admin Dashboard</h1>
      <div class="admin-nav">
        <button @click="$router.push('/admin')">Dashboard</button>
        <button @click="$router.push('/admin/products')">Products</button>
        <button @click="$router.push('/admin/orders')">Orders</button>
        <button @click="$router.push('/admin/users')">Users</button>
        <button @click="$router.push('/admin/news')">News</button>
      </div>
    </header>
    <div v-if="loading" class="loading">
      Loading dashboard...
    </div>
    <section v-if="!loading" class="dashboard-grid">

      <div class="dashboard-card">
        <h2>{{ stats.products }}</h2>
        <p>Total Products</p>
      </div>

      <div class="dashboard-card">
        <h2>{{ stats.orders }}</h2>
        <p>Total Orders</p>
      </div>

      <div class="dashboard-card">
        <h2>{{ stats.users }}</h2>
        <p>Total Users</p>
      </div>

      <div class="dashboard-card">
        <h2>{{ stats.news }}</h2>
        <p>Total News</p>
      </div>

    </section>
      <div class="action-buttons">
        <button @click="$router.push('/admin/products')">Manage Product</button>
        <button @click="$router.push('/admin/orders')">View Orders</button>
        <button @click="$router.push('/admin/users')">View Users</button>
        <button @click="$router.push('/admin/news')">Manage News</button>
      </div>
  </div>
</template>