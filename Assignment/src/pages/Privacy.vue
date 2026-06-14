<script>
export default {
  name: "PrivacyPolicy",
  data() {
    return {
      sections: [
        {
          title: "Introduction",
          text:
            "Pop Mart respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and protect your information when you use our website and services."
        },
        {
          title: "Information We Collect",
          text:
            "We may collect identity, contact, financial, transaction, technical, profile, usage, marketing, and location data depending on how you use our services."
        },
        {
          title: "How We Collect Data",
          text:
            "We collect data directly from you, automatically through cookies and system logs, and from third-party service providers such as payment and analytics partners."
        },
        {
          title: "How We Use Your Data",
          text:
            "We use your data to provide services, process transactions, improve user experience, ensure security, and deliver marketing communications where permitted."
        },
        {
          title: "Legal Basis",
          text:
            "We process your personal data based on contract performance, legitimate interests, legal obligations, or your consent depending on the situation."
        },
        {
          title: "Cookies",
          text:
            "Cookies are used to improve website functionality, analyze traffic, and enhance user experience. You can disable cookies in your browser settings."
        },
        {
          title: "Data Sharing",
          text:
            "We may share your data with trusted third-party providers such as payment processors, logistics partners, and fraud prevention services under strict agreements."
        },
        {
          title: "International Transfers",
          text:
            "Your data may be processed in different countries with appropriate safeguards to ensure protection under applicable data laws."
        },
        {
          title: "Data Security",
          text:
            "We implement technical and organizational measures to protect your personal data from unauthorized access, alteration, or disclosure."
        },
        {
          title: "Data Retention",
          text:
            "We retain your personal data only as long as necessary for legal, regulatory, or business purposes, after which it is securely deleted or anonymized."
        },
        {
          title: "Your Rights",
          text:
            "You have the right to access, correct, delete, restrict, or object to processing of your personal data, as well as withdraw consent at any time."
        },
        {
          title: "Children’s Privacy",
          text:
            "We do not knowingly collect data from children under 13 without parental consent. If detected, such data will be deleted immediately."
        },
        {
          title: "Contact Us",
          text:
            "If you have questions about this Privacy Policy, please contact us at support@popmart.com."
        }
      ]
    };
  }
};
</script>
<template>
  <div class="privacy-page">
    <div class="privacy-container">

      <h1 class="title">Privacy Policy</h1>
      <p class="effective">Last updated: 1 July 2025</p>

      <div class="content">

        <section v-for="(item, index) in sections" :key="index" class="section">

          <h2 class="section-title">
            {{ item.title }}
          </h2>

          <p class="section-text">
            {{ item.text }}
          </p>

        </section>

      </div>

    </div>
  </div>
</template>

<style>
.privacy-page {
  min-height: 100vh;
  background: #f7f7fb;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
}

.privacy-container {
  width: 100%;
  max-width: 900px;
}

.title {
  font-size: 40px;
  font-weight: 800;
  text-align: center;
  color: #111;
}

.effective {
  text-align: center;
  margin-top: 6px;
  color: #777;
  font-size: 14px;
}

.content {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  transition: 0.2s ease;
}

.section:hover {
  transform: translateY(-2px);
  border-color: #ffd6dc;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #ff4757;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: "";
  width: 6px;
  height: 18px;
  background: linear-gradient(180deg, #ff6b81, #ff4757);
  margin-right: 10px;
  border-radius: 3px;
}

.section-text {
  font-size: 15px;
  color: #444;
  line-height: 1.7;
  text-align: justify;
}
</style>