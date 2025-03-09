<template>
  <div class="simple-footer">
    <div class="footer-content">
      <div class="copyright">
        <v-icon small color="info" class="me-2">mdi-information-outline</v-icon>
        MukkaAI &copy; {{ new Date().getFullYear() }}
      </div>
      <div class="links">
        <router-link :to="{name: 'PrivacyPolicy'}" class="footer-link">Privacy Policy</router-link>
        <router-link :to="{name: 'TermsOfService'}" class="footer-link">Terms of Service</router-link>
        <router-link :to="{name: 'Contact'}" class="footer-link">Contact</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleFooter'
}
</script>

<style scoped>
.simple-footer {
  width: 100%;
  padding: 12px 24px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.copyright {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
}

.links {
  display: flex;
}

.footer-link {
  margin-left: 20px;
  color: #3f51b5;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #303f9f;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .footer-content {
    flex-direction: column;
    gap: 10px;
  }
  
  .links {
    justify-content: center;
  }
  
  .footer-link {
    margin: 0 10px;
  }
}
</style>
