<template>
  <ProfileWizard>
    <BasePage>
      <template slot="header">
        {{ $vuetify.t('$vuetify.2sv.key.touch.header') }}
      </template>

      <p>
        {{ $vuetify.t('$vuetify.2sv.key.touch.info') }}
      </p>
      
      <figure class="layout column align-center pa-4">
        <img v-if="! touched" src="@/assets/touch-usb-security-key.png">
        <v-icon v-else color="success" x-large>check</v-icon>
      </figure>
    </BasePage>

    <ButtonBar>
      <v-btn to="/2sv/usb-security-key/insert" flat tabindex="-1"> 
        {{ $vuetify.t('$vuetify.global.button.back') }}
      </v-btn>

      <v-spacer></v-spacer>
    </ButtonBar>
  </ProfileWizard>
</template>

<script>
import ProfileWizard from '@/profile/ProfileWizard'
import u2f from './u2f-api.js'

export default {
  components: {
    ProfileWizard
  },
  data: () => ({
    mfa: {},
    touched: false,
  }),
  async created() {
    this.mfa = await this.$API.post('mfa', { type: 'u2f' })

    // https://fidoalliance.org/specs/fido-v2.0-rd-20180702/fido-client-to-authenticator-protocol-v2.0-rd-20180702.html#authenticatorMakeCredential  
    this.credential = await navigator.credentials.create({
      publicKey: {
        rp: {
          name: `IdP Profile Management (${this.$root.idpConfig.idpName})` //TODO: integrate translations here
        }, 
        challenge: toByteArray(this.mfa.data.challenge),
        user: {
          id: toByteArray(this.$user.uuid),
          name: this.$user.idp_username,
          displayName: `${this.$user.first_name} ${this.$user.last_name}`
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7 // https://www.iana.org/assignments/cose/cose.xhtml#algorithms
          }
        ],
        attestation: 'direct' // this causes additional interactions in the browser.
      }
    })
    console.log(this.credential.response)
    console.log(this.credential.response.attestationObject)
    console.log(new Uint8Array(this.credential.response.attestationObject))
    console.log(btoa(new Uint8Array(this.credential.response.attestationObject).reduce((s, n) => s += String.fromCharCode(n), '')))
    console.log(new Uint8Array(this.credential.response.clientDataJSON).reduce((s, n) => s += String.fromCharCode(n), ''))
    // console.log(btoa(new Uint8Array(this.credential.response.attestationObject).reduce((s, n) => s += String.fromCharCode(n), '')))
    // console.log(new Uint8Array(this.credential.response.attestationObject).reduce((s, n) => s += String.fromCharCode(n), ''))
    // const response = JSON.parse(new Uint8Array(this.credential.response.clientDataJSON).reduce((s, n) => s += String.fromCharCode(n), ''))
    // response.clientData = btoa(new Uint8Array(this.credential.response.attestationObject).reduce((s, n) => s += String.fromCharCode(n), ''))
    // await this.$API.put(`mfa/${this.mfa.id}/verify`, { value: response })

    this.touched = true
  
    // u2f.register(
    //   this.mfa.data.challenge.appId,
    //   [this.mfa.data.challenge],
    //   [],
    //   this.handleKeyResponse
    // )
  },
  methods: {
    handleKeyResponse: async function(response) {
      await this.$API.put(`mfa/${this.mfa.id}/verify`, { value: response })

      this.touched = true

      // pause for a moment so user can see the checkmark.
      // setTimeout(() => this.$router.push('/2sv/usb-security-key/confirmed'), 500)
    }
  }
}

const toByteArray = s => Uint8Array.from(btoa(s), c => c.charCodeAt(0))
</script>