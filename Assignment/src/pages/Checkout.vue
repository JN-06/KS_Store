<script>
import API from "@/services/api";

export default {
  data() {
    return {
      cart: [],
      loading: false,
      error: null,

      form: {
        name: "",
        phone: "",
        address: "",
        paymentMethod: "Online"
      },

      paymentFile: null,
      paymentPreview: "",

      ocrResult: null,
      verifying: false,
      ocrError: "",

      toast: {
        show: false,
        message: ""
      }
    };
  },

  computed: {
    totalPrice() {
      return this.cart.reduce((sum, item) => {
        return sum + Number(item.price) * Number(item.qty);
      }, 0);
    }
  },

  mounted() {
    this.loadCheckoutItems();
  },

  methods: {
    getImg(src) {
      if (!src) return "";
      if (src.startsWith("http") || src.startsWith("blob:")) return src;
      if (!src.startsWith("/")) src = "/" + src;
      return `http://localhost:5000${src}`;
    },

    loadCheckoutItems() {
      const raw = JSON.parse(localStorage.getItem("checkout") || "[]");

      this.cart = raw.map(i => ({
        productId: String(i.productId || i.id),
        title: i.title,
        price: Number(i.price),
        qty: Number(i.qty),
        variant: i.variant || "default",
        maxStock: Number(i.maxStock || 999),

        image: i.variantImage || i.image || ""
      }));
    },

    handlePaymentFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (this.paymentPreview) URL.revokeObjectURL(this.paymentPreview);

      this.paymentFile = file;
      this.paymentPreview = URL.createObjectURL(file);
      this.ocrResult = null;
      this.ocrError = "";
    },

    async verifyPayment() {
      if (!this.paymentFile) {
        this.ocrError = "Please upload a payment screenshot";
        return;
      }

      this.verifying = true;
      this.ocrError = "";
      this.ocrResult = null;

      try {
        const formData = new FormData();
        formData.append("image", this.paymentFile);
        formData.append("amount", this.totalPrice);
        formData.append("receiver", "CHEN JIA NING");

        const res = await API.post("/orders/payment/upload", formData);
        this.ocrResult = res.data.result;

        const c = this.ocrResult?.checks || {};

        if (this.ocrResult.status === "error") {
          this.ocrError = "OCR processing failed";
        } else if (!c.nameMatch) {
          this.ocrError = "Name must be 'CHEN JIA NING'";
        } else if (!c.amountMatch) {
          this.ocrError = "Amount does not match";
        } else {
          this.ocrError = "";
        }
      } catch (err) {
        this.ocrError = err?.response?.data?.error || err.message || "Verification failed";
      } finally {
        this.verifying = false;
      }
    },

    async validateStock() {

      for (const item of this.cart) {

        const res = await API.get(`/products/${item.productId}`);
        const product = res.data;
        const variant = (product.variants || []).find(
          v =>
            (v.key || v.title) === item.variant
        );

        if (!variant) {
          this.showToast(
            `${item.title} variant no longer exists`
          );
          return false;
        }

        if (item.qty > Number(variant.stock)) {

          this.showToast(
            `${item.title} (${item.variant}) only has ${variant.stock} left`
          );

          return false;
        }
      }

      return true;
    },

    async placeOrder() {
      if (!this.form.name || !this.form.phone || !this.form.address) {
        this.showToast("Please fill in all required information");
        return;
      }

      if (this.cart.length === 0) {
        this.showToast("No items selected");
        return;
      }

      if (!await this.validateStock()) return;

      if (!this.form.paymentMethod) {
        this.showToast("Please select a payment method");
        return;
      }

      let paymentStatus = "pending";

      if (this.form.paymentMethod === "Online") {

        if (!this.paymentFile) {
          this.showToast("Please upload payment screenshot");
          return;
        }

        if (!this.ocrResult) {
          this.showToast("Please verify payment first");
          return;
        }

        if (this.ocrResult.status === "error") {
          this.showToast("Payment verification failed");
          return;
        }

        const result = this.ocrResult;

        const c = result.checks || {};
        if (result.status === "error") {
          this.showToast("Payment verification failed");
          return;
        }
        if (result.status === "failed") {
          this.showToast("Payment is invalid. Please re-upload screenshot.");
          return;
        }
        if (result.status === "review") {
          const warnings = [];

          if (!c.nameMatch) warnings.push("Name mismatch");
          if (!c.amountMatch) warnings.push("Amount mismatch");

          this.showToast(
            "Payment needs review: " + warnings.join(", ")
          );
        }

        paymentStatus =
          this.ocrResult.status === "valid" ? "valid" : "review";
      }

      this.loading = true;

      try {
        const token = localStorage.getItem("token");

        const formData = new FormData();

        formData.append("customer", JSON.stringify(this.form));
        formData.append("items", JSON.stringify(this.cart.map(i => ({
          productId: String(i.productId),
          title: i.title,
          price: Number(i.price),
          qty: Number(i.qty),
          variant: i.variant || "default"
        }))));

        formData.append("total", this.totalPrice);
        formData.append("paymentStatus", paymentStatus);

        if (this.paymentFile) {
          formData.append("paymentProof", this.paymentFile);
        }

        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    this.showToast("🎉 Order placed successfully!");

        const userId = localStorage.getItem("userId");

    const cartKey = `cart_${userId}`;

    const currentCart = JSON.parse(
      localStorage.getItem(cartKey) || "[]"
    );

    const updatedCart = currentCart.filter(cartItem => {
      const matched = this.cart.find(checkoutItem =>
        String(checkoutItem.productId) === String(cartItem.productId) &&
        (checkoutItem.variant || "default") ===
        (cartItem.variant || "default")
      );
      return !matched;
    });

    localStorage.setItem(
      cartKey,
      JSON.stringify(updatedCart)
    );

    const updatedSelected = JSON.parse(
      localStorage.getItem("selectedCart") || "[]"
    ).filter(uid => {

      return !this.cart.some(item =>
        uid === `${item.productId}::${item.variant || "default"}`
      );

    });

    localStorage.setItem(
      "selectedCart",
      JSON.stringify(updatedSelected)
    );

    localStorage.removeItem("checkout");

        this.$router.push({
      path: "/receipt",
      query: {
        orderId: data.order?._id || Date.now(),
        total: this.totalPrice
      }
    });

      } catch (err) {
        const msg = err.message || "Something went wrong";

        if (msg.includes("Token expired")) {
          this.showToast("Session expired. Please login again.");
          localStorage.removeItem("token");
          this.$router.push("/login");
          return;
        }

        this.error = msg;
        this.showToast(msg);

      } finally {
        this.loading = false;
      }
    },
    showToast(message, duration = 2200) {
      this.toast.message = message;
      this.toast.show = true;

      clearTimeout(this._toastTimer);

      this._toastTimer = setTimeout(() => {
        this.toast.show = false;
      }, duration);
    }
  }
};
</script>

<template>
  <div class="checkout-page">
    <div class="checkout-header">
      <h1>Checkout</h1>
      <p class="subtitle">Complete your order</p>
    </div>

    <div v-if="error">{{ error }}</div>

    <div v-if="cart.length" class="checkout-content">
      <div class="order-summary">
        <h3 class="section-title">Order Summary</h3>
        <div v-for="(item, i) in cart" :key="i" class="order-item">
          <img :src="item.image" :alt="item.title" class="item-image" />
          <div class="item-info">
            <h4>{{ item.title }}</h4>
            <p class="qty">Qty: {{ item.qty }}</p>
          </div>
          <div class="item-price">
            RM {{ (item.price * item.qty).toFixed(2) }}
          </div>
        </div>

        <div class="total-bar">
          <span>Total</span>
          <span class="total-amount">RM {{ totalPrice.toFixed(2) }}</span>
        </div>
      </div>

      <div class="checkout-form">
        <h3 class="section-title">Delivery Information</h3>

        <input v-model="form.name" placeholder="Full Name" class="input-field" />
        <input v-model="form.phone" placeholder="Phone Number" class="input-field" />
        <textarea v-model="form.address" placeholder="Full Address" class="textarea-field"></textarea>

        <h3 class="section-title">Payment Method</h3>
        <select v-model="form.paymentMethod" class="select-field">
          <option value="Online">Touch 'n Go</option>
        </select>

        <div v-if="form.paymentMethod === 'Online'" class="qr-section">
          <h4>Scan to Pay (Touch 'n Go)</h4>

          <img
            src="/Payment.jpeg"
            alt="Touch n Go QR"
            class="qr-image"
          />

          <p class="qr-note">
            Please upload screenshot after payment
          </p>
        </div>

        <div v-if="form.paymentMethod === 'Online'" class="payment-section">
          <h4>Upload Payment Proof</h4>
          <div class="upload-area">
            <div class="file-upload">
              <input
                type="file"
                @change="handlePaymentFile"
                accept="image/*"
                id="paymentFile"
              />

              <label for="paymentFile" class="upload-btn">
                Choose Payment Screenshot
              </label>
            </div>
            <img v-if="paymentPreview" :src="paymentPreview" class="preview" />
          </div>

          <button @click="verifyPayment" :disabled="verifying" class="verify-btn">
            {{ verifying ? "AI Verifying..." : "Verify Payment with AI" }}
          </button>

          <div v-if="ocrResult" class="ai-result">
            <p><strong>Status:</strong> <span :class="ocrResult.status">{{ ocrResult.status.toUpperCase() }}</span></p>
            <p>If have problem, contact support.</p>
            <p>Email: MY.service@popmart.com</p>
          </div>
        </div>

        <button
          class="place-order-btn"
          @click="placeOrder"
          :disabled="loading"
        >
          {{ loading ? "Processing Order..." : "Place Order • RM " + totalPrice.toFixed(2) }}
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No items selected for checkout</p>
    </div>

    <div v-if="toast.show" class="toast-popup">
      {{ toast.message }}
    </div>
  </div>
</template>

<style>
:root {
  --primary: #ff6b81;
  --primary-dark: #ff4d6d;
}

.checkout-page {
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.checkout-header {
  text-align: center;
  padding: 30px 0 20px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  margin: -20px -20px 30px;
  border-radius: 20px 20px 0 0;
}

.checkout-header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
}

.subtitle {
  margin: 8px 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.order-summary {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 25px;
}

.section-title {
  color: var(--primary-dark);
  margin-bottom: 18px;
  font-size: 1.35rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 10px;
}

.item-info h4 {
  margin: 0 0 4px 0;
  font-size: 1.05rem;
}

.qty {
  color: #666;
  margin: 0;
}

.item-price {
  margin-left: auto;
  font-weight: 600;
  color: var(--primary-dark);
  font-size: 1.1rem;
}

.total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #ddd;
  font-size: 1.4rem;
  font-weight: 700;
}

.total-amount {
  color: var(--primary);
}

.checkout-form {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.input-field, .textarea-field, .select-field{
  width: 96%;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-field:focus, .textarea-field:focus, .select-field:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 107, 129, 0.15);
}

.textarea-field {
  min-height: 100px;
  resize: vertical;
}

.payment-section {
  margin: 25px 0;
  padding: 20px;
  background: #ffeef3;
  border: 2px dashed var(--primary);
  border-radius: 16px;
  text-align: center;
}

.payment-section h4{
  text-align: left;
}

.upload-area {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin: 15px 0;
}

.preview {
  max-width: 100%;
  max-height: 280px;
  border-radius: 12px;
  margin-top: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.verify-btn {
  background: #fff;
  color: black;
  border: none;
  padding: 14px 28px;
  border-radius: 50px;
  font-weight: 1000;
  cursor: pointer;
  width: 30%;
  margin: 10px 0;
  transition: all 0.3s;
}

.verify-btn:hover {
  background: #ff6b81;
  transform: translateY(-2px);
  color: white;
}

.place-order-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: black;
  border: none;
  padding: 18px;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 8px 20px rgba(255, 107, 129, 0.3);
  transition: all 0.3s;
}

.place-order-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(255, 107, 129, 0.4);
}

.place-order-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.ai-result {
  text-align: center;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 10px;
  color: #166534;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  font-size: 1.2rem;
}

.file-upload {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.file-upload input {
  display: none;
}

.upload-btn {
  display: inline-block;
  padding: 12px 18px;

  background: #ff6b81;
  color: white;

  border-radius: 12px;

  font-weight: 600;
  font-size: 14px;

  cursor: pointer;

  transition: 0.2s ease;
  box-shadow: 0 6px 16px rgba(255, 107, 129, 0.25);
}

.upload-btn:hover {
  background: #ff4d6d;
  transform: translateY(-2px);
}

.upload-btn:active {
  transform: scale(0.98);
}

.toast-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: rgba(0, 0, 0, 0.85);
  color: white;

  padding: 14px 28px;
  border-radius: 12px;

  font-size: 15px;
  font-weight: 600;

  z-index: 9999;

  animation: fadeToast 2.2s ease forwards;
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

.qr-section {
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background: #fff9fb;
  border: 2px dashed #ff6b81;
  border-radius: 12px;
}

.qr-image {
  width: 220px;
  max-width: 100%;
  margin: 10px 0;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.qr-note {
  font-size: 13px;
  color: #666;
}

@media (max-width: 900px){

  .input-field, .textarea-field, .select-field{
    width: 90%;
    padding: 14px 16px;
    margin-bottom: 16px;
    border: 2px solid #eee;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s;
  }

  .verify-btn{
    width: 100%;
  }
}
</style>