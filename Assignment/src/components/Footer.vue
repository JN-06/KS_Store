<script>
export default {
  name: "Footer"
}
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-col">
        <h3>Follow Us</h3>
        <ul class="social-links">
          <li><a href="https://l.instagram.com/?u=https%3A%2F%2Flinktr.ee%2Fpopmartmalaysia%3Futm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPOTM2NjE5NzQzMzkyNDU5AAGnouomy28189eppUM3tzgCgJrbf-kXvQ8DNl8eU-CYud1nPVqYNVjMTyojxCQ_aem_KDCTdnfKpfuTN8YVyaVDsA&e=AUBtBLvFd3zdJ3_6b2fQaFuGxnC4vBDUXWqR4_ia0DlEc67EjAcP8eQqnSJ1Q-bBsa_2TrRdnZJigTCxGvkM77sGGbFOHJY-8qGcglS2wVgYqDXKMY5PJW_yY7VMjzm9vxCFbls" target="_blank" rel="noopener">Linktree</a></li>
          <li><a href="https://www.facebook.com/popmartmy?" target="_blank" rel="noopener">Facebook</a></li>
          <li><a href="https://www.instagram.com/popmartmy" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="https://www.tiktok.com/@popmartmalaysia" target="_blank" rel="noopener">TikTok</a></li>
          <li><a href="https://x.com/POPMARTGlobal?s=20" target="_blank" rel="noopener">X</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h3>Help</h3>
        <ul>
          <li><router-link to="/faq">FAQs</router-link></li>
          <li><router-link to="/terms">Terms & Conditions</router-link></li>
          <li><router-link to="/privacy">Privacy Policy</router-link></li>
        </ul>
      </div>

      <div class="footer-col">
        <h3>Information</h3>
        <ul>
          <li><router-link to="/stores-map">Store</router-link></li>
          <li><router-link to="/about-popmart">About Us</router-link></li>
          <li><router-link to="/account">My Account</router-link></li>
        </ul>
      </div>

      <div class="footer-col">
        <h3>Shop</h3>
        <ul>
          <li><router-link to="/collections">All IP</router-link></li>
          <li><router-link to="/category/blind_boxes">All Blind Box</router-link></li>
          <li><router-link to="/category/plush_toys">All Plush Toys</router-link></li>
          <li><router-link to="/category/accessories">All Accessories</router-link></li>
          <li><router-link to="/coming-soon">Coming Soon</router-link></li>
          <li><router-link to="/new-arrivals">New Arrivals</router-link></li>
        </ul>
      </div>

    </div>

    <div class="footer-bottom">
      <p>© 2026 Pop Mart</p>
    </div>

  </footer>
</template>

<style scoped>
.footer {
  background: #111;
  color: #fff;
  padding: 50px 20px 20px;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 30px;
}

.footer-col {
  min-width: 180px;
}

.footer-col h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

.footer-col ul {
  list-style: none;
  padding: 0;
}

.footer-col ul li {
  margin-bottom: 8px;
}

.footer-col a,
.footer-col .router-link-active {
  color: #bbb;
  text-decoration: none;
  transition: 0.2s;
}

.footer-col a:hover {
  color: #fff;
}

.social-links li {
  margin-bottom: 8px;
}

.footer-bottom {
  margin-top: 30px;
  border-top: 1px solid #333;
  padding-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #888;
}

@media (max-width: 900px) {

  .footer {
    padding: 40px 20px 20px;
  }

  .footer-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px 20px;
  }

  .footer-col {
    min-width: unset;
  }

  .footer-col h3 {
    font-size: 15px;
    margin-bottom: 14px;
    color: #fff;
    position: relative;
    padding-bottom: 8px;
  }

  .footer-col h3::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 35px;
    height: 2px;
    background: #ff6b81;
    border-radius: 10px;
  }

  .footer-col ul li {
    margin-bottom: 10px;
  }

  .footer-col a {
    font-size: 14px;
    color: #bdbdbd;
    transition: 0.3s;
  }

  .footer-col a:hover {
    color: #fff;
  }

  .footer-bottom {
    margin-top: 25px;
    padding-top: 18px;
    font-size: 13px;
  }
}
</style>