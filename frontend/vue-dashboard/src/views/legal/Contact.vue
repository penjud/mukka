<template>
  <div class="contact-page">
    <v-container>
      <v-card class="pa-6">
        <h1 class="text-h4 mb-5">Contact MukkaAI</h1>
        
        <v-row>
          <v-col cols="12" md="6">
            <div class="contact-info mb-8">
              <h2 class="text-h5 mb-4">Get in Touch</h2>
              
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-4">mdi-email</v-icon>
                <div>
                  <div class="font-weight-bold">Email</div>
                  <a href="mailto:contact@mukka.example.com">contact@mukka.example.com</a>
                </div>
              </div>
              
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-4">mdi-phone</v-icon>
                <div>
                  <div class="font-weight-bold">Phone</div>
                  <div>+1 (555) 123-4567</div>
                </div>
              </div>
              
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-4">mdi-map-marker</v-icon>
                <div>
                  <div class="font-weight-bold">Address</div>
                  <div>
                    MukkaAI, Inc.<br>
                    123 AI Way, Suite 456<br>
                    Techville, CA 94000
                  </div>
                </div>
              </div>
              
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-4">mdi-clock</v-icon>
                <div>
                  <div class="font-weight-bold">Business Hours</div>
                  <div>Monday - Friday: 9:00 AM - 6:00 PM (PST)</div>
                </div>
              </div>
              
              <h2 class="text-h5 mt-8 mb-4">Connect With Us</h2>
              <div class="d-flex">
                <v-btn icon color="primary" class="mr-2">
                  <v-icon>mdi-twitter</v-icon>
                </v-btn>
                <v-btn icon color="primary" class="mr-2">
                  <v-icon>mdi-linkedin</v-icon>
                </v-btn>
                <v-btn icon color="primary" class="mr-2">
                  <v-icon>mdi-github</v-icon>
                </v-btn>
                <v-btn icon color="primary" class="mr-2">
                  <v-icon>mdi-youtube</v-icon>
                </v-btn>
              </div>
            </div>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-form class="contact-form">
              <h2 class="text-h5 mb-4">Send Us a Message</h2>
              
              <v-text-field
                label="Full Name"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                label="Email Address"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                class="mb-4"
              ></v-text-field>
              
              <v-select
                label="Subject"
                variant="outlined"
                prepend-inner-icon="mdi-help-circle"
                :items="[
                  'General Inquiry',
                  'Technical Support',
                  'Billing Question',
                  'Partnership Opportunity',
                  'Other'
                ]"
                class="mb-4"
              ></v-select>
              
              <v-textarea
                label="Message"
                variant="outlined"
                rows="5"
                counter
                prepend-inner-icon="mdi-message-text"
                class="mb-4"
              ></v-textarea>
              
              <v-checkbox
                label="I agree to the Privacy Policy and Terms of Service"
                class="mb-4"
              ></v-checkbox>
              
              <v-btn
                color="primary"
                block
                size="large"
              >
                Send Message
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
        
        <v-divider class="my-8"></v-divider>
        
        <div class="faq-section">
          <h2 class="text-h5 mb-6 text-center">Frequently Asked Questions</h2>
          
          <v-expansion-panels variant="accordion">
            <v-expansion-panel>
              <v-expansion-panel-title>How do I get started with MukkaAI?</v-expansion-panel-title>
              <v-expansion-panel-text>
                Getting started with MukkaAI is easy! Simply create an account, choose a plan that fits your needs, 
                and follow our quick start guide to begin using our AI services. Our intuitive interface makes it 
                simple to start benefiting from our technology right away.
              </v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title>What kind of support do you offer?</v-expansion-panel-title>
              <v-expansion-panel-text>
                We offer multiple tiers of support depending on your plan. All users have access to our extensive 
                documentation and community forums. Premium users receive priority email support, while Enterprise 
                customers benefit from dedicated account managers and 24/7 phone support.
              </v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title>How secure is my data with MukkaAI?</v-expansion-panel-title>
              <v-expansion-panel-text>
                Security is our top priority. We employ industry-standard encryption, regular security audits, 
                and strict access controls to protect your data. All data is stored in SOC 2 compliant data centers, 
                and we never share your information with third parties without your explicit consent.
              </v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title>Can I upgrade or downgrade my plan?</v-expansion-panel-title>
              <v-expansion-panel-text>
                Yes, you can change your plan at any time. When upgrading, the new features will be available immediately, 
                and you'll be billed the prorated difference. When downgrading, the changes will take effect at the start 
                of your next billing cycle.
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'Contact',
  
  metaInfo: {
    title: 'Contact Us - MukkaAI'
  }
}
</script>

<style scoped>
.contact-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
}
</style>
