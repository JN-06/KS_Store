<script>
export default {
  data() {
    return {
      wishlist: [],
      showClearModal: false,
      toast: {
        show: false,
        message: ""
      }
    }
  },

  mounted() {
    this.loadWishlist()
  },

  methods: {
    getUserId() {
      return localStorage.getItem("userId");
    },

    getCartKey() {
      return `cart_${this.getUserId()}`;
    },

    getWishlistKey() {
      return `wishlist_${this.getUserId()}`;
    },

    getImg(src) {
      if (!src) return ""

      if (src.startsWith("http")) return src
      if (src.startsWith("data:")) return src
      if (src.startsWith("blob:")) return src

      if (!src.startsWith("/")) src = "/" + src

      return `http://localhost:5000${src}`
    },

    loadWishlist() {
      const key = `wishlist_${localStorage.getItem("userId")}`;

      const raw = JSON.parse(localStorage.getItem(key) || "[]");

      this.wishlist = raw
        .filter(i => i.productId)
        .map(i => ({
          productId: String(i.productId),
          uniqueId: String(i.productId),

          title: i.title,
          image: i.image,
          price: Number(i.price)
        }));
    },

    saveWishlist() {
      const key = `wishlist_${localStorage.getItem("userId")}`;
      localStorage.setItem(key, JSON.stringify(this.wishlist));
    },

    removeItem(item) {
      const uid = item.uniqueId

      this.wishlist = this.wishlist.filter(i => i.uniqueId !== uid)

      this.saveWishlist()
    },

    clearWishlist() {
      this.showClearModal = true
    },

    confirmClearWishlist() {
      this.wishlist = []

      this.saveWishlist()

      this.showClearModal = false
    },

    cancelClearWishlist() {
      this.showClearModal = false
    },

    goToProduct(item) {
      const id = item.productId

      if (!id) {
        alert("Invalid product ID")
        return
      }

      this.$router.push(`/product/${id}`)
    },

    moveToCart(item) {

      const userId = this.getUserId();
      const CART_KEY = `cart_${userId}`;
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const exists = cart.find(
        i => i.productId === item.productId
      );

      if (!exists) {
        cart.push({
          productId: item.productId,
          title: item.title,
          image: item.image,
          price: item.price,
          qty: 1,
          variant: "default",
          maxStock: 999
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      this.removeItem(item);

      this.showToast("Added to cart successfully!")
    },
    showToast(message) {
      this.toast.message = message
      this.toast.show = true

      setTimeout(() => {
        this.toast.show = false
      }, 2000)
    }

  }
}
</script>

<template>
  <div v-if="toast.show" class="toast-popup">
    {{ toast.message }}
  </div>
  <div class="wishlist-page">

    <h1 class="wishlist-title">Your Wishlist</h1>

    <div v-if="wishlist.length === 0" class="empty-wishlist">
      Your wishlist is empty
    </div>

    <div v-else>

      <div class="wishlist-list">

        <div
          class="wishlist-item"
          v-for="item in wishlist"
          :key="item.uniqueId"
        >

          <img
            :src="getImg(item.image)"
            class="wishlist-img clickable"
            @click="goToProduct(item)"
          />

          <div class="wishlist-info">

            <h3 class="clickable" @click="goToProduct(item)">
              {{ item.title }}
            </h3>

            <p class="price">RM {{ item.price }}</p>

          </div>

          <div class="actions">
            <button class="cart-btn" @click="moveToCart(item)">
              Add to Cart
            </button>

            <button class="remove-btn" @click="removeItem(item)">
              ✕
            </button>
          </div>

        </div>

      </div>

      <div class="wishlist-summary">
        <button class="clear-btn" @click="clearWishlist">
          Clear Wishlist
        </button>
      </div>

    </div>

    <div v-if="showClearModal" class="modal-overlay">
      <div class="modal-box">

        <h3>Clear Wishlist?</h3>
        <p>This will remove all items permanently.</p>

        <div class="modal-actions">

          <button class="cancel-btn" @click="cancelClearWishlist">
            Cancel
          </button>

          <button class="delete-btn" @click="confirmClearWishlist">
            Yes, Clear
          </button>

        </div>

      </div>
    </div>

  </div>
</template>

<style>
.wishlist-page {
  min-height: 55vh;
  padding: 40px;
  max-width: 1000px;
  margin: auto;
}

.wishlist-title {
  text-align: center;
  margin-bottom: 30px;
}

.empty-wishlist {
  text-align: center;
  font-size: 18px;
  color: #888;
}

.wishlist-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.wishlist-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wishlist-item {
  display: flex;
  align-items: center;
  gap: 20px;

  background: white;
  padding: 15px;
  border-radius: 12px;

  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  position: relative;
}

.wishlist-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
}

.wishlist-info {
  flex: 1;
}

.wishlist-info h3 {
  margin: 0;
  font-size: 16px;
}

.price {
  color: #ff6b81;
  font-weight: bold;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-btn {
  padding: 8px 14px;
  background: white;
  border: 2px solid #ff6b81;
  color: #ff6b81;

  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}

.cart-btn:hover {
  background: #ff6b81;
  color: white;
}

.remove-btn {
  padding: 8px 14px;
  border: none;
  background: #ff6b81;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.remove-btn:hover {
  background: #ffccd3;
  color: white;
}

.wishlist-summary {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.clear-btn {
  padding: 10px 15px;
  border: none;
  background: #ccc;
  cursor: pointer;
  border-radius: 6px;
}

.clear-btn:hover {
  background: #aaa;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999;
}

.modal-box {
  width: 320px;
  background: white;
  padding: 20px;
  border-radius: 14px;
  text-align: center;

  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.cancel-btn {
  padding: 8px 14px;
  border: none;
  background: #eee;
  border-radius: 8px;
  cursor: pointer;
}

.delete-btn {
  padding: 8px 14px;
  border: none;
  background: #ff6b81;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .wishlist-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    flex-direction: row;
  }
}

@media (max-width: 900px) {

  .wishlist-page {
    padding: 20px;
  }

  .wishlist-item {
    flex-direction: column;
    align-items: center;
    text-align: center;

    padding: 20px;
    border-radius: 18px;

    gap: 15px;
  }

  .wishlist-img {
    width: 160px;
    height: 160px;
    object-fit: cover;

    border-radius: 14px;
  }

  .wishlist-info {
    width: 100%;
  }

  .wishlist-info h3 {
    font-size: 18px;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .price {
    font-size: 20px;
    margin: 0;
  }

  .actions {
    width: 100%;

    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .cart-btn,
  .remove-btn {
    flex: 1;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 15px;
    font-weight: 600;

    border-radius: 12px;
  }

  .wishlist-summary {
    justify-content: center;
    margin-top: 25px;
  }

  .clear-btn {
    width: 100%;
    max-width: 350px;

    height: 50px;

    border-radius: 12px;
    font-weight: 600;
  }

}
</style>