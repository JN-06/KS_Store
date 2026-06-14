<script>
import API from "@/services/api"
import { ipInfo, slidesData, artists } from "@/data/ipData"

export default {
  data() {
    return {
      current: 1,
      selectedIP: "labubu",
      prevIPIndex: 0,
      selectedPreview: null,

      slides: slidesData,
      ipInfo: ipInfo,
      artists: artists,

      products: [],

      isMuted: true,
      visibleSections: {},
      hoverImage: false,
      transitioning: true,
      news: [],
      loadingNews: false
    }
  },

  async mounted() {
    await this.fetchProducts()
    this.updateTimelineLine()
    window.addEventListener("resize", this.updateTimelineLine)
    this.$nextTick(() => {
    this.observeScroll()
    this.fetchNews()
  })
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateTimelineLine)
  },

  computed: {

    previewProducts() {
      return this.products
        .filter(p =>
          p.visibleIn?.ip?.includes(this.selectedIP)
        )
        .slice(0, 8)
    },

    timelineItems() {
      return this.products
        .filter(p =>
          p.status === "new" ||
          p.visibleIn?.activity === "new_arrivals"
        )
        .sort((a, b) =>
          new Date(b.createdAt || b.releaseDate) -
          new Date(a.createdAt || a.releaseDate)
        )
        .slice(0, 10)
    },

    slideDirection() {
      const keys = Object.keys(this.ipInfo)
      const newIndex = keys.indexOf(this.selectedIP)
      return this.prevIPIndex < newIndex ? "right" : "left"
    },
    loopSlides() {
      if (!this.slides.length) return []

      return [
        this.slides[this.slides.length - 1], 
        ...this.slides,
        this.slides[0]
      ]
    },
    publishedNews() {
      return this.news.filter(n => n.status === "published")
    }
  },

  methods: {

    async fetchProducts() {
      try {
        const res = await API.get("/products")
        this.products = res.data || []
      } catch (err) {
        console.error("Load products error:", err)
      }
    },

    getImg(src) {
      if (!src) return ""
      if (src.startsWith("http")) return src
      if (!src.startsWith("/")) src = "/" + src
      return `https://ks-store.onrender.com${src}`
    },

    formatDate(date) {
      if (!date) return ""

      return new Date(date).toLocaleDateString("en-MY", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      })
    },

    toggleSound() {
      const video = this.$refs.heroVideo
      if (!video) return

      this.isMuted = !this.isMuted
      video.muted = this.isMuted
      video.play()
    },

    updateTimelineLine() {
      this.$nextTick(() => {
        const el = this.$refs.timeline
        if (!el) return
        el.style.setProperty("--line-width", el.scrollWidth + "px")
      })
    },

    nextSlide() {
      if (this.current >= this.loopSlides.length - 1) return

      this.current++
      this.transitioning = true
    },

    prevSlide() {
      if (this.current <= 0) return

      this.current--
      this.transitioning = true
    },

    goToCollection() {
      const realIndex = this.current - 1
      const ip = this.slides?.[realIndex]?.ip
      if (!ip) return
      this.$router.push("/collections/" + ip)
    },

    selectIP(ip) {
      const keys = Object.keys(this.ipInfo)
      this.prevIPIndex = keys.indexOf(this.selectedIP)
      this.selectedIP = ip
      this.selectedPreview = null
      this.hoverImage = false
    },

    selectPreview(p) {
      this.selectedPreview = p._id
      this.$router.push("/product/" + p._id)
    },
    observeScroll() {
      const elements = document.querySelectorAll(".reveal")

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("active")
            }
          })
        },
        {
          threshold: 0.3
        }
      )

      elements.forEach(el => observer.observe(el))
    },
    async fetchNews() {
      try {
        this.loadingNews = true
        const res = await API.get("/news")
        this.news = res.data || []
      } catch (err) {
        console.error("Failed to load news:", err)
      } finally {
        this.loadingNews = false
      }
    }
  },
  watch: {
  current(val) {
    const len = this.loopSlides.length

    setTimeout(() => {
      if (val === len - 1) {
        this.transitioning = false
        this.current = 1
      }

      if (val === 0) {
        this.transitioning = false
        this.current = len - 2
      }
    }, 600)
  }
}
}
</script>

<template>
  <div class="home">
    <div class="video-hero">
      <video
        ref="heroVideo"
        class="hero-media"
        src="/HomeVideo.mp4"
        autoplay
        muted
        loop
        playsinline
      ></video>

      <button class="sound-btn" @click="toggleSound">
        {{ isMuted ? "🔇" : "🔊" }}
      </button>
    </div>
    <section class="about-section">

      <h2>ABOUT US</h2>

      <p class="about-main">
        Beijing POP MART, founded in 2010, is a leading cultural and entertainment company in China.
        Over the past decade, POP MART has built an integrated platform covering the whole industry chain of pop toys.
        The company now focuses on attracting global artists, operating IPs, appealing to consumers,
        promoting pop toy culture, and incubating innovative businesses.
      </p>

      <h3>TO LIGHT UP PASSION AND BRING JOY</h3>

      <div class="about-grid">

        <div class="about-card">
          <h4>Designers</h4>
          <p>
            We have recruited designers such as Kenny Wong, Pucky, and Kasing Lung,
            and launched many fan-favorite IPs.
          </p>
        </div>

        <div class="about-card">
          <h4>Pop Culture</h4>
          <p>
            Integrates art, design, fashion, painting, and sculpture into collectible art toys.
          </p>
        </div>

        <div class="about-card">
          <h4>Brand Licensing</h4>
          <p>
            POP MART collaborates with global brands to create co-branded collectible products.
          </p>
        </div>

        <div class="about-card">
          <h4>Pop Culture Exhibitions</h4>
          <p>
            International exhibitions that promote creativity and inspire the designer toy industry.
          </p>
        </div>

      </div>

    </section>

    <div class="video-hero">

      <div class="video-wrapper">

        <div
          class="video-track"
          :style="{
            transform: `translateX(-${current * 100}%)`,
            transition: transitioning ? 'transform 0.6s ease' : 'none'
          }"
        >

          <div
            v-for="(s, i) in loopSlides"
            :key="i"
            class="slide"
          >

            <video
              v-if="s.type === 'video'"
              :src="s.video"
              autoplay
              muted
              loop
              class="hero-media"
            />

            <img
              v-else
              :src="s.image"
              class="hero-media"
            />

          </div>

        </div>

      </div>

      <div class="hero-overlay">
        <h1>{{ loopSlides[current]?.title }}</h1>

        <button class="hero-buy-btn" @click="goToCollection">
          Buy Now
        </button>
      </div>

      <button class="nav-btn left" @click="prevSlide">‹</button>
      <button class="nav-btn right" @click="nextSlide">›</button>

    </div>

    <div class="ip-section">
      <h2 class="title">IP CHARACTERS</h2>

      <div class="ip-tabs">
        <span
          v-for="(item, key) in ipInfo"
          :key="key"
          :class="{ active: selectedIP === key }"
          @click="selectIP(key)"
        >
          {{ item.name }}
        </span>
      </div>

      <transition
        :name="slideDirection === 'right' ? 'slide-right' : 'slide-left'"
        mode="out-in"
      >
        <div class="ip-content" :key="selectedIP">

          <div class="ip-text-card">
            <h3>{{ ipInfo[selectedIP]?.name }}</h3>
            <p>{{ ipInfo[selectedIP]?.desc }}</p>

            <div class="mini-products">
              <div
                class="mini-card"
                v-for="p in previewProducts"
                :key="p._id"
                @click="selectPreview(p)"
              >
                <img :src="getImg(p.images?.[0] || p.image)" />
                <span>{{ p.title }}</span>
              </div>
            </div>
          </div>

          <div class="ip-image-box">
            <img
              class="ip-img-square"
              :src="hoverImage
                ? ipInfo[selectedIP]?.hoverImage || ipInfo[selectedIP]?.image
                : ipInfo[selectedIP]?.image"
              @mouseenter="hoverImage = true"
              @mouseleave="hoverImage = false"
              @click="$router.push('/collections/' + selectedIP)"
            />
          </div>

        </div>
      </transition>
    </div>

    <div class="timeline-section">
      <h2 class="title">NEW ARRIVALS</h2>

      <div class="timeline-horizontal" ref="timeline">

        <div
          v-for="item in timelineItems"
          :key="item._id"
          class="timeline-h-item"
          @click="$router.push('/product/' + item._id)"
        >

          <div class="timeline-h-dot"></div>

          <div class="timeline-h-card">

            <img :src="getImg(item.images?.[0] || item.image)" />

            <div class="timeline-h-content">
              <h4>{{ item.title }}</h4>

              <p>RM {{ item.variants?.[0]?.price || item.price || 0 }}</p>

              <div class="timeline-h-date">
                {{ formatDate(item.createdAt || item.releaseDate) }}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>

    <section class="home-news">

      <h2 class="title">LATEST NEWS</h2>

      <div v-if="loadingNews" class="home-news-loading">
        Loading news...
      </div>

      <div v-else class="home-news-grid">

        <div
          class="home-news-card"
          v-for="n in publishedNews.slice(0, 6)"
          :key="n._id"
        >

          <div class="home-news-img">
            <img
              v-if="n.image"
              :src="getImg(n.image)"
            />
          </div>

          <div class="home-news-content">

            <h3>{{ n.title }}</h3>

            <p>
              {{ n.description?.substring(0, 130) }}...
            </p>

            <div class="home-news-bottom">
              <button
                class="home-news-btn"
                @click="$router.push('/about-popmart?section=popmart-news#popmart-news')"
              >
                Read More →
              </button>

            </div>

          </div>
        </div>

      </div>

    </section>

    <section class="artist-section">

      <div class="artist-header">
        <h2 class="title">ARTISTS</h2>
        <button
          class="artist-read-btn"
          @click="$router.push('/about-popmart#about-artists')"
        >
          Read More →
        </button>
      </div>

      <div class="artist-scroll">

        <div
          v-for="(a, index) in artists"
          :key="index"
          class="artist-card reveal"
        >

          <div class="artist-image">
            <img :src="a.image" />
          </div>

          <div class="artist-info">
            <h3>{{ a.name }}</h3>
            <p>{{ a.desc }}</p>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<style>
.video-hero {
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
}

.hero-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sound-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;

  width: 48px;
  height: 48px;

  border: none;
  border-radius: 50%;
  cursor: pointer;

  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  backdrop-filter: blur(6px);
  transition: 0.25s ease;
}

.sound-btn:hover {
  background: rgba(0, 0, 0, 0.75);
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  top: 50%;
  left: 60px;
  transform: translateY(-50%);
  color: white;
}

.hero-overlay h1 {
  font-size: 40px;
  margin-bottom: 10px;
}

.artist-section {
  padding: 80px 40px;
  background: #ffffff;
  color: #000000;
}

.artist-header h2 {
  font-size: 30px;
  margin: 0;
  color: #000;
}

.artist-header p {
  font-size: 13px;
  opacity: 0.6;
  color: #000;
}

.artist-scroll {
  display: flex;
  gap: 20px;

  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;

  padding: 20px 0;
}

.artist-scroll::-webkit-scrollbar {
  display: none;
}

.artist-card {
  flex: 0 0 auto;
  width: 240px;

  scroll-snap-align: center;

  background: #fff;
  border-radius: 16px;
  position: relative;
  overflow: hidden;

  border: 1px solid #eee;

  transition: all 0.3s ease;
  cursor: pointer;
}

.artist-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: #ff6b81;
  box-shadow: 0 10px 25px rgba(230, 0, 35, 0.15);
}

.artist-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
}

.artist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.artist-card:hover .artist-image img {
  transform: scale(1.08);
}

.artist-info {
  padding: 12px;
}

.artist-info h3 {
  margin: 0;
  font-size: 16px;
  color: #000;
}

.artist-info p {
  font-size: 12px;
  color: #444;
  margin-top: 5px;
}

.artist-card::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0%;
  background: #ff6b81;
  transition: width 0.3s ease;
}

.artist-card:hover::after {
  width: 100%;
}

.ip-img-square {
  width: 100%;
  cursor: pointer;
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.ip-img-square:hover {
  transform: scale(1.03);
  opacity: 0.95;
}

.about-section {
  padding: 100px 40px;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.about-section::before {
  content: "";
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,107,129,0.15), transparent 60%);
  filter: blur(40px);
  z-index: 0;
}

.about-section h2 {
  font-size: 42px;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 20px;
  position: relative;
}

.about-main {
  max-width: 900px;
  margin: 0 auto 60px;
  font-size: 16px;
  line-height: 1.9;
  color: #555;
  position: relative;
}

.about-section h3 {
  font-size: 18px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 40px;
  color: #111;
  position: relative;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  position: relative;
  z-index: 1;
}

.about-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  border-radius: 18px;

  padding: 24px;
  border: none;

  box-shadow: 0 10px 30px rgba(0,0,0,0.05);

  transition: all 0.35s ease;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.about-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,107,129,0.15), transparent);
  opacity: 0;
  transition: 0.35s;
}

.about-card:hover::before {
  opacity: 1;
}

.about-card:hover {
  transform: translateY(-10px);
  border-color: rgba(255,107,129,0.4);
  box-shadow: 0 20px 50px rgba(255,107,129,0.15);
}

.about-card h4 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #111;
}

.about-card p {
  font-size: 13px;
  line-height: 1.7;
  color: #666;
}

.about-card h4::after {
  content: "";
  display: block;
  width: 40px;
  height: 2px;
  margin-top: 8px;
  background: #ff6b81;
  transition: 0.3s;
}

.about-card:hover h4::after {
  width: 70px;
}

.about-grid .about-card {
  animation: cardAppear 0.8s ease backwards;
}

.about-grid .about-card:nth-child(2) { animation-delay: 0.1s; }
.about-grid .about-card:nth-child(3) { animation-delay: 0.2s; }
.about-grid .about-card:nth-child(4) { animation-delay: 0.3s; }

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.home-news {
  padding: 90px 40px;
  background: white;
}

.section-title {
  font-size: 32px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 50px;
  letter-spacing: 2px;
}

.home-news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  max-width: 1200px;
  margin: auto;
}

.home-news-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  transition: 0.3s ease;
}

.home-news-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 45px rgba(255,107,129,0.15);
}

.home-news-img img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.home-news-content {
  padding: 18px;
}

.home-news-content h3 {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 10px;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-news-content p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.home-news-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home-news-btn {
  border: none;
  background: #ff6b81;
  color: white;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.artist-read-btn {
  border: none;
  background: #fff;
  color: #ff6b81;
  padding: 6px 20px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.home-news-btn:hover {
  background: #ff4d6d;
  transform: translateY(-2px);
}

.artist-read-btn:hover {
  color: #f73d5f;
  transform: translateY(-2px);
  font-weight: 600;
}

@media (max-width: 900px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .home {
    overflow-x: hidden;
  }

  section {
    padding: 50px 16px !important;
  }

  .hero-overlay {       /* optional for better spacing */
    top: 30%;
    transform: translateY(-50%);
    text-align: left;    /* keep content aligned left */
  }

  .hero-overlay h1 {
    font-size: 20px;
    line-height: 1.3;
    text-align: left;
  }

  .hero-buy-btn {
    display: inline-block;
  }

  .hero-overlay {
    left: 50px;
    transform: none;
  }

  .hero-overlay h1 {
    font-size: 20px;
    line-height: 1.3;
  }
  
  .hero-buy-btn{
    font-size: 10px;
    width: 88px;
    height: 30px;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sound-btn {
    width: 42px;
    height: 42px;
    bottom: 12px;
    right: 12px;
  }

  .about-section h2 {
    font-size: 28px;
  }

  .about-main {
    font-size: 14px;
    line-height: 1.7;
  }

  .about-section h3 {
    font-size: 12px;
  }

  .about-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .about-card {
    padding: 18px;
  }

  .ip-section {
    padding: 50px 16px;
  }

  .ip-tabs {
    overflow-x: auto;
    white-space: nowrap;
    display: flex;
    gap: 10px;
    padding-bottom: 10px;
  }

  .ip-tabs span {
    flex: 0 0 auto;
    font-size: 13px;
    padding: 6px 12px;
  }

  .ip-text-card h3 {
    font-size: 18px;
  }

  .ip-text-card p {
    font-size: 13px;
  }

  .mini-products {
    display: flex;
    overflow-x: auto;
    gap: 10px;
    padding-bottom: 10px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .mini-card {
    flex: 0 0 calc(90% - 0px);
    scroll-snap-align: start;
  }

  .ip-img-square {
    border-radius: 12px;
  }

  .timeline-horizontal {
    overflow-x: auto;
    display: flex;
    gap: 12px;
    scroll-snap-type: x mandatory;
    padding-bottom: 10px;
  }

  .timeline-h-item {
    min-width: 220px;
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  .timeline-h-card img {
    height: 140px;
    object-fit: cover;
  }

  .home-news-grid {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 10px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

.home-news-card {
  flex: 0 0 280px;
  scroll-snap-align: start;
}

.home-news-grid::-webkit-scrollbar {
  display: none;
}

.home-news-grid {
  scrollbar-width: none;
}

  .home-news-img img {
    height: 160px;
  }

  .artist-section {
    padding: 50px 16px;
  }

  .artist-scroll {
    gap: 12px;
  }

  .artist-card {
    width: 200px;
  }

  .artist-image {
    height: 180px;
  }
}
</style>