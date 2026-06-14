<script>
export default {
  name: "TermsOfService",
  data() {
    return {
      sections: [
        {
          title: "Overview",
          text:
            "Pop Mart operates this website and provides services subject to your acceptance of all terms. By using our site or purchasing products, you agree to these Terms of Service and related policies."
        },
        {
          title: "Online Store Terms",
          text:
            "You must be of legal age in your region to use this site. You agree not to use our products for illegal purposes or violate any laws. Any breach may result in termination of service."
        },
        {
          title: "General Conditions",
          text:
            "We reserve the right to refuse service at any time. You may not copy, resell, or exploit any part of the service without permission."
        },
        {
          title: "Accuracy of Information",
          text:
            "We are not responsible for inaccurate or outdated information on this site. Content may be updated at any time without notice."
        },
        {
          title: "Products & Pricing",
          text:
            "All products are subject to availability. Prices and product details may change without notice. We reserve the right to limit or discontinue products."
        },
        {
          title: "Orders & Billing",
          text:
            "We may cancel or limit orders at our discretion. You must provide accurate billing and account information to complete purchases."
        },
        {
          title: "User Content",
          text:
            "Any content you submit may be used by us for improvement and marketing purposes. You are responsible for ensuring your content does not violate any rights."
        },
        {
          title: "Personal Information",
          text:
            "Your personal data is handled according to our Privacy Policy. We take reasonable measures to protect your information but cannot guarantee absolute security."
        },
        {
          title: "Prohibited Use",
          text:
            "You may not use this site for unlawful, harmful, abusive, or malicious activities, including hacking, scraping, or spreading viruses."
        },
        {
          title: "Disclaimer",
          text:
            "We provide services 'as is' without warranties. We are not liable for damages resulting from use of our services to the maximum extent permitted by law."
        },
        {
          title: "Termination",
          text:
            "We may terminate or suspend access to our services if you violate any terms. You may stop using our services at any time."
        },
        {
          title: "Governing Law",
          text:
            "These Terms are governed by the laws of Hong Kong, with compliance to applicable consumer protection laws in regions where services are provided."
        },
        {
          title: "Contact",
          text:
            "For any questions, contact us at support@popmart.com."
        }
      ]
    };
  }
};
</script>

<template>
  <div class="tos-page">
    <div class="tos-container">

      <h1 class="title">Terms of Service</h1>
      <p class="effective">Effective Date: 1 July 2025</p>

      <div class="content">

        <section v-for="(section, index) in sections" :key="index" class="section">
          
          <h2 class="section-title">
            {{ section.title }}
          </h2>

          <p class="section-text">
            {{ section.text }}
          </p>

        </section>

      </div>

    </div>
  </div>
</template>

<style>
.tos-page {
  min-height: 100vh;
  background: #f7f7fb;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
}

.tos-container {
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
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
}

.section-text {
  font-size: 15px;
  color: #444;
  line-height: 1.7;
  text-align: justify;
}

.section-title::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 18px;
  background: linear-gradient(180deg, #ff6b81, #ff4757);
  margin-right: 10px;
  border-radius: 3px;
  vertical-align: middle;
}
</style>