import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Collections from '../pages/Collections.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import Cart from '../pages/Cart.vue'
import Checkout from '../pages/Checkout.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import Account from '../pages/Account.vue'
import Wishlist from '../pages/Wishlist.vue'
import AdminOrders from '../pages/AdminOrders.vue'
import AdminProduct from '../pages/AdminProduct.vue'
import AdminUser from '../pages/AdminUser.vue'
import AdminNews from '../pages/AdminNews.vue'
import Category from '../pages/Category.vue'
import ComingSoon from '../pages/ComingSoon.vue'
import NewArrivals from '../pages/NewArrivals.vue'
import About from '../pages/Aboutus.vue'
import Store from '../pages/Store.vue'
import Receipt from "../pages/Receipt.vue";
import FAQ from '../pages/FAQs.vue'
import Terms from '../pages/Terms.vue'
import Privacy from '../pages/Privacy.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/collections', redirect: '/collections/all' },
  { path: '/collections/:ip', component: Collections },
  { path: '/product/:id', component: ProductDetail },
  { path: '/category/:category', component: Category },
  { path: '/coming-soon', component: ComingSoon },
  { path: '/new-arrivals', component: NewArrivals },
  { path: '/about-popmart', component: About },
  { path: '/stores-map', component: Store },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/admin', component: AdminDashboard },
  { path: '/admin/orders', component: AdminOrders },
  { path: '/admin/products', component: AdminProduct },
  { path: '/admin/users', component: AdminUser },
  { path: '/admin/news', component: AdminNews },
  { path: '/account', component: Account },
  { path: '/wishlist', component: Wishlist },
  { path: '/receipt', component: Receipt },
  { path: '/faq', component: FAQ },
  { path: '/terms', component: Terms },
  { path: '/privacy', component: Privacy }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role")
  const token = localStorage.getItem("token")
  if (to.path.startsWith("/admin")) {
    if (role !== "admin") {
      alert("Access denied ❌ Admin only")
      return next("/")
    }
  }

  const protectedPages = ["/account", "/purchase-history", "/cart", "/wishlist"]

  if (protectedPages.includes(to.path)) {
    if (!token) {
      alert("Please login first 🔐")
      return next("/login")
    }
  }

  if ((to.path === "/login" || to.path === "/register") && token) {
    return next("/")
  }

  next()
})

export default router