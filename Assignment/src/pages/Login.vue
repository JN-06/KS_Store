<script>
import axios from "axios"

export default {
  data() {
    return {
      email: "",
      password: "",
      message: "",
      messageType: "" 
    }
  },

  methods: {
    async login() {
      try {
        const res = await axios.post("https://ks-store.onrender.com/api/auth/login", {
          email: this.email,
          password: this.password
        })

        localStorage.setItem("token", res.data.token)
        localStorage.setItem("role", res.data.user.role)
        localStorage.setItem("userId", res.data.user._id)

        this.message = "Login successful! Redirecting..."
        this.messageType = "success"

        setTimeout(() => {
          if (res.data.user.role === "admin") {
            this.$router.push("/admin")
          } else {
            this.$router.push("/account")
          }
        }, 800)

      } catch (err) {
        this.message =
          err.response?.data?.message || "Login failed. Please try again."
        this.messageType = "error"
      }
    }
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>Login</h2>

    <div v-if="message" :class="['msg', messageType]">
      {{ message }}
    </div>

    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="login">Login</button>

    <p>
      No account?
      <router-link to="/register">Register</router-link>
    </p>
  </div>
</template>

<style scoped>
.msg {
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.success {
  background: #e6ffed;
  color: #1a7f37;
  border: 1px solid #1a7f37;
}

.error {
  background: #ffe6e6;
  color: #b00020;
  border: 1px solid #b00020;
}

@media (max-width: 900px) {
  .auth-container {
    width: 90%;
    margin: 40px auto;
    padding: 25px 20px;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  }

  .auth-container h2 {
    font-size: 22px;
  }

  .auth-container input {
    padding: 11px 12px;
    font-size: 14px;
  }

  .auth-container button {
    padding: 11px;
    font-size: 15px;
  }

  .msg {
    font-size: 13px;
    padding: 8px;
  }
}
</style>