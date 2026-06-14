<script>
import API from "@/services/api";

export default {
  name: "AdminNews",
  data() {
    return {
      newsList: [],
      loading: false,
      pageMode: "list",
      editingId: null,
      showToast: false,
      toastMessage: "",
      showDeleteModal: false,
      newsToDelete: null,
      form: {
        title: "",
        description: "",
        image: null,
        preview: "",
        status: "published"
      }
    };
  },

  mounted() {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      alert("Access denied ❌");
      this.$router.push("/");
      return;
    }
    this.fetchNews();
  },

  methods: {
    async fetchNews() {
      try {
        this.loading = true;
        const res = await API.get("/news");
        this.newsList = res.data || [];
      } catch (err) {
        console.error(err);
        this.showToastMessage("❌ Failed to add news");
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        title: "",
        description: "",
        image: null,
        preview: "",
        status: "draft"
      };
      this.editingId = null;
    },

    goList() {
      this.pageMode = "list";
      this.resetForm();
    },

    handleImage(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.form.image = file;
      this.form.preview = URL.createObjectURL(file);
    },

    getImage(img) {
      if (!img) return "";
      if (typeof img === "string" && img.startsWith("http")) return img;
      return `https://ks-store.onrender.com/${img}`;
    },


    async addNews() {
      try {
        if (!this.form.title || !this.form.description) {
          alert("Please fill all fields");
          return;
        }
        const formData = new FormData();
        formData.append("title", this.form.title);
        formData.append("description", this.form.description);
        formData.append("status", "published");
        if (this.form.image) {
          formData.append("image", this.form.image);
        }
        await API.post("/news", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        this.showToastMessage("✅ News added!");
        this.backToList();
        this.goList();
        this.fetchNews();
      } catch (err) {
        console.error(err);
        this.showToastMessage("❌ Failed to add news");
      }
    },

    editNews(n) {
      this.pageMode = "edit";
      this.editingId = n._id;

      this.form.title = n.title;
      this.form.description = n.description;
      this.form.preview = this.getImage(n.image);
      this.form.image = null;
      this.form.status = n.status || "draft";
    },

    async saveDraft() {
      try {
        const formData = new FormData();
        formData.append("title", this.form.title || "Untitled Draft");
        formData.append("description", this.form.description || "");
        formData.append("status", "draft");
        if (this.form.image) {
          formData.append("image", this.form.image);
        }
        if (this.editingId) {
          await API.put(`/news/${this.editingId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        } else {
          await API.post("/news", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        }
        this.showToastMessage("📝 Draft saved!");
        this.backToList();
        this.goList();
        this.fetchNews();
      } catch (err) {
        console.error(err);
        this.showToastMessage("❌ Draft failed");
      }
    },
    async updateNews() {
      try {
        const formData = new FormData();
        formData.append("title", this.form.title);
        formData.append("description", this.form.description);
        formData.append("status", "published"); 
        if (this.form.image) {
          formData.append("image", this.form.image);
        }
        await API.put(`/news/${this.editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        this.showToastMessage("✅ News updated!");
        this.backToList();
        this.goList();
        this.fetchNews();
      } catch (err) {
        console.error(err);
        this.showToastMessage("❌ Update failed");
      }
    },

    deleteNews(news) {
      this.newsToDelete = news;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      if (!this.newsToDelete) return;

      try {
        await API.delete(`/news/${this.newsToDelete._id}`);

        this.showToastMessage("🗑️ News deleted!");
        this.fetchNews();

      } catch (err) {
        console.error(err);
        this.showToastMessage("❌ Delete failed");
      }

      this.cancelDelete();
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.newsToDelete = null;
    },

    showToastMessage(msg) {
      this.toastMessage = msg;
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, 2000);
    },

    backToList() {
      this.pageMode = "list";
      this.editingId = null;
      this.resetForm();
    }
  }
};
</script>

<template>
  <div class="admin-news">
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

    <div class="admin-sub-header ">
      <h2>News</h2>
      <button class="admin-nav__btn" @click="pageMode = 'create'">
        + Add News
      </button>
    </div>

    <div v-if="showToast" class="toast-popup">
      {{ toastMessage }}
    </div>
    <div v-if="pageMode === 'list'">
      <div v-if="loading" class="loading">Loading dashboard...</div>
      <div class="admin-news-grid">
        <div v-for="n in newsList" :key="n._id" class="admin-news-card">
          <img :src="getImage(n.image)" class="admin-news-image"/>

          <h3 class="admin-news-title">
            {{ n.title }}
            <span v-if="n.status === 'draft'" class="draft-badge">
              Draft
            </span>
          </h3>
          <p class="admin-news-desc">{{ n.description }}</p>
          <div class="admin-news-actions">
            <button @click="editNews(n)">Edit</button>
            <button class="admin-news-delete" @click="deleteNews(n)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="admin-news-form">
      <button @click="backToList" class="back-btn">← Back</button>
      <h2 class="admin-news-form-title">
        {{ pageMode === 'create' ? 'Add News' : 'Edit News' }}
      </h2>
      <input v-model="form.title" class="admin-news-input" placeholder="Title" />
      <textarea v-model="form.description" class="admin-news-textarea" placeholder="Description"></textarea>
      <div v-if="form.preview" class="admin-news-preview">
        <img :src="form.preview" />
      </div>
      <label class="custom-upload">
        <span>Choose Image</span>
        <input type="file" @change="handleImage" />
      </label>
      <div class="admin-news-form-actions">
        <button class="draft-btn" @click="saveDraft">
          Save Draft
        </button>
        <button
          v-if="pageMode === 'create'"
          class = "btn-publish"
          @click="addNews"
        >
          Publish
        </button>
        <button
          v-if="pageMode === 'edit'"
          class = "btn-publish"
          @click="updateNews"
        >
          Update
        </button>
      </div>
    </div>

    <div
      v-if="showDeleteModal"
      class="delete-overlay"
      @click="cancelDelete"
    >
      <div class="delete-modal" @click.stop>
        <div class="delete-icon">🗑️</div>
        <h3>Delete News?</h3>
        <p>
          Are you sure you want to delete
          <strong>"{{ newsToDelete?.title }}"</strong>?
        </p>
        <div class="delete-actions">
          <button class="cancel-btn" @click="cancelDelete">
            Cancel
          </button>
          <button class="confirm-btn" @click="confirmDelete">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.admin-nav__btn {
  color: black;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;

  width: auto;
  flex: 0 0 auto;
  white-space: nowrap;

  background: #fff;
  border: 1px solid rgba(255, 77, 109, 0.3);
  padding: 10px 16px;
}

.admin-nav__btn:hover {
  background: #ff4d6d;
  transform: translateY(-2px);
  color: white;
}

.admin-news {
  padding: 40px;
  font-family: "Inter", sans-serif;
  background: #f6f7fb;
  min-height: 100vh;
}

.admin-news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 15px 20px;
  margin-bottom: 25px;

  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
}

.admin-news-header button:hover {
  background: #ff6b81;
  color: white;
}

.admin-news-add-btn {
  background: linear-gradient(135deg, #ff6b81, #ff9eb5);
  color: white;
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  margin-bottom: 20px;
  transition: 0.3s;
}

.admin-news-add-btn:hover {
  transform: translateY(-2px);
}

.admin-news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}

.admin-news-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;

  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  transition: 0.25s;

  display: flex;
  flex-direction: column;
}


.admin-news-card:hover {
  transform: translateY(-5px);
}

.admin-news-image {
  width: 100%;
  height: 230px;
  object-fit: cover;
}

.admin-news-title {
  margin-top: 12px;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 800;
}

.admin-news-desc {
  padding: 6px 20px 14px;
  font-size: 14px;
  color: #666;
  text-align: justify;
}

.admin-news-actions {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 12px 14px;
  border-top: 1px solid #f1f1f1;
  gap: 10px;
}

.admin-news-actions button {
  padding: 8px 14px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
}

.admin-news-actions button:first-child {
  background: #ff6b81;
  color: white;
}

.admin-news-delete {
  background: #111;
  color: white;
}

.admin-news-form {
  background: white;
  max-width: 700px;
  margin: auto;
  padding: 25px;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.admin-news-form-title {
  font-size: 22px;
  font-weight: 900;
  margin-bottom: 20px;
  text-align: center;
}

.admin-news-input,
.admin-news-textarea {
  width: 100%;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #eee;
  outline: none;
    width: 96%;
}

.admin-news-textarea {
  min-height: 120px;
}

.admin-news-preview img {
  width: 180px;
  border-radius: 12px;
  margin-bottom: 10px;
}

 .custom-upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 12px 22px;
  margin-bottom: 18px;

  background: white;
  border: 2px dashed #ff6b81;
  border-radius: 14px;

  color: #ff6b81;
  font-weight: 700;
  font-size: 14px;

  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-upload:hover {
  background: #ff6b81;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255,107,129,0.25);
}

.custom-upload input {
  display: none;
}

.admin-news-form-actions {
  display: flex;
  gap: 10px;
}

.admin-news-form-actions button {
  flex: 1;
  padding: 10px;
  cursor: pointer;
}

.toast-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: rgba(0,0,0,0.85);
  color: white;

  padding: 14px 28px;
  border-radius: 12px;

  font-size: 15px;
  font-weight: 600;

  z-index: 9999;

  animation: fadeToast 2s ease;
}

@keyframes fadeToast {
  0% {
    opacity: 0;
    transform: translate(-50%, -40%);
  }

  15% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }

  85% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
}

.draft-btn {
  background: white;
  color: #666;
  border: 2px solid #ddd;
  padding: 14px 34px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s ease;
}

.draft-btn:hover {
  border-color: #999;
  color: black;
}


.draft-badge {
  background: #ffeaa7;
  color: #6c5ce7;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  margin-left: 10px;
  font-weight: 700;
}
.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9998;
  backdrop-filter: blur(4px);
}

.delete-modal {
  width: 420px;
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;

  box-shadow: 0 20px 40px rgba(0,0,0,0.15);

  animation: popIn 0.25s ease;
}

.delete-icon {
  font-size: 42px;
  margin-bottom: 12px;
}

.delete-modal h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.delete-modal p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.delete-actions {
  display: flex;
  gap: 12px;
}

.delete-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  background: #f1f2f6;
  color: black;
}

.cancel-btn:hover {
  background: #dfe4ea;
}

.confirm-btn {
  background: #ff4757;
  color: white;
}

.confirm-btn:hover {
  background: #e84118;
}

.btn-publish {
  background: #ff6b81;
  color: white;
  border: none;
  padding: 14px 34px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s ease;
}

.btn-publish:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(255,107,129,0.35);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>