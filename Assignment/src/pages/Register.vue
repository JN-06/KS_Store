<script>
import axios from "axios"

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      message: "",
      messageType: ""
    }
  },

  methods: {
    async register() {
      try {
        const res = await axios.post("https://ks-store.onrender.com/api/auth/register", {
          name: this.name,
          email: this.email,
          password: this.password
        })

        this.message = res.data.message || "Registration successful! Redirecting..."
        this.messageType = "success"

        setTimeout(() => {
          this.$router.push("/login")
        }, 800)

      } catch (err) {
        this.message =
          err.response?.data?.message || "Register failed. Please try again."
        this.messageType = "error"
      }
    }
  }
}
</script>

<template>
  <div class="auth-container">
    <h2>Register</h2>

    <div v-if="message" :class="['msg', messageType]">
      {{ message }}
    </div>

    <input v-model="name" placeholder="Name" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="register">Register</button>

    <p>
      Already have an account?
      <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>

<style>
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
    width: 92%;
    margin: 40px auto;
    padding: 22px 18px;
    border-radius: 14px;
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