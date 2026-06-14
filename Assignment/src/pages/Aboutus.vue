<script>
import { history,artists,friends,ambassadors } from "@/data/artist"
import API from "@/services/api";

export default {
  data() {
    return {
      activeSection: "about-popmart",
      heroVideo: "about-video.mp4",
      history,
      artists,
      friends,
      ambassadors,
      news: [],
      loadingNews: false
    };
  },

  mounted() {
  this.syncFromHash();
  window.addEventListener("hashchange", this.syncFromHash);
  this.fetchNews();
},

  beforeUnmount() {
    window.removeEventListener("hashchange", this.syncFromHash);
  },
  computed: {
  publishedNews() {
    return this.news.filter(n => n.status === "published");
  }
},

  methods: {
    showSection(section) {
      this.activeSection = section;
      window.location.hash = section;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    syncFromHash() {
      const hash = window.location.hash.replace("#", "");

      if (hash) {
        this.activeSection = hash;
      }
    },
  
    async fetchNews() {
      try {
        this.loadingNews = true;

        const res = await API.get("/news");
        this.news = res.data || [];

      } catch (err) {
        console.error(err);
        alert("Failed to load news ❌ (check backend /news route)");
      } finally {
        this.loadingNews = false;
      }
    },
    scrollLeft(refName) {
      const el = this.$refs[refName];
      if (el) {
        el.scrollBy({ left: -320, behavior: "smooth" });
      }
    },
    scrollRight(refName) {
      const el = this.$refs[refName];
      if (el) {
        el.scrollBy({ left: 320, behavior: "smooth" });
      }
    }
  }
};
</script>

<template>
  <div class="aboutus">

    <div class="about-nav">
      <button :class="{active: activeSection==='about-popmart'}" @click="showSection('about-popmart')">About</button>
      <button :class="{active: activeSection==='about-artists'}" @click="showSection('about-artists')">Artists</button>
      <button :class="{active: activeSection==='pop-friends'}" @click="showSection('pop-friends')">POP Friends</button>
      <button :class="{active: activeSection==='popmart-news'}" @click="showSection('popmart-news')">News</button>
      <button :class="{active: activeSection==='about-global'}" @click="showSection('about-global')">Global</button>
    </div>

    <section v-if="activeSection === 'about-popmart'" class="aboutsection">
      <div class="hero-wrap">
        <video autoplay muted loop playsinline>
          <source :src="heroVideo" type="video/mp4" />
        </video>
        <div class="about-overlay">
          <h1>POP MART</h1>
        </div>
      </div>

      <h2 class="about-title">Introduction</h2>
      <p class="about-text">
        POP MART (09992.HK), founded in 2010, is a leading global company in the trend culture and entertainment industry. Centered around IP, POP MART has built a comprehensive platform for creative incubation and IP operation, empowering global creators while delivering exciting products, services, and immersive entertainment experiences to consumers.

        POP MART identifies and nurtures emerging artists and designers worldwide, creating popular character IPs through a well-established IP development and operation system. Its portfolio includes iconic IPs such as MOLLY, SKULLPANDA, DIMOO, THE MONSTERS, and Hirono. By launching art toys and derivative products based on these IPs, POP MART continues to lead trends in consumer culture. As of the end of first half of 2025, POP MART operates over 550 physical stores and more than 2,500 Robo Shops across the world. Through multiple cross-border e-commerce platforms, the company has reached audiences in over 90 countries and regions, bringing joy to young consumers around the world.
      </p>

      <div class="ip-poster">
        <img src="/about-image.png" alt="POP MART IP" />
      </div>

      <h2 class="about-title">POP MART Journey</h2>
        <div class="compact-timeline">
          <div
            v-for="(h, index) in history"
            :key="h.year"
            class="timeline-step"
            :class="index % 2 === 0 ? 'top' : 'bottom'"
          >
            <div class="dot"></div>
            <div class="timeline-card">
              <h3>{{ h.year }}</h3>
              <p v-html="h.text"></p>
            </div>
          </div>
        </div>
    </section>

    <section v-if="activeSection === 'about-artists'" class="aboutsection">
      <div class="about-hero">
        <img src="/popfriend/Poster.png" alt="POP Friends" />
        <div class="about-overlay">
          <div class="overlay-content">
            <h1>Artists</h1>
            <p>The designer toy industry, which started about 20 years ago, has recently boomed in China by combining art, design, and pop culture into unique collectible figures that attract strong fan interest and have become highly trendy.</p>
          </div>
        </div>
      </div>

      <div class="artist-grid">
        <router-link
          v-for="artist in artists"
          :key="artist.name"
          :to="artist.link"
          class="artist-cards"
        >
          <div class="artist-header">
            <img :src="artist.photo" class="artist-photo" />
            <div>
              <h3>{{ artist.name }}</h3>
              <p v-html="artist.desc"></p>
            </div>
          </div>

          <div class="artist-art">
            <img :src="artist.art" />
          </div>

          <span class="explore-btn">Explore Collection →</span>
        </router-link>
      </div>
    </section>

    <section v-if="activeSection === 'pop-friends'" class="aboutsection popfriends-section">

      <div class="about-hero">
        <img src="/popfriends.jpg" alt="POP Friends" />

        <div class="about-overlay">
          <div class="overlay-content">
            <h1>POP FRIENDS</h1>
            <p>Meet the iconic characters and global ambassadors of POP MART</p>
          </div>
        </div>
      </div>

      <h2 class="about-title">POP Friends</h2>

      <div class="marquee">
        <div class="marquee-content">
          <span>
            Dive into the ultimate hub for art toy enthusiasts, collectors, influencers, and creators from all backgrounds. Share your POP Moments get features, and join our mission to light up passion and bring joy around the world.
          </span>

          <span>
            Dive into the ultimate hub for art toy enthusiasts, collectors, influencers, and creators from all backgrounds. Share your POP Moments get features, and join our mission to light up passion and bring joy around the world.
          </span>

          <span>
            Dive into the ultimate hub for art toy enthusiasts, collectors, influencers, and creators from all backgrounds. Share your POP Moments get features, and join our mission to light up passion and bring joy around the world.
          </span>
        </div>
      </div>

      <div class="friends-grid" ref="friends">
        <div v-for="friend in friends" :key="friend.name" class="friend-card">
          <img :src="friend.image" />
          <div class="friend-info">
            <h3>{{ friend.name }}</h3>
          </div>
        </div>
      </div>

      <h2 class="about-title ambassador-title">Our Ambassadors</h2>
      <div class="marquee">
        <div class="marquee-content">
          <span>
            Where Art Toy Enthusiasts Unite and Thrive Join us, spark passion, and spread joy in our global community with style!
          </span>

          <span>
            Where Art Toy Enthusiasts Unite and Thrive Join us, spark passion, and spread joy in our global community with style!
          </span>

          <span>
            Where Art Toy Enthusiasts Unite and Thrive Join us, spark passion, and spread joy in our global community with style!
          </span>

          <span>
            Where Art Toy Enthusiasts Unite and Thrive Join us, spark passion, and spread joy in our global community with style!
          </span>

          <span>
            Where Art Toy Enthusiasts Unite and Thrive Join us, spark passion, and spread joy in our global community with style!
          </span>
        </div>
      </div>

      <div class="ambassador-grid" ref="ambassadors">
        <div
          v-for="ambassador in ambassadors"
          :key="ambassador.name"
          class="ambassador-card"
        >
          <div class="ambassador-image">
            <img :src="ambassador.image" :alt="ambassador.name" />
          </div>

          <div class="ambassador-info">
            <span class="country">{{ ambassador.country }}</span>
            <h3>{{ ambassador.name }}</h3>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeSection === 'popmart-news'" class="news">
      <div class="about-hero">
        <img src="/News.poster.webp" alt="News" />

        <div class="about-overlay">
          <div class="overlay-content">
            <h1>News</h1>
            <p>Stay updated with the latest news and announcements from POP MART</p>
          </div>
        </div>
      </div>

      <div v-if="loadingNews" class="news-loading">
        <div class="spinner"></div>
        <p>Loading latest news...</p>
      </div>
  
      <div class="news-list" v-else>
        <div class="news-card" v-for="n in publishedNews" :key="n._id">
          <div class="news-image">
            <img :src="n.image ? `${import.meta.env.VITE_API_URL}/${n.image}` : ''" />
          </div>

          <div class="news-content">
            <h3 :class="{ expanded: n.showFull }">
              {{ n.title }}
            </h3>

            <p :class="{ expanded: n.showFull }">
              {{ n.description }}
            </p>

            <div class="news-footer">
              <span class="news-date">
                {{
                  new Date(n.updatedAt || n.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })
                }}
              </span>

              <button class="see-more" @click="n.showFull = !n.showFull">
                {{ n.showFull ? "See Less" : "See More" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeSection === 'about-global'" class="global-section">

      <div class="about-hero">
        <img src="/shop/9.jpg" alt="POP MART Global" />
        <div class="about-overlay">
          <div class="overlay-content">
          <h1>POP MART Global</h1>
          <p>
            Bringing designer toy culture to fans across every continent through
            immersive retail experiences, digital channels, and smart retail innovation.
          </p>
        </div>
        </div>
      </div>

      <div class="global-intro">
        <h2>Global Presence</h2>

        <p>
          POP MART’s overseas business officially launched in 2018, and so far, it has expanded to more than 20 countries and regions. POP MART has opened a number of offline flagship stores and pop-up stores in Japan, South Korea, Singapore, the United States, Australia, New Zealand, the United Kingdom, and other countries. Vending machines have been successfully launched all over the world and have received consistent praise from overseas customers as well as business partners. Meanwhile, POP MART established an e-commerce matrix based on overseas official websites integrating deeply and thoroughly with mainstream EC platforms such as Amazon, AliExpress, Shopify, and Lazada. POP MART’s products have been sold to more than 80 countries and regions. At present, the scale of global cooperation abroad contains: distribution channel, exclusive agency, vending machine business cooperation, brand cross-border cooperation, etc.
        </p>

        <div class="global-stats">
          <div class="stat-card">
            <h3>30+</h3>
            <span>Countries & Regions</span>
          </div>

          <div class="stat-card">
            <h3>600+</h3>
            <span>Physical Stores</span>
          </div>

          <div class="stat-card">
            <h3>2500+</h3>
            <span>Robo Shops</span>
          </div>
        </div>
      </div>

      <div class="global-gallery">
        <h2>Global Channels</h2>

        <div class="scroll-wrapper">
          <button class="scroll-btn left" @click="scrollLeft('gallery1')">‹</button>

          <div class="gallery-grid" ref="gallery1">
              <img src="/shop/1.jpg" />
              <img src="/shop/2.jpg" />
              <img src="/shop/3.jpg" />
              <img src="/shop/4.jpg" />
              <img src="/shop/5.jpg" />
              <img src="/shop/6.jpg" />
              <img src="/shop/7.jpg" />
              <img src="/shop/8.jpg" />
              <img src="/shop/9.jpg" />
              <img src="/shop/10.jpg" />
          </div>
            <button class="scroll-btn right" @click="scrollRight('gallery1')">›</button>
        </div>
      </div>

      <div class="global-gallery">
        <h2>Robo Shops Worldwide</h2>
        <div class="scroll-wrapper">
          <button class="scroll-btn left" @click="scrollLeft('gallery2')">‹</button>

          <div class="gallery-grid" ref="gallery2">
              <img src="/shop/11.jpg" />
              <img src="/shop/12.jpg" />
              <img src="/shop/13.jpg" />
              <img src="/shop/14.jpg" />
              <img src="/shop/15.jpg" />
              <img src="/shop/16.jpg" />
              <img src="/shop/17.jpg" />
              <img src="/shop/18.jpg" />
              <img src="/shop/19.jpg" />
              <img src="/shop/20.jpg" />
            </div>

          <button class="scroll-btn right" @click="scrollRight('gallery2')">›</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.news-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #666;
  font-weight: 600;
}

.news-loading .spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #eee;
  border-top: 4px solid #ff6b81;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.aboutus {
  width: 100%;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #fafafa;
  color: #222;
  overflow-x: hidden;
}

.about-title {
  font-size: 2.2rem;
  font-weight: 900;
  text-align: center;
  margin: 80px 0 40px;
  color: #222;
  letter-spacing: 1px;
  position: relative;
}

.about-nav {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 14px 20px;
  backdrop-filter: blur(25px);
  background: rgba(255,255,255,0.6);
}

.about-nav button {
  border: none;
  outline: none;
  background: white !important;
  color: #222 !important;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s;
  box-shadow: none;
}

.about-nav button:hover{
  background: rgb(255, 215, 221) !important;
}

.about-nav button.active {
  background: #ff6b81 !important;
  color: #fff !important;
}

.about-nav button:hover:not(.active) {
  transform: translateY(-2px);
  color: #ff6b81;
}

.about-nav button:focus {
  outline: none;
}

.hero-wrap {
  position: relative;
  height: 100vh;
  min-height: 700px;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.55),
    rgba(0,0,0,0.75)
  );

  color: white;
  text-align: center;

}
.ip-poster {
  height: 100%;
}
.about-overlay h1 {
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 900;
  letter-spacing: 4px;
  text-shadow: 0 8px 30px rgba(0,0,0,.4);

  animation: fadeUp 1.2s ease;
}

.about-hero {
  position: relative;
  width: 100%;
  height: 80vh;
  min-height: 550px;
  overflow: hidden;
}

.about-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: zoomHero 18s ease-in-out infinite alternate;
}

.about-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  background:
    linear-gradient(
      to bottom,
      rgba(0,0,0,0.55),
      rgba(0,0,0,0.75)
    );

  text-align: center;
  color: white;
}

.overlay-content {
  animation: fadeUp 1.2s ease;
}

.overlay-content h1 {
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 900;
  letter-spacing: 4px;
  text-shadow: 0 8px 30px rgba(0,0,0,.4);
}

.overlay-content p {
  font-size: 1.2rem;
  max-width: 650px;
  margin: auto;
  opacity: .95;
  line-height: 1.8;
}

@keyframes zoomHero {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .about-hero {
    height: 60vh;
    min-height: 420px;
  }

  .overlay-content h1 {
    font-size: 2.6rem;
    letter-spacing: 2px;
  }

  .overlay-content p {
    font-size: 1rem;
    padding: 0 20px;
  }
}

.about-text {
  padding: 20px;
  max-width: 780px;
  margin: 0 auto 100px;
  font-size: 1.1rem;
  line-height: 1.85;
  color: #444;
  text-align: justify;
}

.about-text p {
  margin-bottom: 28px;
}

.about-text strong {
  color: #ff6b81;
  font-weight: 700;
}

.marquee {
  width: 100%;
  overflow: hidden;
}

.marquee-content {
  display: flex;
  width: max-content;
  animation: marquee 100s linear infinite;
  font-size: 1.3rem;
  padding: 20px 0 50px;
}

.marquee-content span {
  white-space: nowrap;
  padding-right: 100px;
  font-size: 1.3rem;
}

@keyframes marquee {
  from {
    transform: translateX(-100);
  }

  to {
    transform: translateX(-50%);
  }
}

.compact-timeline {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 100px;
  padding: 250px 40px;
  overflow-x: auto;
  overflow-y: hidden;

  scroll-behavior: smooth;
}

.compact-timeline::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  height: 5px;
  width: calc(180px * 6 + 100px * 5 + 300px);
  background: linear-gradient(to right, #ff6b81, #ff9eb5);
  border-radius: 999px;
  transform: translateY(-50%);
  z-index: 0;
}

.timeline-step {
  flex: 0 0 auto;
  width: 180px;
  height: 320px;
  position: relative;
  z-index: 1;
}

.dot {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 18px;
  height: 18px;
  transform: translate(-50%, -50%);
  background: white;
  border: 4px solid #ff6b81;
  border-radius: 50%;
  z-index: 10;
}

.timeline-card {
  position: absolute;
  left: 100%;
  transform: translateX(-50%);
  width: 200px;
  background: white;
  border-radius: 20px;
  padding: 18px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.timeline-card h3{
  font-size: 23px;
  font-weight: 900;
  color: #ff6b81;
  margin-bottom: 12px;
}

.timeline-step.top .timeline-card {
  top: calc(50% - 280px);
}

.timeline-step.bottom .timeline-card {
  top: calc(50% + 50px);
}

.timeline-card:hover {
  transform: translateX(-50%) scale(1.08);
  box-shadow: 0 10px 25px #ff6b81;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 35px;
  padding: 40px;
}

.artist-cards {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(18px);
  border-radius: 28px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  box-shadow:
    0 18px 40px rgba(0,0,0,0.08);
  transition: all 0.35s ease;
  border: 1px solid rgba(255,107,129,0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: auto;
  position: relative;
  overflow: hidden;
}

.artist-cards:hover {
  transform: translateY(-10px) rotate(-1deg);
  box-shadow: 0 24px 60px rgba(255,107,129,0.18);
  border-color: #ff6b81;
}

.artist-cards::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #ff6b81, #ff9eb5);
}
.artist-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  line-height: 1.8;
  flex: 1;
}

.artist-photo {
  width: 200px;
  height: 200px;
  border-radius: 18px;
  object-fit: cover;
}

.artist-header h3 {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.artist-header p {
  font-size: 14px;
  color: #666;
  line-height: 1.75;
  max-height: none;
  overflow: visible;
  text-align: justify;
  padding: 10px 5px;
}

.artist-art {
  background: #fafafa;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
}

.artist-art img {
  width: 100%;
  height: 220px;
  object-fit: contain;
  transition: transform .35s ease;
}

.artist-cards:hover .artist-art img {
  transform: scale(1.08);
}

.explore-btn {
  margin-top: auto;
  background: #ff6b81;
  color: white;
  padding: 12px 18px;
  border-radius: 999px;
  text-align: center;
  font-weight: 700;
  transition: 0.3s;
}

.artist-cards:hover .explore-btn {
  background: #ff4d6d;
}

.artist-grid,
.exp-grid,
.news-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.friends-grid {
  display: grid;
  gap: 35px;
  max-width: 1200px;
  margin: auto;
  grid-template-columns: repeat(3, 1fr);
}

.friend-card {
  background: white;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 14px 35px rgba(0,0,0,.08);
  transition: all .35s ease;
  cursor: pointer;
}

.friend-card:hover {
  transform: scale(1.03) rotate(1deg);
  box-shadow: 0 22px 55px rgba(255,107,129,.18);
}

.friend-card img {
  width: 100%;
  height: 310px;
  object-fit: cover;
  box-shadow:
    0 18px 40px rgba(0,0,0,0.12);
  transition: all .5s ease;
}

.friend-card:hover img {
  transform: scale(1.03);
}

.friend-info {
  padding: 10px;
  text-align: center;
}

.friend-info h3 {
  font-size: 1.3rem;
  font-weight: 900;
  color: #ff6b81;
  letter-spacing: .5px;
}

.ambassador-title {
  margin: 120px 0 70px;
  font-size: 2.4rem;
}

.ambassador-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 40px;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 0 100px;
}

.ambassador-card {
  display: flex;
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.ambassador-card:hover {
  transform: translateY(-15px);
  box-shadow: 0 30px 65px rgba(255, 107, 129, 0.2);
}

.ambassador-image {
  width: 42%;
  flex-shrink: 0;
  position: relative;
}

.ambassador-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.ambassador-card:hover .ambassador-image img {
  transform: scale(1.08);
}

.ambassador-image::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #ff6b81, #ff9eb5);
}

.ambassador-info {
  padding: 40px 35px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.country {
  display: inline-block;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ff6b81;
  text-transform: uppercase;
  margin-bottom: 12px;
  background: #fff0f3;
  padding: 4px 14px;
  border-radius: 30px;
  width: fit-content;
}

.ambassador-info h3 {
  font-size: 2.1rem;
  font-weight: 900;
  line-height: 1.15;
  color: #1f1f1f;
  margin: 0 5px;
}

@media (max-width: 900px) {

  .friends-grid {
    display: flex;
    overflow-x: auto;
    gap: 20px;
    padding: 10px 20px 25px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .friends-grid::-webkit-scrollbar {
    display: none;
  }

  .ambassador-grid {
    display: flex;
    overflow-x: auto;
    gap: 20px;
    padding: 10px 20px 25px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    max-width: 100%;
  }

  .ambassador-grid::-webkit-scrollbar {
    display: none;
  }

  .ambassador-card , .friend-card{
    min-width: 320px;
    flex: 0 0 auto;
    flex-direction: column;
    scroll-snap-align: center;
  }

  .ambassador-image ,.friend-card img{
    width: 100%;
    height: 350px;
  }

  .ambassador-image::after {
    height: 200%;
  }

  .ambassador-info {
    padding: 25px;
    text-align: center;
  }

  .ambassador-info h3 {
    font-size: 1.6rem;
  }
}

.global-section {
  background: #fafafa;
}

.global-intro {
  max-width: 1200px;
  margin: auto;
  padding: 100px 40px;
  text-align: center;
}

.global-intro p{
  text-align: justify;
}

.global-intro h2 {
  font-size: 2.4rem;
  margin-bottom: 25px;
}

.global-intro p {
  font-size: 1.08rem;
  line-height: 1.9;
  color: #555;
  max-width: 900px;
  margin: auto;
}

.global-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 60px;
}

.stat-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0,0,0,.08);
}

.stat-card h3 {
  font-size: 3rem;
  color: #ff6b81;
  font-weight: 900;
}

.stat-card span {
  color: #666;
  font-weight: 600;
}

.global-gallery {
  padding: 80px 40px;
}

.global-gallery h2 {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 50px;
}

.gallery-grid {
  display: flex;
  gap: 28px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 10px 20px 25px;
  max-width: 1300px;
  margin: auto;
  scrollbar-width: none;
}

.gallery-grid::-webkit-scrollbar {
  display: none;
}

.gallery-grid img {
  min-width: 380px;
  height: 280px;
  object-fit: cover;
  border-radius: 22px;
  flex: 0 0 auto;
  scroll-snap-align: center;

  transition: .35s;
  box-shadow: 0 12px 30px rgba(0,0,0,.08);
}

.gallery-grid img:hover {
  transform: scale(1.04);
  box-shadow: 0 18px 45px rgba(255,107,129,.18);
}

@media (max-width: 900px) {
  .gallery-grid {
    display: flex;
    overflow-x: auto;
    gap: 18px;
    padding: 10px 20px 25px;
  }

  .gallery-grid img {
    min-width: 280px;
    height: 220px;
  }
}

@media (max-width: 900px) {
  .about-nav::-webkit-scrollbar {
    display: none;
  }

  .artist-grid,
  .exp-grid,
  .news-list,
  .friends-grid {
    grid-template-columns: 1fr;
  }

  .compact-timeline {
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 60px 20px;
    overflow-x: hidden;
  }

  .compact-timeline::before {
    left: 50%;
    right: auto;
    top: 0;
    width: 4px;
    height: 100%;
    transform: translateX(-50%);
  }

  .timeline-step {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
  }

  .dot {
    left: 50%;
    top: 0;
    transform: translate(-50%, -50%);
  }

  .timeline-card {
    position: relative;
    left: auto;
    transform: none;
    width: 90%;
    max-width: 320px;
    margin-top: 30px;
  }

  .timeline-step.top .timeline-card,
  .timeline-step.bottom .timeline-card {
    top: auto;
  }

  .timeline-step.top:hover .timeline-card,
.timeline-step.bottom:hover .timeline-card {
  transform: none;
  background: 0 10px 25px #ff6b81;
}
}

.news-list {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  max-width: 1200px;
  margin: auto;
}

.news-card {
  display: flex;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 35px rgba(0,0,0,0.08);
  transition: all .35s ease;
  margin-top:30px;
}

.news-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(255,107,129,.18);
}

.news-image {
  width: 340px;
  height: fit-content;
  padding: 28px;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-content {
  flex: 1;
  padding: 0 28px 28px 28px;
  display: flex;
  flex-direction: column;
}

.news-content h3 {
  font-size: 1.35rem;
  font-weight: 900;
  color: #222;
  margin-bottom: 14px;

  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-content h3.expanded {
  -webkit-line-clamp: unset;
}

.news-content p {
  font-size: 15px;
  color: #666;
  line-height: 1.8;

  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;

  margin-bottom: 20px;

  text-align: justify;
}

.news-content p.expanded {
  -webkit-line-clamp: unset;
}

.see-more {
  border: none;
  background: #ff6b81;
  color: white;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  transition: .3s;
  justify-self: end;
}

.see-more:hover {
  background: #ff4d6d;
  transform: translateY(-2px);
}
.news-footer {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-top: auto;
}
.news-date {
  font-size: 14px;
  color: #ff6b81;
  font-weight: 700;
}

.scroll-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.scroll-btn {
  position: absolute;
  z-index: 10;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 107, 129, 0.9);
  color: white;
  font-size: 22px;
  cursor: pointer;
  transition: 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.scroll-btn:hover {
  background: #ff4d6d;
  transform: scale(1.1);
}

.scroll-btn.left {
  left: 8px;
}

.scroll-btn.right {
  right: 8px;
}

.friends-grid,
.ambassador-grid,
.gallery-grid {
  scroll-behavior: smooth;
}
@media (max-width: 900px) {

  .artist-grid {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    grid-template-columns: 1fr;
    padding: 15px;
    gap: 20px;
  }

  .artist-grid::-webkit-scrollbar {
    display: none;
  }

  .artist-cards {
    width: 280px;
    flex: 0 0 auto;
    scroll-snap-align: center;
  }
}

@media (max-width: 900px) {
  .news-card {
    flex-direction: column;
  }

  .news-image {
    width: 100%;
  }

  .news-image img {
    min-height: 220px;
  }

  .news-content h3 {
    -webkit-line-clamp: 2;
  }
}

@media (max-width: 900px) {

  .aboutus {
    overflow-x: hidden;
  }

  .about-title {
    font-size: 1.6rem;
    margin: 50px 0 25px;
  }

  .about-nav {
    justify-content: flex-start;
    overflow-x: auto;
    gap: 12px;
    padding: 10px 14px;
  }

  .about-nav button {
    flex: 0 0 auto;
    font-size: 13px;
    padding: 8px 14px;
    border-radius: 999px;
  }

  .about-hero {
    height: 55vh;
    min-height: 380px;
  }

  .overlay-content h1 {
    font-size: 2.2rem;
    letter-spacing: 2px;
  }

  .overlay-content p {
    font-size: 0.95rem;
    padding: 0 15px;
  }

  .about-text {
    font-size: 0.95rem;
    padding: 15px;
    line-height: 1.7;
  }

  .artist-cards {
    width: 260px;
    padding: 18px;
    border-radius: 20px;
  }

  .artist-photo {
    width: 140px;
    height: 140px;
  }

  .artist-art img {
    height: 160px;
  }

  .friends-grid {
    display: flex;
    overflow-x: auto;
    gap: 15px;
    padding: 10px 15px 25px;
    scroll-snap-type: x mandatory;
  }

  .friend-card {
    min-width: 260px;
    scroll-snap-align: center;
  }

  .friend-card img {
    height: 260px;
  }

  .ambassador-grid {
    display: flex;
    overflow-x: auto;
    gap: 15px;
    padding: 10px 15px 25px;
  }

  .ambassador-card {
    min-width: 300px;
    flex-direction: column;
  }

  .ambassador-image {
    width: 100%;
    height: 220px;
  }

  .ambassador-info {
    padding: 18px;
    text-align: center;
  }

  .ambassador-info h3 {
    font-size: 1.4rem;
  }

  .compact-timeline {
    padding: 40px 15px;
    gap: 30px;
  }

  .timeline-card {
    max-width: 280px;
    font-size: 0.9rem;
  }

  .news-list {
    padding: 15px;
    gap: 25px;
  }

  .news-card {
    flex-direction: column;
    border-radius: 18px;
  }

  .news-image {
    width: 100%;
    padding: 15px;
  }

  .news-content {
    padding: 15px;
  }

  .news-content h3 {
    font-size: 1.1rem;
    -webkit-line-clamp: 2;
  }

  .news-content p {
    font-size: 14px;
    -webkit-line-clamp: 3;
  }

  .see-more {
    width: 100%;
    text-align: center;
  }

  .global-stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .stat-card {
    padding: 25px;
  }

  .stat-card h3 {
    font-size: 2.2rem;
  }

  .gallery-grid {
    gap: 14px;
  }

  .gallery-grid img {
    min-width: 260px;
    height: 200px;
  }
}

@media (max-width: 900px) {
  .news-list {
    display: flex !important;
    flex-direction: row !important;
    overflow-x: auto;
    gap: 16px;
    padding: 15px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .news-card {
    flex: 0 0 auto;
    width:280px;
    scroll-snap-align: center;
    flex-direction: column;
  }

  .news-image {
    width: 100%;
    padding: 15px;
  }

  .news-image img {
    width: 100%;
    height: 220px;
    object-fit: cover;
  }

  .news-content {
    padding: 15px;
  }

  .news-footer {
    grid-template-columns: 1fr auto;
  }

}
</style>