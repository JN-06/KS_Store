<script>
import { stores } from "@/data/store";

export default {
  data() {
    return {
      selectedStore: 0,
      showModal: false,
      stores
    };
  },
  
  computed: {
    currentStore() {
      return this.stores[this.selectedStore];
    }
  },

  methods: {
    selectStore(index) {
      this.selectedStore = index;
    },
    openModal(index) {
      this.selectedStore = index;
      this.showModal = true;
    }
  }
};
</script>

<template>
  <div class="store-page">
    <div class="about-hero">
      <img class="hero-bg" src="/shop/1.jpg" alt="Stores" />

      <div class="about-overlay">
        <div class="overlay-content">
          <h1>Find Your POP MART</h1>
          <p>Discover exclusive collectibles at our signature locations across Malaysia.</p>
        </div>
      </div>
    </div>

    <main class="store-container">
      <div class="layout-grid">
        <section class="stores-sidebar">
          <div class="section-header">
            <h2>Locations</h2>
            <span class="count">{{ stores.length }} Stores Found</span>
          </div>
          
          <div class="scroll-area">
            <div
              v-for="(store, index) in stores"
              :key="store.name"
              class="store-item"
              :class="{ active: index === selectedStore }"
              @click="selectStore(index)"
            >
              <div class="store-item-info">
                <h3>{{ store.name }}</h3>
                <p>📍 {{ store.location }}</p>
              </div>
              <div class="chevron">→</div>
            </div>
          </div>
        </section>

        <section class="store-viewer">

          <div class="map-card shadow-lg">
            <iframe
              :src="currentStore.map"
              loading="lazy"
              allowfullscreen
            ></iframe>

            <div class="floating-details">
              <div class="details-header">
                <img :src="currentStore.image" class="mini-thumb" />
                <div>
                  <h4>{{ currentStore.name }}</h4>
                  <p>{{ currentStore.time }}</p>
                </div>
              </div>

              <div class="right-action">
              <button class="btn-primary-sm" @click="showModal = true">
                View Full Details
              </button>
              </div>
            </div>
          </div>

          <div class="store-info-bottom">
            <div class="details-header">
              <img :src="currentStore.image" class="mini-thumb" />
              <div>
                <h4>{{ currentStore.name }}</h4>
                <p>{{ currentStore.time }}</p>
              </div>
            </div>

            <button class="btn-primary-sm" @click="showModal = true">
              VIEW FULL DETAIL
            </button>
          </div>

        </section>

      </div>
    </main>
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">

        <div class="modal-content" @click.stop>
          <button class="modal-close-btn" @click="showModal = false">
            ✕
          </button>

          <div
            class="modal-banner"
            :style="{ backgroundImage: `url(${currentStore.image})` }"
          ></div>

          <div class="modal-body">

            <div class="modal-title-row">
              <h2>{{ currentStore.name }}</h2>
            </div>

            <p class="full-address">
              {{ currentStore.fullInfo.address }}
            </p>

            <div class="info-grid">
              <div class="info-group">
                <h3>Opening Hours</h3>

                <div class="hours-list">
                  <div
                    v-for="(h, day) in currentStore.fullInfo.hours"
                    :key="day"
                    class="hour-row"
                  >
                    <span class="day">{{ day.toUpperCase() }}</span>
                    <span class="time">{{ h }}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </Transition>
  </div>
</template>

<style>
.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;

  width: 38px;
  height: 38px;
  border-radius: 50%;

  border: none;
  background: rgba(0,0,0,0.6);
  color: white;

  font-size: 16px;
  font-weight: bold;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.modal-close-btn:hover {
  background: black;
  transform: scale(1.1);
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

.store-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.layout-grid {
  margin-top: 50px;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 30px;
  height: auto;
}

.stores-sidebar {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 { font-size: 1.2rem; font-weight: 800; }
.count { font-size: 0.8rem; color: #747d8c; }

.scroll-area {
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 10px;
  padding-left: 10px;
  padding-top: 10px;
}

.store-item {
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid transparent;
  background: #f3f3f3;
}

.store-item:hover {
  background: #fff5f6;
}

.store-item.active {
  background: white;
  border-color: #ff6b81;
  box-shadow: 0 8px 20px rgba(255, 71, 87, 0.1);
  transform: scale(1.02);
}

.store-item h3 { font-size: 1rem; margin-bottom: 4px; }
.store-item p { font-size: 0.85rem; color: #747d8c; }

.store-viewer {
  position: relative;
}

.map-card {
  height: 100%;
  border-radius: var(--radius);
  overflow: hidden;
  position: relative;
  background: #eee;
}

.map-card iframe {
  width: 100%;
  height: 100%;
  border: none;
  filter: grayscale(0.2) contrast(1.1);
}

.floating-details {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 20px;
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}

.details-header { display: flex; gap: 15px; align-items: center; }
.mini-thumb { width: 50px; height: 50px; border-radius: 12px; object-fit: cover; }
.details-header h4 { font-weight: 800; }
.details-header p { font-size: 0.8rem; color: #57606f; }

.btn-primary-sm {
  background: var(--dark);
  color: black;
  border: solid;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(47, 53, 66, 0.4);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  width: 550px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.2);
}

.modal-banner {
  height: 240px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.close-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  font-weight: 790;
}

.modal-body { padding: 40px; }

.modal-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-badge {
  background: #e1ffed;
  color: #26de81;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
}

.full-address { color: #747d8c; margin-bottom: 30px; line-height: 1.6; }

.hour-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f1f2f6;
  font-size: 0.9rem;
}

.day { font-weight: 600; color: #2f3542; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 900px) {

  .layout-grid {
    grid-template-columns: 1fr;
    gap: 18px;
    margin-top: 20px;
  }

  .about-hero {
    height: 55vh;
    min-height: 360px;
  }

  .overlay-content h1 {
    font-size: 2.2rem;
    letter-spacing: 2px;
  }

  .overlay-content p {
    font-size: 0.95rem;
    padding: 0 15px;
  }

  .stores-sidebar {
    height: auto;
    max-height: 320px;
    padding: 16px;
    border-radius: 18px;
  }

  .scroll-area {
    max-height: 240px;
    overflow-y: auto;

    -webkit-overflow-scrolling: touch;
  }

  .store-item {
    padding: 12px;
    border-radius: 14px;
  }

  .store-item h3 {
    font-size: 0.95rem;
  }

  .store-item p {
    font-size: 0.8rem;
  }

  .store-viewer {
    height: 380px;
  }

  .map-card {
    height: 100%;
    border-radius: 18px;
  }

  .floating-details {
    left: 12px;
    right: 12px;
    bottom: 12px;

    padding: 14px;
    border-radius: 14px;

    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .mini-thumb {
    width: 42px;
    height: 42px;
  }

  .details-header h4 {
    font-size: 0.9rem;
  }

  .modal-content {
    width: 92%;
    border-radius: 18px;
    max-height: 85vh;
    overflow-y: auto;
  }

  .modal-banner {
    height: 180px;
  }

  .modal-body {
    padding: 18px;
  }

  .modal-title-row h2 {
    font-size: 1.2rem;
  }

  .full-address {
    font-size: 0.85rem;
  }

  .hour-row {
    font-size: 0.85rem;
    padding: 8px 0;
  }

  .modal-close-btn {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }
}

.store-info-bottom {
  display: none;
}

@media (max-width: 900px) {
  .store-viewer {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .floating-details {
    display: none;
  }

  .store-info-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    background: white;
    padding: 16px;
    border-radius: 18px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  }

  .mini-thumb-lg {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    object-fit: cover;
  }

  .info-text {
    text-align: center;
  }

  .info-text h4 {
    font-size: 1rem;
    font-weight: 800;
  }

  .info-text p {
    font-size: 0.85rem;
    color: #666;
  }

  .store-info-bottom .btn-primary-sm {
    width: 100%;
  }
}
</style>