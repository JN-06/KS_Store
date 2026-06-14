<script>
import axios from "axios"
const API = "https://ks-store.onrender.com/api"
export default {
  data() {
    return {
      user: {
        name: "",
        email: "",
        address: "",
        gender: "",
        bio: "",
        phone: "",
        profile: ""
      },
      editMode: false,
      loading: false,
      saveSuccess: false,
      previewImage: null,
      newImageFile: null,
      errorMsg: "",
      activeTab: "profile",
      orders: [],
      ordersLoading: false,
      ordersError: null,
      selectedStatus: "all",
      expandedOrder: null
    }
  },

  computed: {
    initials() {
      if (!this.user.name) return "?"
      return this.user.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    },

    avatarSrc() {
      return this.previewImage || this.user.profile || null
    },

    filteredOrders() {
      if (this.selectedStatus === "all") return this.orders

      return this.orders.filter(o =>
        (o.paymentStatus || "").toLowerCase() === this.selectedStatus
      )
    }
  },

  mounted() {
    this.fetchUser()
    this.fetchOrders()
  },

  methods: {
    async fetchUser() {
  try {
    const token = localStorage.getItem("token")

    const res = await fetch("https://ks-store.onrender.com/api/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const contentType = res.headers.get("content-type") || ""

    if (!contentType.includes("application/json")) {
      const text = await res.text()
      throw new Error("Server did not return JSON: " + text.slice(0, 100))
    }

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || "Failed to load profile")
    }

    this.user = {
      name: data.name || "",
      email: data.email || "",
      address: data.address || "",
      gender: data.gender || "",
      bio: data.bio || "",
      phone: data.phone || "",
      profile: data.profile || ""
    }

  } catch (err) {
    this.errorMsg = err.message || "Failed to load profile"
    console.log(err)
  }
},

    toggleEdit() {
      this.editMode = !this.editMode
      this.previewImage = null
      this.newImageFile = null
      this.errorMsg = ""
    },

    cancelEdit() {
      this.editMode = false
      this.previewImage = null
      this.newImageFile = null
      this.errorMsg = ""
      this.fetchUser()
    },

    onFileChange(e) {
      const file = e.target.files[0]
      if (!file) return
      this.newImageFile = file
      this.previewImage = URL.createObjectURL(file)
    },

    async saveProfile() {
      try {
        this.loading = true
        this.errorMsg = ""
        const token = localStorage.getItem("token")
        let profileUrl = this.user.profile

        if (this.newImageFile) {
          const formData = new FormData()
          formData.append("profile", this.newImageFile)
          const uploadRes = await fetch("https://ks-store.onrender.com/api/users/upload-profile", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          })
          const uploadData = await uploadRes.json()
          if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed")
          profileUrl = uploadData.url
        }

        const res = await fetch("https://ks-store.onrender.com/api/users/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...this.user, profile: profileUrl })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Save failed")

        this.editMode = false
        this.previewImage = null
        this.newImageFile = null
        this.saveSuccess = true
        setTimeout(() => (this.saveSuccess = false), 3000)
        await this.fetchUser()
      } catch (err) {
        this.errorMsg = err.message || "Save failed"
      } finally {
        this.loading = false
      }
    },
    async fetchOrders() {
      try {
        this.ordersLoading = true
        this.ordersError = null

        const token = localStorage.getItem("token")
        const res = await axios.get("https://ks-store.onrender.com/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` }
        })

        this.orders = res.data
      } catch (err) {
        console.log(err)
        this.ordersError = "Failed to load orders"
      } finally {
        this.ordersLoading = false
      }
    },
    toggleOrder(id) {
      this.expandedOrder = this.expandedOrder === id ? null : id
    }
  }
}
</script>

<template>
  <div class="ap-root">
    <aside class="ap-sidebar">
      <div class="ap-avatar-wrap">
        <div class="ap-avatar" :class="{ 'ap-avatar--has-img': avatarSrc }">
          <img v-if="avatarSrc" :src="avatarSrc" class="ap-avatar__img" alt="Profile photo" />
          <span v-else class="ap-avatar__initials">{{ initials }}</span>
        </div>
        <label v-if="editMode" class="ap-avatar-change" title="Change photo">
          <input type="file" accept="image/*" hidden @change="onFileChange" />
          <svg class="ap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </label>
      </div>

      <div class="ap-sidebar__name">{{ user.name || "—" }}</div>
      <div class="ap-sidebar__email">{{ user.email || "—" }}</div>
      <div class="ap-stats">
        <div class="ap-stat">
          <span class="ap-stat__value">{{ user.gender || "—" }}</span>
          <span class="ap-stat__label">Gender</span>
        </div>
        <div class="ap-stat-divider"></div>
        <div class="ap-stat">
          <span class="ap-stat__value">Active</span>
          <span class="ap-stat__label">Status</span>
        </div>
      </div>
      <nav class="ap-nav">
        <button
          class="ap-nav__item"
          :class="{ 'ap-nav__item--active': activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          Profile
        </button>

        <button
          class="ap-nav__item"
          :class="{ 'ap-nav__item--active': activeTab === 'orders' }"
          @click="activeTab = 'orders'"
        >
          Purchase History
        </button>
      </nav>
    </aside>

    <main class="ap-main">

      <transition name="ap-toast">
        <div v-if="saveSuccess" class="ap-toast ap-toast--success">
          <svg class="ap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Profile saved successfully!
        </div>
      </transition>
      <transition name="ap-toast">
        <div v-if="errorMsg" class="ap-toast ap-toast--error">
          <svg class="ap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errorMsg }}
        </div>
      </transition>
      <section v-if="activeTab === 'profile'" class="ap-section">

        <div class="ap-section__header">
          <div class="ap-page-header__left">
            <div class="ap-page-header__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h1 class="ap-section__title">Profile Information</h1>
              <p class="ap-section__subtitle">
                Update your personal details and public profile.
              </p>
            </div>
          </div>
          <div class="ap-section__actions">
            <button v-if="!editMode" class="ap-btn ap-btn--primary" @click="toggleEdit">
              <svg class="ap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </button>
            <template v-else>
              <button class="ap-btn ap-btn--ghost" @click="cancelEdit">Cancel</button>
              <button class="ap-btn ap-btn--primary" :disabled="loading" @click="saveProfile">
                <svg v-if="loading" class="ap-icon ap-icon--spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                {{ loading ? "Saving…" : "Save Changes" }}
              </button>
            </template>
          </div>
        </div>

        <div class="ap-fields">

          <div class="ap-field ap-field--full">
            <label class="ap-label">Full Name</label>
            <div class="ap-input-wrap">
              <svg class="ap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                class="ap-input"
                v-model="user.name"
                :disabled="!editMode"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div class="ap-field ap-field--full">
            <label class="ap-label">Email Address </label>
            <div class="ap-input-wrap">
              <svg class="ap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input class="ap-input ap-input--locked" v-model="user.email" disabled placeholder="email@example.com" />
            </div>
            <p class="ap-hint">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div class="ap-field">
            <label class="ap-label">Phone Number</label>
            <div class="ap-input-wrap">
              <svg class="ap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <input
                class="ap-input"
                v-model="user.phone"
                :disabled="!editMode"
                placeholder="+60 12-345 6789"
              />
            </div>
          </div>

          <div class="ap-field">
            <label class="ap-label">Gender</label>
            <div class="ap-input-wrap">
              <svg class="ap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              </svg>
              <select class="ap-input ap-select" v-model="user.gender" :disabled="!editMode">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div class="ap-field ap-field--full">
            <label class="ap-label">Address</label>
            <div class="ap-input-wrap">
              <svg class="ap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input class="ap-input" v-model="user.address" :disabled="!editMode" placeholder="123 Main St, City, Country" />
            </div>
          </div>

          <div class="ap-field ap-field--full">
            <label class="ap-label">Bio <span class="ap-optional">Optional</span></label>
            <textarea
              class="ap-textarea"
              v-model="user.bio"
              :disabled="!editMode"
              placeholder="Tell us a little about yourself…"
              rows="3"
            ></textarea>
          </div>

        </div>
      </section>

      <section v-if="activeTab === 'orders'" class="ph-page">

        <div class="ph-page-header">
          <div class="ph-page-header__left">
            <div class="ph-page-header__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>

            <div>
              <h2 class="ph-page-header__title">Purchase History</h2>
              <p class="ph-page-header__subtitle">All your past orders in one place</p>
            </div>
          </div>

          <div class="ph-page-header__badge" v-if="!ordersLoading && !ordersError">
            {{ orders.length }} orders
          </div>
        </div>

        <div class="ph-filter-bar">
          <button
            class="ph-filter-btn"
            :class="{ active: selectedStatus === 'all' }"
            @click="selectedStatus = 'all'"
          >
            All
          </button>

          <button
            class="ph-filter-btn"
            :class="{ active: selectedStatus === 'pending' }"
            @click="selectedStatus = 'pending'"
          >
            Pending
          </button>

          <button
            class="ph-filter-btn"
            :class="{ active: selectedStatus === 'processing' }"
            @click="selectedStatus = 'processing'"
          >
            Paid
          </button>

          <button
            class="ph-filter-btn"
            :class="{ active: selectedStatus === 'complete' }"
            @click="selectedStatus = 'complete'"
          >
            Completed
          </button>

          <button
            class="ph-filter-btn"
            :class="{ active: selectedStatus === 'cancelled' }"
            @click="selectedStatus = 'cancelled'"
          >
            Cancelled
          </button>
        </div>

        <div v-if="ordersLoading" class="ph-loading">
          <div class="ph-spinner"></div>
          Loading your orders...
        </div>

        <div v-else-if="ordersError" class="ph-error">
          {{ ordersError }}
        </div>

        <div v-else-if="orders.length === 0" class="ph-empty">
          No orders yet
        </div>

        <div v-else class="ph-orders">

          <div
            v-for="order in filteredOrders"
            :key="order._id"
            class="ph-order"
            :class="{ 'ph-order--open': expandedOrder === order._id }"
          >

            <div class="ph-order__header" @click="toggleOrder(order._id)">

              <div>
                <span class="ph-label">Order ID</span>
                <span class="ph-order__id">#{{ order._id.slice(-8).toUpperCase() }}</span>
              </div>

              <div>
                <span class="ph-label">Date</span>
                <span class="ph-order__value">
                  {{ new Date(order.createdAt).toLocaleDateString() }}
                </span>
              </div>

              <div>
                <span class="ph-label">Items</span>
                <span class="ph-order__value">{{ order.items.length }}</span>
              </div>

              <div>
                <span class="ph-label">Total</span>
                <span class="ph-order__total-val">RM {{ order.total.toFixed(2) }}</span>
              </div>

              <div class="ph-order__chevron"
                :class="{ 'ph-order__chevron--open': expandedOrder === order._id }"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

            </div>

            <transition name="ph-slide">
              <div v-if="expandedOrder === order._id" class="ph-order__body">

                <div class="ph-items-table">

                  <div class="ph-items-head">
                    <span>Product</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span>Subtotal</span>
                  </div>

                  <div
                    v-for="(item, i) in order.items"
                    :key="i"
                    class="ph-item-row"
                  >
                    <div class="ph-item-row__name">
                      {{ item.title }}
                    </div>

                    <span class="ph-col-center">{{ item.qty }}</span>

                    <span class="ph-col-right">RM {{ Number(item.price).toFixed(2) }}</span>

                    <span class="ph-col-right">
                      RM {{ (item.qty * item.price).toFixed(2) }}
                    </span>
                  </div>

                </div>

                <div v-if="order.cancelReason" class="ph-admin-comment">
                  <div class="ph-admin-comment__label">
                    Reason
                  </div>
                  <div class="ph-admin-comment__box">
                    {{ order.cancelReason }}
                  </div>
                </div>

                <div class="ph-order__footer">
                  <div class="ph-order__footer-time">
                    {{ new Date(order.createdAt).toLocaleString() }}
                  </div>

                  <div class="ph-order__grand-total">
                    <span class="ph-order__grand-label">Grand Total</span>
                    <span class="ph-order__grand-amt">
                      RM {{ order.total.toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
.ap-root {
  display: flex;
  background: #f8f9fa;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  color: #2f3542;
}

.ap-sidebar {
  width: 260px;
  background: #7c1118;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.5rem 2rem;
  min-height: 60vh;
}

.ap-avatar-wrap {
  position: relative;
  margin-bottom: 1.25rem;
}

.ap-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #ff6b81;
  border: 3px solid rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ap-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ap-avatar__initials {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.05em;
}

.ap-avatar-change {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: #2f3542;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #1a1a18;
  transition: background 0.15s;
}
.ap-avatar-change:hover { background: #1e272e; }
.ap-avatar-change .ap-icon { width: 13px; height: 13px; color: #fff; }

.ap-sidebar__name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-align: center;
  margin-bottom: 0.25rem;
}

.ap-sidebar__email {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.75);
  text-align: center;
  margin-bottom: 1.75rem;
  word-break: break-all;
}

.ap-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255,255,255,0.12);
  border-radius: 12px;
  width: 80%;
  margin-bottom: 2rem;
}

.ap-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.ap-stat__value {
  font-size: 0.88rem;
  font-weight: 600;
  color: #fff;
  text-transform: capitalize;
}

.ap-stat__label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ap-stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.2);
}

.ap-nav {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 2px;
}

.ap-nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.75);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.12s, color 0.12s;
}
.ap-nav__item:hover { background: rgba(255,255,255,0.12); color: #fff; }
.ap-nav__item--active { background: #fff; color: #ff4757; }
.ap-nav__item .ap-icon { width: 16px; height: 16px; flex-shrink: 0; }

.ap-main {
  flex: 1;
  padding: 2.5rem 3rem;
  max-width: auto;
  position: relative;
}

.ap-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}
.ap-toast .ap-icon { width: 16px; height: 16px; flex-shrink: 0; }
.ap-toast--success { background: #ffe5ea; color: #ff4757; }
.ap-toast--error { background: #fff0f0; color: #d63031; }

.ap-toast-enter-active, .ap-toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.ap-toast-enter-from, .ap-toast-leave-to { opacity: 0; transform: translateY(-8px); }

.ap-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #ffd6dc;
}

.ap-section__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.ap-section__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #2f3542;
}

.ap-section__subtitle {
  font-size: 0.85rem;
  color: #747d8c;
  margin: 0;
}

.ap-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.ap-field { display: flex; flex-direction: column; gap: 6px; }
.ap-field--full { grid-column: 1 / -1; }

.ap-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #d4313e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
}



.ap-optional {
  color: #b4b2a9;
  font-size: 0.7rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.ap-hint {
  font-size: 0.75rem;
  color: #b4b2a9;
  margin: 0;
}

.ap-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ap-input-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: #ff6b81;
  pointer-events: none;
}

.ap-input {
  width: 100%;
  padding: 0.65rem 0.875rem 0.65rem 2.375rem;
  border: 1.5px solid #ffd6dc;
  border-radius: 10px;
  background: #fff;
  font-size: 0.9rem;
  color: #2f3542;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  -webkit-appearance: none;
}

.ap-input:focus { border-color: #ff6b81; box-shadow: 0 0 0 3px rgba(255,107,129,0.15); }
.ap-input:disabled { background: #f4f3ef; color: #888782; cursor: not-allowed; border-color: #e8e7e2; }
.ap-input--locked:disabled { color: #b4b2a9; }

.ap-select { cursor: pointer; padding-right: 2rem; }

.ap-textarea {
  width: 100%;
  padding: 0.65rem 0.875rem;
  border: 1.5px solid #ffd6dc;
  border-radius: 10px;
  background: #fff;
  font-size: 0.9rem;
  color: #2f3542;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  line-height: 1.6;
  box-sizing: border-box;
}
.ap-textarea:focus { border-color: #ff6b81; box-shadow: 0 0 0 3px rgba(255,107,129,0.15); }
.ap-textarea:disabled { background: #f4f3ef; color: #888782; cursor: not-allowed; border-color: #e8e7e2; }

.ap-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.55rem 1.1rem;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  white-space: nowrap;
}
.ap-btn:active { transform: scale(0.98); }
.ap-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.ap-btn .ap-icon { width: 15px; height: 15px; }

.ap-btn--primary { background: #ff6b81; color: #fff; }
.ap-btn--primary:hover:not(:disabled) { background: #ff6b81; }

.ap-btn--ghost { background: #fff; color: #ff4757; border: 1.5px solid #ffccd5; }
.ap-btn--ghost:hover { background: #fff0f3; }

.ap-btn--sm { padding: 0.4rem 0.85rem; font-size: 0.8rem; }

.ap-icon--spin {
  animation: ap-spin 0.8s linear infinite;
}
@keyframes ap-spin { to { transform: rotate(360deg); } }
.ap-page-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ap-page-header__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ff4757;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ap-page-header__icon svg {
  width: 20px;
  height: 20px;
  stroke: #fff;
}

.ph-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1.5px solid #ffd6dc;
  gap: 1rem;
}

.ph-page-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ph-page-header__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ff4757;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ph-page-header__icon svg {
  width: 20px;
  height: 20px;
  stroke: #fff;
}

.ph-page-header__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 2px;
  color: #2f3542;
}

.ph-page-header__subtitle {
  font-size: 0.82rem;
  color: #747d8c;
  margin: 0;
}

.ph-page-header__badge {
  background: #fff0f3;
  border: 1.5px solid #ffd6dc;
  color: #ff4757;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 100px;
  white-space: nowrap;
}

.ph-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 3.5rem 0;
  color: #888782;
  font-size: 0.9rem;
}

.ph-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffd6dc;
  border-top-color: #ff4757;
  border-radius: 50%;
  animation: ph-spin 0.75s linear infinite;
  flex-shrink: 0;
}
@keyframes ph-spin { to { transform: rotate(360deg); } }

.ph-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.9rem 1.1rem;
  background: #fcebeb;
  color: #a32d2d;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
}
.ph-error svg { width: 16px; height: 16px; flex-shrink: 0; }

.ph-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5rem 0;
  text-align: center;
}
.ph-empty svg { width: 52px; height: 52px; color: #c8c6be; margin-bottom: 1.25rem; }

.ph-orders {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ph-order {
  background: #fff;
  border: 1.5px solid #ffe1e5;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ph-order--open {
  border-color: #ff6b81;
  box-shadow: 0 4px 14px rgba(255,71,87,0.12);
}

.ph-order__header {
  display: grid;
  grid-template-columns: 2fr 1.3fr 1fr 1.2fr 28px;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.3rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.12s;
}
.ph-order__header:hover { background: #fff5f6; }

.ph-label {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #ff6b81;
  margin-bottom: 4px;
}

.ph-order__id {
  font-size: 0.88rem;
  font-weight: 700;
  color: #2f3542;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.ph-order__value {
  font-size: 0.875rem;
  color: #57606f;
}

.ph-order__total-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2f3542;
}

.ph-order__chevron svg {
  width: 16px;
  height: 16px;
  color: #b4b2a9;
  transition: transform 0.22s;
  display: block;
}
.ph-order__chevron--open svg { transform: rotate(180deg); }

.ph-order__body {
  border-top: 1px solid #ffe1e5;
  background: #fffafb;
}

.ph-items-table {
  padding: 1rem 1.3rem 0;
}

.ph-items-head {
  display: grid;
  grid-template-columns: 1fr 80px 110px 110px;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #ff6b81;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #ffe1e5;
}

.ph-item-row {
  display: grid;
  grid-template-columns: 1fr 80px 110px 110px;
  gap: 0.5rem;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px solid #fff0f3;
  font-size: 0.875rem;
  color: #4a4a47;
}
.ph-item-row:last-child { border-bottom: none; }

.ph-item-row__name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #2f3542;
}

.ph-item-row__qty { color: #888782; font-variant-numeric: tabular-nums; }
.ph-item-row__price { color: #888782; font-variant-numeric: tabular-nums; }
.ph-item-row__sub { font-weight: 600; color: #1a1a18; font-variant-numeric: tabular-nums; }

.ph-col-center { text-align: center; }
.ph-col-right  { text-align: right; }

.ph-order__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.3rem;
  border-top: 1px solid #ffe1e5;
  gap: 1rem;
  flex-wrap: wrap;
}

.ph-order__footer-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #b4b2a9;
}
.ph-order__footer-time svg { width: 13px; height: 13px; flex-shrink: 0; }

.ph-order__grand-total {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ph-order__grand-label {
  font-size: 0.82rem;
  color: #888782;
}

.ph-order__grand-amt {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: #ff4757;
  padding: 5px 14px;
  border-radius: 8px;
}

.ph-slide-enter-active,
.ph-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.ph-slide-enter-from,
.ph-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}


@media (max-width: 900px) {

  .ap-root {
    flex-direction: column;
  }

  .ap-sidebar {
    width: auto;
    min-height: auto;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
  }

  .ap-sidebar__name,
  .ap-sidebar__email {
    text-align: center;
  }

  .ap-main {
    padding: 1.2rem;
  }

  .ap-fields {
    grid-template-columns: 1fr;
  }

  .ap-field--full {
    grid-column: auto;
  }
  
  .ph-page {
    padding: 1rem 0;
  }

  .ph-order__header {
    gap: 0.9rem;
    padding: 1rem;
  }

  .ph-order__chevron {
    justify-self: end;
  }

  .ph-items-head {
    display: none;
  }

  .ph-item-row {
    gap: 0.35rem;
    padding: 0.9rem 0;
  }

  .ph-col-center,
  .ph-col-right {
    text-align: left;
  }

  .ph-item-row__name {
    font-weight: 700;
  }

  .ph-order__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .ph-order__grand-total {
    width: 100%;
    justify-content: space-between;
  }
}


.ph-filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 1rem 0 1.5rem;
}

.ph-filter-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid #ffd6dc;
  background: #fff;
  color: #ff4757;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ph-filter-btn:hover {
  background: #fff0f3;
  border-color: #ff6b81;
}

.ph-filter-btn.active {
  background: #ff4757;
  color: #fff;
  border-color: #ff4757;
}

.ph-admin-comment {
  margin: 1rem 1.3rem;
  padding: 0.9rem 1rem;
  border-left: 4px solid #ff4757;
  background: #fff0f3;
  border-radius: 10px;
}

.ph-admin-comment__label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #ff4757;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.ph-admin-comment__box {
  font-size: 0.9rem;
  color: #2f3542;
  line-height: 1.4;
  white-space: pre-wrap;
}
</style>