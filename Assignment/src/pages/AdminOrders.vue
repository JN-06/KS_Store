<script>
import axios from "axios";

export default {
  data() {
    return {
      orders: [],
      selectedOrder: null,
      loading: false,
      detailLoading: false,
      previewImage: "",
      showPreview: false,
      showCancelModal: false,
    cancelReason: ""
    };
  },

  mounted() {
    this.fetchOrders();
  },

  methods: {
    getImage(path) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      return `https://ks-store.onrender.com/${path}`;
    },

    async fetchOrders() {
      try {
        this.loading = true;
        const token = localStorage.getItem("token");
        const res = await axios.get("https://ks-store.onrender.com/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.orders =
          res.data?.orders ||
          res.data?.data ||
          res.data ||
          [];
      } catch (err) {
        console.error(err);
        alert("Failed to load orders");
      } finally {
        this.loading = false;
      }
    },

    async viewOrder(id) {
      try {
        this.detailLoading = true;
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://ks-store.onrender.com/api/orders/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data =
          res.data?.order ||
          res.data?.data ||
          res.data;

        this.selectedOrder = data;
      } catch (err) {
        console.error(err);
        alert("Failed to load order");
      } finally {
        this.detailLoading = false;
      }
    },

    backToList() {
      this.selectedOrder = null;
    },
  
    async updateStatus(status) {
      try {
        if (!this.selectedOrder?._id) return;
        if (status === "cancelled") {
          this.showCancelModal = true;
          return;
        }
        const token = localStorage.getItem("token");
        const res = await axios.put(
          `https://ks-store.onrender.com/api/orders/${this.selectedOrder._id}/status`,
          {
            paymentStatus: status
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.selectedOrder = res.data;
        this.fetchOrders();
      } catch (err) {
        console.error(err);
        alert("Failed to update status");
      }
    },

    async submitCancelOrder() {
      try {
        if (!this.cancelReason.trim()) {
          alert("Please enter a cancellation reason.");
          return;
        }
        const token = localStorage.getItem("token");
        const res = await axios.put(
          `https://ks-store.onrender.com/api/orders/${this.selectedOrder._id}/status`,
          {
            paymentStatus: "cancelled",
            cancelReason: this.cancelReason
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.selectedOrder = res.data;
        this.showCancelModal = false;
        this.cancelReason = "";
        this.fetchOrders();
      } catch (err) {
        console.error(err);
        alert("Failed to cancel order");
      }
    },

    openPreview(img) {
      this.previewImage = img;
      this.showPreview = true;
    },

    closePreview() {
      this.showPreview = false;
      this.previewImage = "";
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

      <div class="admin-sub-header">
        <h2>Orders</h2>
      </div>
      <div v-if="!selectedOrder">

        <div v-if="loading">Loading...</div>

        <table v-else class="admin-table">
          <thead>
            <tr class="title-tr">
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tr v-for="o in orders" :key="o._id" class="order-tr">

            <td :data-label="'Order ID'">{{ o._id }}</td>

            <td :data-label="'User'">
              <div v-if="o.userId">
                ID: {{ o.userId._id }}
              </div>
              <div v-else>No user data</div>
            </td>

            <td :data-label="'Total'">RM {{ o.total }}</td>

            <td :data-label="'Status'">
              <b>{{ o.paymentStatus || "pending" }}</b>
            </td>

            <td>
              <button @click="viewOrder(o._id)" class="view-btn">View</button>
            </td>

          </tr>
        </table>
      </div>
      <div v-else class="order-detail">

        <button @click="backToList" class="back-btn">
          ← Back to Orders
        </button>

        <div class="detail-card summary-card">
          <div>
            <h2>Order Detail</h2>
            <p class="order-id">{{ selectedOrder._id }}</p>
          </div>

          <div class="total-box">
            <span>Total Amount</span>
            <h2>RM {{ selectedOrder.total }}</h2>
          </div>
        </div>

        <div class="detail-card">
          <h3>Customer Information</h3>

          <div
            v-if="selectedOrder.userId && typeof selectedOrder.userId === 'object'"
            class="info-grid"
          >
            <div class="info-item">
              <span>Name</span>
              <strong>{{ selectedOrder.customer?.name || '-' }}</strong>
            </div>

            <div class="info-item">
              <span>Email</span>
              <strong>{{ selectedOrder.userId.email || '-' }}</strong>
            </div>

            <div class="info-item">
              <span>Phone</span>
              <strong>{{ selectedOrder.customer?.phone || '-' }}</strong>
            </div>

            <div class="info-item">
              <span>Address</span>
              <strong>{{ selectedOrder.customer?.address || '-' }}</strong>
            </div>

            <div class="info-item full-width">
              <span>User ID</span>
              <strong>{{ selectedOrder.userId._id }}</strong>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <h3>Order Status</h3>

          <div class="status-buttons">

            <button
              @click="updateStatus('pending')"
              :class="[
                'status',
                selectedOrder.paymentStatus === 'pending'
                  ? 'pending active'
                  : 'pending'
              ]"
            >
              Pending
            </button>

            <button
              @click="updateStatus('processing')"
              :class="[
                'status',
                selectedOrder.paymentStatus === 'processing'
                  ? 'processing active'
                  : 'processing'
              ]"
            >
              Processing
            </button>

            <button
              @click="updateStatus('complete')"
              :class="[
                'status',
                selectedOrder.paymentStatus === 'complete'
                  ? 'complete active'
                  : 'complete'
              ]"
            >
              Complete
            </button>

            <button
              @click="updateStatus('cancelled')"
              :class="[
                'status',
                selectedOrder.paymentStatus === 'cancelled'
                  ? 'cancelled active'
                  : 'cancelled'
              ]"
            >
              Cancel
            </button>
          </div>
          <div
            v-if="selectedOrder.cancelReason"
            class="cancel-box"
          >
            <h4>Cancellation Reason</h4>
            <p>{{ selectedOrder.cancelReason }}</p>
          </div>
        </div>
        <div class="detail-card">
          <h3>Payment Proof</h3>
          <img
            v-if="selectedOrder.paymentProof"
            :src="getImage(selectedOrder.paymentProof)"
            class="payment-img"
            @click="openPreview(getImage(selectedOrder.paymentProof))"
          />
          <div v-else class="empty-box">
            No payment screenshot uploaded
          </div>
        </div>
        <div class="detail-card">
          <h3>Ordered Items</h3>
          <div
            v-for="item in selectedOrder.items"
            :key="item.productId"
            class="item-card"
          >
            <div>
              <strong>{{ item.title }}</strong>
              <p>Qty: {{ item.qty }}</p>
            </div>
            <div class="item-price">
              RM {{ item.price }}
            </div>
          </div>
        </div>
      </div>
    <div v-if="showPreview" class="preview-overlay" @click="closePreview">
      <img :src="previewImage" class="preview-img-large" />
    </div>
  </div>

  <div
    v-if="showCancelModal"
    class="modal-overlay"
  >
    <div class="cancel-modal">
      <div class="modal-header">
        <h3>Cancel Order</h3>
        <button
          class="close-btn"
          @click="showCancelModal = false"
        >
          ✕
        </button>
      </div>
      <p class="modal-text">
        Please provide a reason for cancelling this order.
      </p>
      <textarea
        v-model="cancelReason"
        placeholder="Example: Payment screenshot invalid, duplicate order, fraudulent transaction..."
        rows="5"
      ></textarea>
      <div class="modal-actions">
        <button
          class="btn-secondary"
          @click="showCancelModal = false"
        >
          Keep Order
        </button>
        <button
          class="btn-danger"
          @click="submitCancelOrder"
        >
          Confirm Cancellation
        </button>
      </div>
    </div>
  </div>
</template>

<style>

.status-box button {
  margin-right: 8px;
}

.payment-img {
  width: 200px;
  border-radius: 8px;
}

.clickable {
  cursor: zoom-in;
}

.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-img-large {
  max-width: 90%;
  max-height: 90%;
}

.order-detail {
  max-width: 1100px;
  margin: auto;
}

.detail-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;

  box-shadow: 0 8px 30px rgba(0,0,0,.06);
}

.summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  color: #888;
  margin-top: 5px;
}

.total-box {
  text-align: right;
}

.total-box span {
  color: #888;
  font-size: 14px;
}

.total-box h2 {
  color: #ff4d6d;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 16px;
}

.info-item {
  background: #f7f8fc;
  padding: 15px;
  border-radius: 12px;
}

.info-item span {
  display: block;
  color: #888;
  font-size: 13px;
  margin-bottom: 6px;
}

.full-width {
  grid-column: span 2;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.status {
  border: none;
  padding: 14px 24px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  min-width: 130px;
}

.status:hover {
  transform: translateY(-2px);
}

.pending {
  background: #ff6b81;
  color: white;
}

.processing {
  background: #ff6b81;
  color: white;
}

.complete {
  background: #ff6b81;
  color: white;
}

.cancelled {
  background: #ff6b81;
  color: white;
}

.pending.active {
  background: #a32d2d;
  color: white;
}

.processing.active {
  background: #a32d2d;
  color: white;
}

.complete.active {
  background: #a32d2d;
  color: white;
}

.cancelled.active {
  background: #a32d2d;
  color: white;
}

.payment-img {
  width: 350px;
  max-width: 100%;
  border-radius: 16px;
  cursor: zoom-in;

  transition: .25s;
}

.payment-img:hover {
  transform: scale(1.02);
}

.empty-box {
  background: #f7f8fc;
  padding: 20px;
  border-radius: 12px;
  color: #888;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px;
  border-radius: 12px;
  background: #f7f8fc;
  margin-bottom: 12px;
}

.item-price {
  color: #ff4d6d;
  font-weight: 800;
}

@media (max-width: 900px) {

  .summary-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(6px);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9999;
}

.cancel-modal {
  width: 95%;
  max-width: 550px;

  background: white;
  border-radius: 24px;

  padding: 28px;

  box-shadow:
    0 20px 60px rgba(0,0,0,.15);

  animation: popup .25s ease;
}

@keyframes popup {
  from {
    opacity: 0;
    transform: translateY(20px) scale(.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
}

.close-btn {
  border: none;
  background: #f4f4f4;

  width: 40px;
  height: 40px;

  border-radius: 50%;

  cursor: pointer;
  font-size: 18px;
}

.close-btn:hover {
  background: #ececec;
}

.modal-text {
  color: #666;
  margin-bottom: 16px;
}

.cancel-modal textarea {
  width: 94%;
  resize: none;

  padding: 14px;
  border-radius: 14px;

  border: 1px solid #ddd;

  font-size: 15px;

  outline: none;
  transition: .2s;
}

.cancel-modal textarea:focus {
  border-color: #ff6b81;
  box-shadow: 0 0 0 4px rgba(255,107,129,.15);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  margin-top: 20px;
}

.btn-secondary {
  border: none;
  padding: 12px 20px;

  border-radius: 12px;

  background: #f3f4f6;
  cursor: pointer;
  font-weight: 600;
}

.btn-danger {
  border: none;
  padding: 12px 20px;

  border-radius: 12px;

  background: #ff6b81;
  color: white;

  cursor: pointer;
  font-weight: 700;
}

.btn-danger:hover {
  background: #a32d2d;
}

@media (max-width: 900px) {

  .title-tr {
    display: none;
  }

  .order-tr {
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
    padding: 6px 0;
    border: none;
    font-size: 13px;
  }

  .admin-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #777;
  }

   .view-btn {
    font-size: 11px;
    border-radius: 8px;
    min-width: auto;
    width: auto;
    line-height: 1;
  }

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
}
</style>