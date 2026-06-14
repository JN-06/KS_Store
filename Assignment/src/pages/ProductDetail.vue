<script>
import API from "@/services/api";

export default {
  data() {
    return {
      product: null,
      selectedImage: "",
      selectedVariant: "",
      quantity: 1,
      showToast: false,
      toastMessage: ""
    };
  },

  async mounted() {
    const id = this.$route.params.id;

    try {
      const res = await API.get(`/products/${id}`);
      this.product = res.data;

      this.selectedImage =
        this.product?.images?.[0] || this.product?.image || "";

      this.selectedVariant = this.product?.variants?.[0]?.title || "";
    } catch (err) {
      console.error("Product load error:", err);
    }
  },

  computed: {
    selectedVariantData() {
      return (
        this.product?.variants?.find(
          v => (v.key || v.title) === this.selectedVariant
        ) || {}
      );
    },

    maxStock() {
      return this.selectedVariantData?.stock || 0;
    },

    isOutOfStock() {
      return this.maxStock <= 0;
    },

    isComingSoon() {
      return this.product?.visibleIn?.activity === "coming_soon";
    },

    detailImages() {
      return this.product?.detailsImages || [];
    }
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
      if (!src) return "";

      if (src.startsWith("http")) return src;
      if (src.startsWith("data:")) return src;
      if (src.startsWith("blob:")) return src;

      if (!src.startsWith("/")) src = "/" + src;

      return `http://localhost:5000${src}`;
    },

    selectVariant(key) {
      this.selectedVariant = key;

      const v = this.product.variants.find(
        v => (v.key || v.title) === key
      );

      if (v?.image) {
        this.selectedImage = v.image;
      }

      this.quantity = v?.stock > 0 ? 1 : 0;
    },

    increaseQty() {
      if (this.quantity < this.maxStock) this.quantity++;
    },

    decreaseQty() {
      if (this.quantity > 1) this.quantity--;
    },

    addToCart() {
      const v = this.selectedVariantData;

      const userId = localStorage.getItem("userId");
      const key = `cart_${userId}`;

      const cart = JSON.parse(localStorage.getItem(key) || "[]");

      const productId = String(this.product._id);
      const variant = this.selectedVariant;

      const existing = cart.find(
        i => i.productId === productId && i.variant === variant
      );

      if (existing) {
        existing.qty += Number(this.quantity);

        if (existing.qty > v.stock) {
          existing.qty = v.stock;
        }
      } else {
        cart.push({
          productId,
          title: this.product.title,
          image: v.image || this.selectedImage,
          variantImage: v.image || "",
          price: v.price,
          variant,
          qty: Number(this.quantity),
          maxStock: v.stock
        });
      }

      localStorage.setItem(key, JSON.stringify(cart));

      this.showToastMessage("✅ Added to cart!");
    },

    buyNow() {
      const token = localStorage.getItem("token");

      if (!token) {
        this.showToastMessage("❌ You must login first");
        return;
      }

      if (this.isComingSoon) {
        this.showToastMessage("🚧 Coming Soon");
        return;
      }

      if (this.isOutOfStock) {
        this.showToastMessage("❌ Out of stock");
        return;
      }

      const v = this.selectedVariantData;

      const item = {
        productId: String(this.product._id),
        title: this.product.title,
        image: this.getImg(v.image || this.selectedImage),
        price: v.price,
        variant: this.selectedVariant,
        qty: Number(this.quantity),
        maxStock: v.stock
      };

      localStorage.setItem("checkout", JSON.stringify([item]));

      this.$router.push("/checkout");
    },

    showToastMessage(msg) {
      this.toastMessage = msg;
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, 2000);
    },
    addToWishlist() {
      const userId = localStorage.getItem("userId");
      const key = `wishlist_${userId}`;

      const wishlist = JSON.parse(localStorage.getItem(key) || "[]");

      const productId = String(this.product._id);

      const exists = wishlist.find(
        i => i.productId === productId
      );

      if (exists) {
        this.showToastMessage("❤️ Already in wishlist");
        return;
      }

      wishlist.push({
        productId,
        title: this.product.title,
        image: this.selectedImage,
        price: this.selectedVariantData.price,
        variant: this.selectedVariant
      });

      localStorage.setItem(key, JSON.stringify(wishlist));

      this.showToastMessage("❤️ Added to wishlist!");
    }
  }
};
</script>

<template>
  <div class="product-container" v-if="product">

    <div class="row">

      <div class="col-6">

        <img :src="getImg(selectedImage)" class="main-img" />

        <div class="thumb-row">
          <img
            v-for="img in (product.images || [])"
            :key="img"
            :src="getImg(img)"
            class="thumb"
            @click="selectedImage = img"
          />
        </div>

      </div>

      <div class="col-6">

        <h2>{{ product.title }}</h2>

        <p class="price" v-if="!isComingSoon">
          RM {{ selectedVariantData.price || 0 }}
        </p>

        <p v-else class="coming-text">
          Coming Soon
        </p>

        <p v-for="(line, i) in (product.description || [])" :key="i" class="description">
          {{ line }}
        </p>

        <div class="variant-box">
          <div
            v-for="v in (product.variants || [])"
            :key="v.key || v.title"
            class="variant-item"
            :class="{
              active: selectedVariant === (v.key || v.title),
              disabled: v.stock <= 0
            }"
            @click="v.stock > 0 && selectVariant(v.key || v.title)"
          >
            <img :src="getImg(v.image)" />
            <span>{{ v.title }}</span>
          </div>
        </div>

        <div class="qty-box" v-if="!isComingSoon">
          <button class="qty-btn minus" @click="decreaseQty">−</button>
          <span class="qty-number">{{ quantity }}</span>
          <button class="qty-btn plus" @click="increaseQty">+</button>
        </div>

        <div class="btn-group">

          <button v-if="isComingSoon" class="coming-soon-btn" disabled>
            Coming Soon
          </button>

          <button v-else-if="isOutOfStock" class="out-stock-btn" disabled>
            Out of Stock
          </button>

          <template v-else>
            <button class="cart-btn" @click="addToCart">
              Add to Cart
            </button>

            <button class="buy-btn" @click="buyNow">
              Buy Now
            </button>

            <button class="wishlist-btn" @click="addToWishlist">
              <span class="heart">❤</span>
              Wishlist
            </button>
          </template>

          

        </div>

      </div>
    </div>

    <div class="detail-section" v-if="detailImages.length">

      <h3 class="title">Product Details</h3>

      <div class="detail-gallery">
        <img
          v-for="(img, i) in detailImages"
          :key="i"
          :src="getImg(img)"
          class="detail-img"
        />
      </div>

    </div>

    <div v-if="showToast" class="toast-popup">
      {{ toastMessage }}
    </div>

  </div>

  <div v-else>
    <h3>Product not found</h3>
  </div>
</template>

<style>
.coming-text {
  margin: 25px 0;
}

.price{
  font-size: 24px;
  font-weight: bold;
  color: #ff6b81;
  margin: 30px 0 30px;
}

.description {
  color: #555;
  line-height: 1.3;
}

.variant-box{
  margin: 40px 0 20px;
}

.buy-btn {
  background: #ff6b81;
}

.buy-btn:hover{
  background: #ff4757;
}

.wishlist-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-width: 180px;
  height: 50px;

  border: 2px solid #ff6b81;
  background: #fff;
  color: #ff6b81;

  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;

  cursor: pointer;
  transition: all 0.25s ease;
}

.cart-btn, .buy-btn{
  transition: all 0.25s ease;
}

.wishlist-btn:hover, .cart-btn:hover {
  background: #ff6b81;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(255, 107, 129, 0.25);
}

.wishlist-btn:active, .cart-btn:active, .buy-btn:active {
  transform: scale(0.97);
}

.wishlist-btn .heart {
  font-size: 18px;
  transition: transform 0.25s ease;
}

.wishlist-btn:hover .heart {
  transform: scale(1.2);
}

@media (max-width: 900px) {

  .btn-group {
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }

  .cart-btn,
  .buy-btn,
  .wishlist-btn {
    flex: 1;
    min-width: 0;
    height: 50px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 14px;
    font-weight: 600;

    border-radius: 12px;
    padding: 0 10px;
  }

  .wishlist-btn .heart {
    font-size: 16px;
  }
}
</style>