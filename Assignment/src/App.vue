<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

export default {
  components: { Navbar, Footer }
}
</script>

<template>
  <div>
    <Navbar />

    <div class="container-fluid">
      <router-view />
    </div>

    <Footer />
  </div>
</template>