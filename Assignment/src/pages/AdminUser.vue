<script>
import API from "@/services/api";

export default {
  name: "AdminUser",

  data() {
  return {
    users: [],
    loading: false,

    showToast: false,
    toastMessage: "",

    showDeleteModal: false,
    userToDelete: null
  };
},

  mounted() {
    this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      try {
        this.loading = true;

        const res = await API.get("/admin/users");
        this.users = res.data || [];

      } catch (err) {
        console.error(err);
        this.showToastMessage("❌ Failed to load users");
      } finally {
        this.loading = false;
      }
    },

    deleteUser(user) {
      this.userToDelete = user;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      if (!this.userToDelete) return;

      try {
        await API.delete(`/admin/users/${this.userToDelete._id}`);

        this.showToastMessage("🗑️ User deleted");
        this.fetchUsers();

      } catch (err) {
        console.error(err);
        this.showToastMessage("❌ Delete failed");
      }

      this.cancelDelete();
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.userToDelete = null;
    },

    showToastMessage(msg) {
      this.toastMessage = msg;
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, 2000);
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

    <div class="admin-sub-header ">
      <h2>Users</h2>
    </div>

    <div v-if="showToast" class="toast-popup">
      {{ toastMessage }}
    </div>

    <div v-if="loading" class="loading">
      Loading users...
    </div>

    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>User ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Address</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in users" :key="u._id">
          
          <td :data-label="'User ID'">
            {{ u._id }}
          </td>

          <td :data-label="'Name'">
            {{ u.name }}
          </td>

          <td :data-label="'Email'">
            {{ u.email }}
          </td>

          <td :data-label="'Phone'">
            {{ u.phone || "-" }}
          </td>

          <td :data-label="'Address'">
            {{ u.address || "-" }}
          </td>

          <td>
            <button
              class="delete-btn"
              @click="deleteUser(u)"
            >
              Delete
            </button>
          </td>

        </tr>
      </tbody>
    </table>

    <div
      v-if="showDeleteModal"
      class="delete-overlay"
      @click="cancelDelete"
    >
      <div class="delete-modal" @click.stop>

        <div class="delete-icon">🗑️</div>

        <h3>Delete User?</h3>

        <p>
          Are you sure you want to delete
          <strong>"{{ userToDelete?.name }}"</strong>?
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
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  background: white;
  border-radius: 18px;
  font-weight: 700;
  color: #ff6b81;
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

@media (max-width: 900px) {

  .admin-table thead {
    display: none;
  }

  .admin-table tr {
    display: block;
    background: white;
    margin-bottom: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  }

  .admin-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 8px 0;
    border: none;
    font-size: 13px;
    text-align: right;
  }

  .admin-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #777;
    text-align: left;
  }

  .delete-btn {
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 8px;
    width: auto;
  }
}
</style>