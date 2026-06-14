<script>
export default {
  data() {
    return {
      showAbout: false,
      showIP: false,
      showCategory: false,
      showUserMenu: false,
      role: null,
      token: null,
      isMenuOpen: false,
      isMobile: false
    }
  },

  computed: {
    isLoggedIn() {
      return !!this.token
    },
    isAdmin() {
      return this.role === "admin"
    }
  },

  mounted() {
    this.syncAuth()
    this.checkScreen()
    window.addEventListener("resize", this.checkScreen)
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.checkScreen)
  },

  methods: {
    checkScreen() {
      this.isMobile = window.innerWidth <= 900
    },

    syncAuth() {
      this.role = localStorage.getItem("role")
      this.token = localStorage.getItem("token")
    },

    logout() {
      localStorage.removeItem("token")
      localStorage.removeItem("role")
      this.syncAuth()
      this.$router.push("/")
      this.isMenuOpen = false
      this.showUserMenu = false
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    closeMenu() {
      this.isMenuOpen = false
      this.showUserMenu = false
    }
  },

  watch: {
    $route() {
      this.syncAuth()
      this.isMenuOpen = false
      this.showUserMenu = false
    }
  }
}
</script>

<template>
  <header class="header">
    <div class="left-group">
      <div class="hamburger" @click="toggleMenu">☰</div>

      <router-link to="/">
        <img src="/logo.png" class="logo" />
      </router-link>
    </div>

    <nav>
      <ul class="nav_links" :class="{ active: isMenuOpen }">

        <template v-if="isMobile">
          <button class="close-btn" @click="toggleMenu">✕</button>
        </template>
        <template v-if="!isMobile">
          <li class="dropdown-wrapper"
              @mouseenter="showAbout = true"
              @mouseleave="showAbout = false">
            <span>About Us</span>
            <ul v-if="showAbout" class="dropdown">
              <li><router-link to="/about-popmart">About POP MART</router-link></li>
              <li><router-link to="/stores-map">Store Locations</router-link></li>
            </ul>
          </li>
        </template>

        <template v-else>
          <li><router-link to="/about-popmart" @click="isMenuOpen=false">About POP MART</router-link></li>
          <li><router-link to="/stores-map" @click="isMenuOpen=false">Store Locations</router-link></li>
        </template>

        <template v-if="!isMobile">
          <li class="dropdown-wrapper ip-wrapper"
              @mouseenter="showIP = true"
              @mouseleave="showIP = false">

            <span class="ip">IP Characters</span>

            <ul v-if="showIP" class="dropdown">
              <li><router-link to="/collections/all" class="ip-item"><img src="/ALL_Logo.webp" /><span>All</span></router-link></li>
              <li><router-link to="/collections/molly" class="ip-item"><img src="/ip/Molly/Molly_Logo1.png" /><span>Molly</span></router-link></li>
              <li><router-link to="/collections/twinkle" class="ip-item"><img src="/ip/Twinkle/Twin_Logo1.png" /><span>Twinkle</span></router-link></li>
              <li><router-link to="/collections/labubu" class="ip-item"><img src="/ip/TheMonster/Labubu_Logo1.png" /><span>The Monster</span></router-link></li>
              <li><router-link to="/collections/dimoo" class="ip-item"><img src="/ip/Dimoo/Dimoo_Logo1.png" /><span>Dimoo</span></router-link></li>
              <li><router-link to="/collections/hacipupu" class="ip-item"><img src="/ip/Hacipupu/HP_Logo1.png" /><span>Hacipupu</span></router-link></li>
              <li><router-link to="/collections/hirono" class="ip-item"><img src="/ip/Hirono/Hirono_Logo1.png" /><span>Hirono</span></router-link></li>
              <li><router-link to="/collections/spongebob" class="ip-item"><img src="/ip/SpongeBob/Bikini_Logo1.png" /><span>SpongeBob</span></router-link></li>
              <li><router-link to="/collections/sweetbean" class="ip-item"><img src="/ip/SweetBean/SB_Logo1.png" /><span>Sweet Bean</span></router-link></li>
              <li><router-link to="/collections/crybaby" class="ip-item"><img src="/ip/Crybaby/Crybaby_Logo1.png" /><span>Crybaby</span></router-link></li>
              <li><router-link to="/collections/skullpanda" class="ip-item"><img src="/ip/Skullpanda/SP_Logo1.png" /><span>Skullpanda</span></router-link></li>
            </ul>
          </li>
        </template>

        <template v-else>
          <li><router-link to="/collections/all" @click="isMenuOpen=false">All</router-link></li>
          <li><router-link to="/collections/molly" @click="isMenuOpen=false">Molly</router-link></li>
          <li><router-link to="/collections/twinkle" @click="isMenuOpen=false">Twinkle</router-link></li>
          <li><router-link to="/collections/labubu" @click="isMenuOpen=false">Labubu</router-link></li>
          <li><router-link to="/collections/dimoo" @click="isMenuOpen=false">Dimoo</router-link></li>
          <li><router-link to="/collections/hacipupu" @click="isMenuOpen=false">Hacipupu</router-link></li>
          <li><router-link to="/collections/hirono" @click="isMenuOpen=false">Hirono</router-link></li>
          <li><router-link to="/collections/spongebob" @click="isMenuOpen=false">SpongeBob</router-link></li>
          <li><router-link to="/collections/sweetbean" @click="isMenuOpen=false">Sweet Bean</router-link></li>
          <li><router-link to="/collections/crybaby" @click="isMenuOpen=false">Crybaby</router-link></li>
          <li><router-link to="/collections/skullpanda" @click="isMenuOpen=false">Skullpanda</router-link></li>
        </template>

        <template v-if="!isMobile">
          <li class="dropdown-wrapper"
              @mouseenter="showCategory = true"
              @mouseleave="showCategory = false">
            <span>Category</span>
            <ul v-if="showCategory" class="dropdown">
              <li><router-link to="/category/plush_toys">Plush Toys</router-link></li>
              <li><router-link to="/category/accessories">Accessories</router-link></li>
              <li><router-link to="/category/blind_boxes">Blind Boxes</router-link></li>
              <li><router-link to="/coming-soon">Coming Soon</router-link></li>
              <li><router-link to="/new-arrivals">New Arrivals</router-link></li>
            </ul>
          </li>
        </template>

        <template v-else>
          <li><router-link to="/category/plush_toys" @click="isMenuOpen=false">Plush Toys</router-link></li>
          <li><router-link to="/category/accessories" @click="isMenuOpen=false">Accessories</router-link></li>
          <li><router-link to="/category/blind_boxes" @click="isMenuOpen=false">Blind Boxes</router-link></li>
          <li><router-link to="/coming-soon" @click="isMenuOpen=false">Coming Soon</router-link></li>
          <li><router-link to="/new-arrivals" @click="isMenuOpen=false">New Arrivals</router-link></li>
        </template>

      </ul>
    </nav>
    <div class="icons">
      <router-link to="/cart">
        <img src="/cart.png" class="icon-img" />
      </router-link>
      <div v-if="isLoggedIn" class="user-dropdown">

        <img src="/user.png" class="icon-img" @click="toggleUserMenu"/>

        <ul v-if="showUserMenu" class="user-menu">

          <li v-if="isAdmin">
            <router-link to="/admin" @click="showUserMenu=false">
              Dashboard
            </router-link>
          </li>

          <template v-else>
            <li>
              <router-link to="/account" @click="showUserMenu=false">
                Account
              </router-link>
            </li>
            <li>
              <router-link to="/wishlist" @click="showUserMenu=false">
                Wishlist
              </router-link>
            </li>
          </template>

          <li>
            <button class="logout-btn" @click="logout">
              Logout
            </button>
          </li>

        </ul>
      </div>
      <router-link v-else to="/login">
        <img src="/user.png" class="icon-img" />
      </router-link>

    </div>
    <div
      class="nav-overlay"
      :class="{ active: isMenuOpen }"
      @click="toggleMenu"
    ></div>
  </header>
</template>

<style>
.ip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #000;
  width: 100%;
}

.ip-item img {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 8px;
}

.ip-item:hover {
  color: #e60023;
}

.dropdown {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  display: block;
}

.icon-img:hover {
  transform: translateY(-2px);
  opacity: 0.8;
}

.ip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #000;
  width: 100%;
}

.ip-item img {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 8px;
}

.ip-item:hover {
  color: #e60023;
}

.dropdown {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-dropdown {
  position: relative;
  display: inline-block;
}

.user-menu {
  position: absolute;
  right: 0;
  top: 30px;
  background: #ffffff;
  min-width: 200px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 0px 0;
  z-index: 9999;
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.user-menu li {
  list-style: none;
  padding: 6px 10px;
}

.user-menu a,
.user-menu .logout-btn {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: none;
  color: #2d3436;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.user-menu a:hover {
  background: #f8f9fa;
  color: #000000;
}

.user-menu .logout-btn {
  color: #e60023;
  margin-top: 4px;
  background: #fafafa;
}

.user-menu .logout-btn:hover {
  background: #f5f5f5;
  color: #c0001a;
}
</style>