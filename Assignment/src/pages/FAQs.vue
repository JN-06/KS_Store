
<script>
export default {
  name: "FAQs",
  data() {
    return {
      activeIndex: null,
      faqs: [
        {
          question: "What's a Blind Box?",
          answer:
            "Blind Box refers to sealed packaging that keeps the contents of the toy a mystery until opened. Each series contains different figures, some rare and some secret chase figures."
        },
        {
          question: "What shipping options are available?",
          answer:
            "We provide Standard Shipping, SF Express, and DHL depending on your location."
        },
        {
          question: "How long does standard shipping take?",
          answer:
            "Standard shipping usually takes around 20 days depending on your country."
        },
        {
          question: "Can I see shipping cost before checkout?",
          answer:
            "Yes, shipping fees are calculated automatically in your cart."
        },
        {
          question: "When will my order ship?",
          answer:
            "Orders are processed within 7 business days after confirmation."
        },
        {
          question: "Can I cancel my order?",
          answer:
            "Orders can only be cancelled before shipment."
        },
        {
          question: "What if my item is damaged?",
          answer:
            "Contact support within 7 days for replacement or refund if item is defective."
        },
        {
          question: "How do POP MART points work?",
          answer:
            "You earn 1 point per RM1 spent and can redeem them for rewards."
        },
        {
          question: "Do points expire?",
          answer:
            "Yes, points expire after 12 months if not used."
        }
      ]
    };
  },
  methods: {
    toggle(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
    }
  }
};
</script>

<template>
  <div class="faq-page">
    <div class="faq-container">
      <h1 class="title">FAQs</h1>
      <p class="subtitle">Find answers to commonly asked questions</p>

      <div class="faq-list">
        <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
          
          <!-- Question -->
          <button class="faq-question" @click="toggle(index)">
            <span>{{ faq.question }}</span>
            <span class="icon">
              {{ activeIndex === index ? "−" : "+" }}
            </span>
          </button>

          <!-- Answer -->
          <transition name="fade">
            <div v-if="activeIndex === index" class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </transition>

        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* ===== PAGE BACKGROUND ===== */
.faq-page {
  min-height: 100vh;
  background: #f7f7fb;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
}

/* ===== CONTAINER ===== */
.faq-container {
  width: 100%;
  max-width: 800px;
}

/* ===== TITLE ===== */
.title {
  font-size: 38px;
  font-weight: 800;
  text-align: center;
  color: #111;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

/* ===== FAQ CARD LIST ===== */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ===== ITEM CARD ===== */
.faq-item {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #eee;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: 0.2s ease;
}

.faq-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

/* ===== QUESTION BUTTON ===== */
.faq-question {
  width: 100%;
  padding: 18px;
  background: #fff;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

/* hover accent */
.faq-question:hover {
  background: #fff5f7;
}

/* ===== ICON ===== */
.icon {
  font-size: 22px;
  font-weight: bold;
  color: #ff4757;
  transition: 0.2s;
}

/* ===== ANSWER ===== */
.faq-answer {
  padding: 0 18px 18px;
  color: #555;
  line-height: 1.6;
  border-top: 1px solid #f1f1f1;
}

/* ===== ANIMATION ===== */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ===== ACTIVE QUESTION STYLE ===== */
.faq-question:focus {
  outline: none;
}

.faq-item.active .faq-question {
  color: #ff4757;
}
</style>