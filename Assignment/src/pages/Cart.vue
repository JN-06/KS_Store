<script>
export default {
  data() {
    return {
      cart: [],
      selected: [],
      showClearModal: false,
      toast: {
        show: false,
        message: "",
      }
    }
  },

  computed: {
    totalPrice() {
      return this.cart
        .filter(i => this.selected.includes(i.uniqueId))
        .reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0)
    },

    isAllSelected() {
      return this.cart.length > 0 &&
        this.selected.length === this.cart.length
    }
  },

  mounted() {
    this.loadCart()
    this.loadSelected()
    window.addEventListener("storage", this.loadCart)
    window.addEventListener("focus", this.loadCart)
  },

  beforeUnmount() {
    window.removeEventListener("storage", this.loadCart)
    window.removeEventListener("focus", this.loadCart)
  },

  methods: {

    getUserId() {
      return localStorage.getItem("userId")
    },

    getCartKey() {
      return `cart_${this.getUserId()}`
    },

    getImg(src) {
      if (!src) return ""
      if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) {
        return src
      }
      if (!src.startsWith("/")) src = "/" + src
      return `https://ks-store.onrender.com${src}`
    },

    loadCart() {
      const key = this.getCartKey()

      let raw
      try {
        raw = JSON.parse(localStorage.getItem(key)) || []
      } catch {
        raw = []
      }

      this.cart = raw
        .filter(i => i && i.productId)
        .map(i => ({
          productId: String(i.productId),
          variant: i.variant || "default",
          uniqueId: `${i.productId}::${i.variant}`,

          title: i.title,
          image: i.variantImage || i.image || "",
          variantImage: i.variantImage || i.image || "",
          price: Number(i.price),
          qty: Number(i.qty),
          maxStock: Number(i.maxStock || 999)
        }))
    },

    loadSelected() {
      try {
        const raw = JSON.parse(localStorage.getItem("selectedCart") || "[]")
        this.selected = raw.map(i => String(i))
      } catch {
        this.selected = []
      }
    },

    saveSelected() {
      localStorage.setItem("selectedCart", JSON.stringify(this.selected))
    },

    toggleSelect(item) {
      const uid = item.uniqueId
      const index = this.selected.indexOf(uid)

      if (index > -1) this.selected.splice(index, 1)
      else this.selected.push(uid)

      this.saveSelected()
    },

    toggleSelectAll() {
      if (this.isAllSelected) this.selected = []
      else this.selected = this.cart.map(i => i.uniqueId)

      this.saveSelected()
    },

    increaseQty(item) {
      if (item.qty < item.maxStock) {
        item.qty++
        this.saveCart()
      } else {
        this.showToast(`Only ${item.maxStock} in stock`)
      }
    },

    decreaseQty(item) {
      if (item.qty > 1) {
        item.qty--
        this.saveCart()
      } else {
        this.removeItem(item)
      }
    },

    removeItem(item) {
      this.cart = this.cart.filter(i => i.uniqueId !== item.uniqueId)
      this.selected = this.selected.filter(i => i !== item.uniqueId)

      this.saveCart()
      this.saveSelected()
    },

    clearCart() {
      this.showClearModal = true
    },

    confirmClearCart() {
      this.cart = []
      this.selected = []

      this.saveCart()
      this.saveSelected()

      this.showClearModal = false
    },

    cancelClearCart() {
      this.showClearModal = false
    },

    goToProduct(item) {
      if (!item.productId) {
        this.showToast("Invalid product ID")
        return
      }

      this.$router.push(`/product/${item.productId}`)
    },

    checkout() {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        this.showToast("Please login before checkout");
        this.$router.push("/login");
        return;
      }

      if (role === "admin") {
        this.showToast("Admin accounts cannot place orders");
        return;
      }

      const selectedItems = this.cart
        .filter(i => this.selected.includes(i.uniqueId))
        .map(i => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          qty: i.qty,
          variant: i.variant,
          image: i.variantImage || i.image || "",
        }));

      if (selectedItems.length === 0) {
        this.showToast("Please select items first");
        return;
      }

      localStorage.setItem("checkout", JSON.stringify(selectedItems));

      this.$router.push("/checkout");
    },
    showToast(message, duration = 2200) {
      this.toast.message = message;
      this.toast.show = true;

      clearTimeout(this._toastTimer);

      this._toastTimer = setTimeout(() => {
        this.toast.show = false;
      }, duration);
    },
    saveCart() {
      const key = this.getCartKey();
      localStorage.setItem(key, JSON.stringify(this.cart));
    }
  }
}
</script>

<template>
  <div class="cart-page">

    <h1 class="cart-title">Your Cart</h1>

    <div v-if="cart.length > 0" class="cart-header">
      <button class="select-all-btn" @click="toggleSelectAll">
        {{ isAllSelected ? "Unselect All" : "Select All" }}
      </button>
    </div>
    <div v-if="cart.length === 0" class="empty-cart">
      Your cart is empty
    </div>

    <div v-else>
      <div class="cart-list">

        <div
          class="cart-item"
          v-for="item in cart"
          :key="item.uniqueId"
        >
          <div
            class="check-box"
            :class="{ active: selected.includes(item.uniqueId) }"
            @click="toggleSelect(item)"
          >
            <span v-if="selected.includes(item.uniqueId)">✔</span>
          </div>

          <img
            :src="getImg(item.image)"
            class="cart-img clickable"
            @click="goToProduct(item)"
          />

          <div class="cart-info">

            <h3 class="clickable" @click="goToProduct(item)">
              {{ item.title }}
            </h3>

            <p class="price">RM {{ item.price }}</p>

            <div class="qty-box">
              <button class="qty-btn minus" @click="decreaseQty(item)">−</button>
              <span class="qty-number">{{ item.qty }}</span>
              <button class="qty-btn plus" @click="increaseQty(item)">+</button>
            </div>

          </div>

          <button class="remove-btn" @click="removeItem(item)">
            ✕
          </button>

        </div>

      </div>

      <div class="cart-summary">
        <h2>Total: RM {{ totalPrice.toFixed(2) }}</h2>

        <div class="cart-actions">

          <button class="clear-btn" @click="clearCart">
            Clear Cart
          </button>

          <button 
            class="checkout-btn" 
            @click="checkout"
            :disabled="!cart.length"
          >
            Checkout
          </button>

        </div>
      </div>

    </div>

    <div v-if="showClearModal" class="modal-overlay">
      <div class="modal-box">

        <h3>Clear Cart?</h3>
        <p>This will remove all items permanently.</p>

        <div class="modal-actions">
          <button class="cancel-btn" @click="cancelClearCart">
            Cancel
          </button>

          <button class="delete-btn" @click="confirmClearCart">
            Yes, Clear
          </button>
        </div>

      </div>
    </div>

    <div v-if="toast.show" class="toast-popup">
      {{ toast.message }}
    </div>
  </div>
</template>

<style>

.cart-page {
  min-height: 55vh;
}

.toast-popup {
  text-align: center;
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

</style>
