<script>
export default {
  data() {
    return {
      order: null
    };
  },

  mounted() {
    this.loadReceipt();
  },

  methods: {
    loadReceipt() {
      const query = this.$route.query;
      const checkout = JSON.parse(localStorage.getItem("checkout") || "[]");

      this.order = {
        orderId: query.orderId || "ORD-" + Date.now().toString().slice(-8),
        total: query.total || 0,
        items: checkout,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
      };
    },

    goHome() {
      localStorage.removeItem("checkout");
      this.$router.push("/account");
    }
  }
};
</script>

<template>
  <div class="receipt-page">
    <div class="receipt-card">
      
      <div class="success-header">
        <div class="icon-wrap">
          <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1>Order Confirmed!</h1>
        <p class="subtitle">Thank you for your purchase. We're preparing your order.</p>
      </div>

      <div class="receipt-body">
        
        <div class="receipt-grid">
          <div class="info-box">
            <span class="label">Order ID</span>
            <span class="value">{{ order?.orderId }}</span>
          </div>
          <div class="info-box">
            <span class="label">Date</span>
            <span class="value">{{ order?.date }}</span>
          </div>
        </div>

        <div class="items-section" v-if="order?.items && order.items.length">
          <h3>Items Purchased</h3>
          <div class="items-list">
            <div v-for="(item, i) in order.items" :key="i" class="item-card">
              <div class="left">
                <span class="name">{{ item.title }}</span>
                <span class="meta">Qty: {{ item.qty }} • {{ item.variant || "Standard" }}</span>
              </div>
              <div class="right">
                RM {{ (item.price * item.qty).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="total-box">
          <span class="total-label">Total Amount Paid</span>
          <span class="total-amount">RM {{ Number(order?.total || 0).toFixed(2) }}</span>
        </div>
      </div>

      <div class="receipt-footer">
        <button class="btn btn-primary" @click="goHome">
          View 
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.receipt-page {
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top, #fdf2f4, #f4f5f9);
  padding: 24px;
  -webkit-font-smoothing: antialiased;
}

.receipt-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 20px 50px rgba(165, 175, 190, 0.18);
  animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.success-header {
  text-align: center;
  padding: 40px 32px 24px;
}

.icon-wrap {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: #e6f9f0;
  color: #10b981;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: scaleBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.success-icon {
  width: 28px;
  height: 28px;
}

.success-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.receipt-body {
  padding: 0 32px;
}

.receipt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.info-box {
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  word-break: break-all;
}

.items-section h3 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  margin: 0 0 12px;
}

.items-list {
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.item-card:last-child {
  border-bottom: none;
}

.left {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.right {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
}

.total-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 32px;
}

.total-label {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
}

.total-amount {
  color: #ff3d5a;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.receipt-footer {
  padding: 0 32px 32px;
}

.btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #ff3e5e;
  color: #ffffff;
}

.btn-primary:hover {
  background: #ff6d87;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.btn-primary:hover .btn-icon {
  transform: translateX(4px);
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleBounce {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}


@media (max-width: 900px) {
  .receipt-page {
    padding: 16px;
    align-items: flex-start;
    min-height: 45vh;
  }

  .receipt-card {
    max-width: 100%;
    border-radius: 20px;
  }

  .success-header {
    padding: 28px 20px 18px;
  }

  .receipt-body {
    padding: 0 20px;
  }

  .receipt-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .info-box {
    padding: 12px 14px;
  }

  .items-list {
    max-height: 220px;
  }

  .total-box {
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
  }

  .total-amount {
    font-size: 20px;
  }

  .receipt-footer {
    padding: 0 20px 24px;
  }

  .btn {
    font-size: 14px;
    padding: 14px;
  }

  .left{
    width: 75%;
    margin-left: 20px;
  }

  .right{
    width: 25%
  }
}
</style>