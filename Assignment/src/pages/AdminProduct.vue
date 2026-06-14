<script>
import API from "@/services/api";

export default {
  data() {
    return {
      products: [],
      addingProduct: false,
      editingProduct: null,
      pageMode: "list",
      loading:false,
      status: "draft",
      showToast: false,
      toastMessage: "",
      showDeleteModal: false,
      productToDelete: null,
      formProduct: {
        title: "",
        description: "",
        category: "",
        status: "",
        images: [],
        detailsImages: [],
        variants: [],
        visibleIn: {
          ip: [],
          category: [],
          activity: ""
        }
      },
      ipOptions: ["twinkle", "labubu", "molly", "dimoo", "hacipupu", "hirono", "spongebob", "sweetbean", "crybaby", "skullpanda"],
      categoryOptions: ["blind_boxes", "plush_toys", "accessories"],
      activityOptions: ["available", "new_arrivals", "coming_soon"],
      dragIndex: null,
      dragType: "",
      searchQuery: "",
    selectedIp: "all"
    };
  },
  computed: {
    filteredProducts() {
      let result = [...this.products];

      if (this.searchQuery.trim()) {
        result = result.filter(p =>
          p.title.toLowerCase().includes(
            this.searchQuery.toLowerCase()
          )
        );
      }

      if (this.selectedIp !== "all") {
        result = result.filter(p =>
          p.visibleIn?.ip?.includes(this.selectedIp)
        );
      }

      return result;
    }
  },

  mounted() {
    this.fetchProducts();
    window.addEventListener("keydown", this.handleEsc);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleEsc);
  },

  methods: {

    getImg(img) {
      if (!img) return "";

      if (typeof img === "string" && img.startsWith("http")) return img;

      if (typeof img === "string" && !img.startsWith("/")) {
        img = "/" + img;
      }

      return `https://ks-store.onrender.com${img}`;
    },

    getDisplayImg(img) {
      if (!img) return "";

      if (img?.file && img?.url) {
        return img.url;
      }

      return this.getImg(img?.url || img);
    },

    getVariantImg(img) {
      if (!img) return "";

      if (typeof img === "string" && img.startsWith("data:image")) {
        return img;
      }

      return this.getImg(img);
    },

    async fetchProducts() {
      try {
        this.loading = true;

        const res = await API.get("/products");

        this.products =
          res?.data?.products ||
          res?.data ||
          [];

      } catch (err) {
        console.error("Fetch products error:", err);
        this.products = [];

      } finally {
        this.loading = false;
      }
    },

    handleEsc(e) {
      if (e.key === "Escape" && this.showDeleteModal) {
        this.cancelDelete();
      }
    },

        startAdd() {
      this.pageMode = "create";
      this.addingProduct = true;
      this.editingProduct = null;

      this.resetForm();
      this.formProduct.status = "draft";
    },

    editProduct(p) {
      this.pageMode = "edit";
      this.addingProduct = false;
      this.editingProduct = p._id;

      this.formProduct = {
        title: p.title,
        description: (p.description || []).join("\n"),
        category: p.category,
        status: p.status,

        images: (p.images || []).map(img => ({
          url: img,
          file: null
        })),

        detailsImages: (p.detailsImages || []).map(img => ({
          url: img,
          file: null
        })),

        variants: (p.variants || []).map(v => ({
          image: v.image || "",
          title: v.title,
          price: v.price,
          stock: v.stock
        })),

        visibleIn: p.visibleIn || { ip: [], category: [], activity: "" }
      };
    },

    backToList() {
      this.pageMode = "list";
      this.addingProduct = false;
      this.editingProduct = null;
      this.resetForm();
    },

    resetForm() {
      this.formProduct = {
        title: "",
        description: "",
        category: "",
        status: "draft",
        images: [],
        detailsImages: [],
        variants: [],
        visibleIn: { ip: [], category: [], activity: "" }
      };
    },
    async deleteServerImage(url) {
      try {
        await API.post("/upload/delete", {
          url
        });
      } catch (err) {
        console.error("Delete image failed:", err);
      }
    },
    startDrag(index, type) {
      this.dragIndex = index;
      this.dragType = type;
    },

    onDrop(index, type) {
      if (this.dragIndex === null) return;

      let arr =
        type === "main"
          ? this.formProduct.images
          : this.formProduct.detailsImages;

      const moved = arr.splice(this.dragIndex, 1)[0];
      arr.splice(index, 0, moved);

      this.dragIndex = null;
      this.dragType = "";
    },

    handleImages(e, type) {
      const files = Array.from(e.target.files);

      files.forEach(file => {
        const item = {
          file,
          url: URL.createObjectURL(file)
        };

        if (type === "main") {
          this.formProduct.images.push(item);
        } else {
          this.formProduct.detailsImages.push(item);
        }
      });
    },

    removeImage(i, type) {
      const img =
        type === "main"
          ? this.formProduct.images[i]
          : this.formProduct.detailsImages[i];

      if (img && !img.file) {
        this.deleteServerImage(img.url);
      }

      if (type === "main") {
        this.formProduct.images.splice(i, 1);
      } else {
        this.formProduct.detailsImages.splice(i, 1);
      }
    },

    handleVariantImage(e, i) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = ev => {
        this.formProduct.variants[i].image = ev.target.result;
      };
      reader.readAsDataURL(file);
    },

    addVariant() {
      this.formProduct.variants.push({
        image: "",
        title: "",
        price: 0,
        stock: 0
      });
    },

    removeVariant(i) {
      this.formProduct.variants.splice(i, 1);
    },

    async saveNewProduct() {
      this.formProduct.status = "published";

      const formData = new FormData();

      formData.append("title", this.formProduct.title);
      formData.append(
        "description",
        JSON.stringify(this.formProduct.description.split("\n"))
      );
      formData.append("category", this.formProduct.category);
      formData.append(
      "status",
      this.formProduct.status || "published"
    );
      formData.append("variants", JSON.stringify(this.formProduct.variants));
      formData.append("visibleIn", JSON.stringify(this.formProduct.visibleIn));

      this.formProduct.images.forEach(img => {
        if (img.file) formData.append("images", img.file);
      });

      this.formProduct.detailsImages.forEach(img => {
        if (img.file) formData.append("detailsImages", img.file);
      });

      if (!this.validateProduct()) return;

      await API.post("/products", formData);

      this.showToastMessage("✅ Product published!");
      this.backToList();
      this.fetchProducts();
    },

    async saveEdit() {
      this.formProduct.status = "published";

      const formData = new FormData();

      formData.append("title", this.formProduct.title);
      formData.append(
        "description",
        JSON.stringify(this.formProduct.description.split("\n"))
      );
      formData.append("category", this.formProduct.category);
      formData.append(
      "status",
      this.formProduct.status || "published"
    );
      formData.append("variants", JSON.stringify(this.formProduct.variants));
      formData.append("visibleIn", JSON.stringify(this.formProduct.visibleIn));

      const existingImages = this.formProduct.images
        .filter(img => !img.file)
        .map(img => img.url);

      const existingDetailsImages = this.formProduct.detailsImages
        .filter(img => !img.file)
        .map(img => img.url);

      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append(
        "existingDetailsImages",
        JSON.stringify(existingDetailsImages)
      );

      this.formProduct.images.forEach(img => {
        if (img.file) formData.append("images", img.file);
      });

      this.formProduct.detailsImages.forEach(img => {
        if (img.file) formData.append("detailsImages", img.file);
      });

      if (!this.validateProduct()) return;

      await API.put(`/products/${this.editingProduct}`, formData);

      this.showToastMessage("✅ Product published!");
      this.backToList();
      this.fetchProducts();
    },
    validateProduct() {
      if (!this.formProduct.title || !this.formProduct.title.trim()) {
        alert("❌ Title is required");
        return false;
      }

      if (!this.formProduct.images || this.formProduct.images.length === 0) {
        alert("❌ Main image is required");
        return false;
      }

      if (!this.formProduct.variants || this.formProduct.variants.length === 0) {
        alert("❌ At least 1 variant is required");
        return false;
      }

      for (let i = 0; i < this.formProduct.variants.length; i++) {
        const v = this.formProduct.variants[i];

        if (!v.title || !v.title.trim()) {
          alert(`❌ Variant ${i + 1}: title required`);
          return false;
        }

        if (v.price === "" || v.price == null || isNaN(v.price)) {
          alert(`❌ Variant ${i + 1}: valid price required`);
          return false;
        }

        if (v.stock === "" || v.stock == null || isNaN(v.stock)) {
          alert(`❌ Variant ${i + 1}: valid stock required`);
          return false;
        }
      }

      return true;
    },
    deleteProduct(product) {
      this.productToDelete = product;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      if (!this.productToDelete) return;

      try {
        await API.delete(`/products/${this.productToDelete._id}`);

        this.showToastMessage("🗑️ Product deleted!");
        this.fetchProducts();

      } catch (err) {
        console.error(err);
        alert("❌ Failed to delete product");
      }

      this.cancelDelete();
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.productToDelete = null;
    },
    showToastMessage(msg) {
      this.toastMessage = msg;
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, 2000);
    },
    async saveDraft() {
      try {
        const formData = new FormData();

        formData.append("title", this.formProduct.title || "Untitled Draft");

        formData.append(
          "description",
          JSON.stringify(this.formProduct.description.split("\n"))
        );

        formData.append("category", this.formProduct.category || "");
        formData.append("status", "draft");

        formData.append(
          "variants",
          JSON.stringify(this.formProduct.variants || [])
        );

        formData.append(
          "visibleIn",
          JSON.stringify(this.formProduct.visibleIn)
        );

        const existingImages = this.formProduct.images
          .filter(img => !img.file)
          .map(img => img.url);

        const existingDetailsImages = this.formProduct.detailsImages
          .filter(img => !img.file)
          .map(img => img.url);

        formData.append("existingImages", JSON.stringify(existingImages));
        formData.append("existingDetailsImages", JSON.stringify(existingDetailsImages));

        this.formProduct.images.forEach(img => {
          if (img.file) formData.append("images", img.file);
        });

        this.formProduct.detailsImages.forEach(img => {
          if (img.file) formData.append("detailsImages", img.file);
        });

        if (this.editingProduct) {
          await API.put(`/products/${this.editingProduct}`, formData);
          this.showToastMessage("📝 Draft updated!");
        } else {
          await API.post("/products", formData);
          this.showToastMessage("📝 Draft saved!");
        }

        this.backToList();
        this.fetchProducts();

      } catch (err) {
        console.error(err);
        alert("❌ Failed to save draft");
      }
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
      <h2>Products</h2>
      <button class="admin-nav__btn" @click="startAdd">
        + Add Product
      </button>
    </div>

    <div v-if="showToast" class="toast-popup">
      {{ toastMessage }}
    </div>
    <div v-if="loading" class="loading">
      Loading dashboard...
    </div>

      

    <div v-else-if="pageMode === 'list'">


      <div class="product-filters">

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search product..."
          class="search-box"
        />

        <button
          class="filter-btn"
          :class="{ active: selectedIp === 'all' }"
          @click="selectedIp = 'all'"
        >
          All
        </button>

        <button
          v-for="ip in ipOptions"
          :key="ip"
          class="filter-btn"
          :class="{ active: selectedIp === ip }"
          @click="selectedIp = ip"
        >
          {{ ip }}
        </button>

      </div>

      <div class="filter-result">
        Showing {{ filteredProducts.length }} products
      </div>
      <table class="admin-table">
        <thead>
          <th>Title</th>
          <th>Action</th>
        </thead>

        <tr v-for="p in filteredProducts" :key="p._id">
          <td>
            {{ p.title }}
            <span v-if="p.status === 'draft'" class="draft-badge">
              Draft
            </span>
          </td>
          <td>
            <button @click="editProduct(p)" class="edit-btn">Edit</button>
            <button @click="deleteProduct(p)" class="delete-btn">Delete</button>
          </td>
        </tr>
      </table>

    </div>

    <div
      v-if="showDeleteModal"
      class="delete-overlay"
      @click="cancelDelete"
    >
      <div class="delete-modal" @click.stop>

        <div class="delete-icon">🗑️</div>

        <h3>Delete Product?</h3>

        <p>
          Are you sure you want to delete
          <strong>"{{ productToDelete?.title }}"</strong>?
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

    <div v-if="pageMode === 'create' || pageMode === 'edit'" class="form-box">
      

      <button @click="backToList" class="back-btn">← Back</button>

      <input v-model="formProduct.title" placeholder="Title" />

      <textarea v-model="formProduct.description" rows="5" placeholder="Description"></textarea>

      <h4>Main Images</h4>
      <div class="upload-grid">
        <div v-for="(img,i) in formProduct.images"
        :key="i"
        class="img-card"
        draggable="true"
        @dragstart="startDrag(i, 'main')"
        @dragover.prevent
        @drop="onDrop(i, 'main')">        <img :src="getDisplayImg(img)" />
          <span class="delete-img" @click="removeImage(i, 'main')">✕</span>
        </div>

        <label class="upload-card">
          +
          <input type="file" multiple @change="handleImages($event, 'main')" />
        </label>
      </div>

      <h4>Detail Images</h4>
      <div class="upload-grid">
        <div v-for="(img,i) in formProduct.detailsImages"
        :key="i"
        class="img-card"
        draggable="true"
        @dragstart="startDrag(i, 'detail')"
        @dragover.prevent
        @drop="onDrop(i, 'detail')">        <img :src="getDisplayImg(img)" />
          <span class="delete-img" @click="removeImage(i, 'detail')">✕</span>
        </div>

        <label class="upload-card">
          +
          <input type="file" multiple @change="handleImages($event, 'detail')" />
        </label>
      </div>

      <h4>Variants</h4>

      <div v-for="(v,i) in formProduct.variants" :key="i" class="variant-card">

        <div class="variant-image">
          <img v-if="v.image" :src="getVariantImg(v.image)" />
          <label class="variant-upload">
            {{ v.image ? "Change" : "+" }}
            <input type="file" @change="handleVariantImage($event, i)" />
          </label>
        </div>

        <div class="variant-info">
          <input v-model="v.title" placeholder="Variant Title" />
          <input v-model="v.price" placeholder="Price" />
          <input v-model="v.stock" placeholder="Stock" />
        </div>

        <button class="variant-delete" @click="removeVariant(i)">✕</button>
      </div>

      <button class="add-btn" @click="addVariant">+ Add Variant</button>

      <div class="option-section">
        <h4>IP Pages</h4>
        <div class="option-grid">
          <label
            v-for="ip in ipOptions"
            :key="ip"
            class="option-card"
            :class="{ active: formProduct.visibleIn.ip.includes(ip) }"
          >
            <input
              type="checkbox"
              :value="ip"
              v-model="formProduct.visibleIn.ip"
            />
            <span>{{ ip }}</span>
          </label>
        </div>
      </div>

      <div class="option-section">
        <h4>Category Pages</h4>
        <div class="option-grid">
          <label
            v-for="c in categoryOptions"
            :key="c"
            class="option-card"
            :class="{ active: formProduct.visibleIn.category.includes(c) }"
          >
            <input
              type="checkbox"
              :value="c"
              v-model="formProduct.visibleIn.category"
            />
            <span>{{ c.replace('_', ' ') }}</span>
          </label>
        </div>
      </div>

      <div class="option-section">
        <h4>Activity Pages</h4>
        <div class="option-grid">
          <label
            v-for="a in activityOptions"
            :key="a"
            class="option-card radio"
            :class="{ active: formProduct.visibleIn.activity === a }"
          >
            <input
              type="radio"
              :value="a"
              v-model="formProduct.visibleIn.activity"
            />
            <span>{{ a.replace('_', ' ') }}</span>
          </label>
        </div>
      </div>

      <div class="product-admin-submit">

        <button
          class="draft-btn"
          @click="saveDraft"
        >
          Save Draft
        </button>

        <button
          v-if="pageMode === 'create'"
          class="save-btn"
          @click="
            formProduct.status='published';
            saveNewProduct()
          "
        >
          Publish
        </button>

        <button
          v-if="pageMode === 'edit'"
          class="save-btn"
          @click="
            formProduct.status='published';
            saveEdit()
          "
        >
          Update
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.product-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.search-box {
  width: 280px;
  padding: 12px 16px;
  border: 1px solid #eee;
  border-radius: 999px;
  outline: none;
  font-size: 14px;
}

.search-box:focus {
  border-color: #ff6b81;
}

.filter-btn {
  border: none;
  background: white;
  color: #444;

  padding: 10px 18px;
  border-radius: 999px;

  cursor: pointer;
  font-weight: 600;

  border: 1px solid #eee;

  transition: 0.25s ease;
  text-transform: uppercase;
}

.filter-btn:hover {
  transform: translateY(-2px);
  border-color: #ff6b81;
}

.filter-btn.active {
  background: linear-gradient(
    135deg,
    #ff6b81,
    #ff8fa3
  );

  color: white;
  border-color: transparent;

  box-shadow: 0 8px 20px rgba(255,107,129,0.25);
}

.filter-result {
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  margin-left: 2px;
}
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

.form-box {
  background: white;
  padding: 25px;
  margin-top: 20px;
  border-radius: 12px;

  box-shadow: 0 5px 15px rgba(0,0,0,0.06);
}

.form-box input,
.form-box textarea {
  width: 98.5%;
  padding: 10px;
  margin-bottom: 12px;

  border: 1px solid #ddd;
  border-radius: 8px;

  font-size: 14px;
}

.form-box textarea {
  min-height: 100px;
  resize: vertical;
}

.form-box h4 {
  margin-top: 20px;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: bold;
}

.variant-card {
  display: flex;
  align-items: center;
  gap: 15px;

  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 12px;

  padding: 12px;
  margin-bottom: 12px;

  position: relative;
}

.variant-image {
  width: 80px;
  height: 80px;

  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ddd;

  position: relative;
  flex-shrink: 0;
}

.variant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.variant-upload {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0,0,0,0.4);
  color: white;

  font-size: 14px;
  cursor: pointer;

  opacity: 0;
}

.variant-image:hover .variant-upload {
  opacity: 1;
  border-radius:5px;
  margin:10px;
}

.variant-upload input {
  display: none;
}

.variant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 20px;
}

.variant-info input {
  width: auto;
}

.variant-delete {
  position: absolute;
  top: 0px;
  right: 0px;

  background: #ff4757;
  color: white;

  border: none;

  width: 24px;
  height: 24px;

  font-size: 14px;
  padding: 2px 6px;
  cursor: pointer;
}

.variant-delete:hover {
  background: #e84118;
}

.add-btn {
  color: #ff6b81;
  background: white;
  border: 2px solid #ff6b81;
  padding: 12px 28px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  margin: 10px 0 25px;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(255, 107, 129, 0.4);
}

input[type="file"] {
  margin-bottom: 10px;
  cursor: pointer;
}

.option-section {
  margin-top: 28px;
}

.option-section h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #111;
}

.option-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.option-card {
  position: relative;
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid #eee;
  background: white;

  cursor: pointer;
  user-select: none;

  transition: all 0.28s ease;

  font-size: 14px;
  font-weight: 600;
  color: #444;

  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
  text-transform: capitalize;
}

.option-card input {
  display: none;
}

.option-card:hover {
  transform: translateY(-3px);
  background: #ffb6c1;
  box-shadow: 0 10px 24px rgba(255,107,129,0.12);
}

.option-card.active, .option-card.radio.active {
  background: linear-gradient(
    135deg,
    #ff6b81,
    #ff8fa3
  );
  color: white;
  border-color: transparent;
  box-shadow: 0 12px 28px rgba(255,107,129,0.25);
}

.option-card::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;

  background: #ddd;

  display: inline-block;
  margin-right: 10px;

  transition: 0.3s ease;
}

.option-card.active::before {
  background: white;
  box-shadow: 0 0 10px rgba(255,255,255,0.8);
}

.upload-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.img-card { 
  width: 95px; 
  height: 95px; 
  border-radius: 10px; 
  overflow: hidden; 
  border: 1px solid #ddd; 
  position: relative;
  margin-top: 10px;
} 

.delete-img {
  position: absolute;
  top: 4px;
  right: 6px;

  background: rgba(0,0,0,0.6);
  color: white;

  font-size: 12px;
  padding: 2px 6px;

  border-radius: 50%;
  cursor: pointer;

  opacity: 0;
  transition: 0.2s;
}

.img-card:hover .delete-img {
  opacity: 1;
}

.delete-img:hover {
  background: red;
}

.img-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-card {
  width: 90px;
  height: 90px;

  border: 2px dashed #ccc;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 28px;
  color: #999;

  cursor: pointer;
  transition: 0.25s ease;
  margin-top: 10px;
}

.upload-card:hover {
  border-color: #ff6b81;
  color: #ff6b81;
  transform: scale(1.05);
}

.upload-card input {
  display: none;
}

.admin-table td button {
  margin-right: 10px;
}

.admin-table td button:last-child {
  margin-right: 0;
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

.product-admin-submit {
  display: flex;
  gap: 14px;
  margin-top: 30px;
}

.save-btn {
  background: #ff6b81;
  color: white;
  border: none;
  padding: 14px 34px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(255,107,129,0.35);
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
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  margin-left: 10px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .edit-btn, .delete-btn {

    font-size: 12px;
    width: 60px;
    
  }

  .edit-btn {
    margin-left: 15px;
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