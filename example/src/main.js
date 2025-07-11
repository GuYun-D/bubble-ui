import Vue from 'vue'
import App from './App.vue'
import ZhultUi from '@zhult-ui/components'

Vue.config.productionTip = false
Vue.use(ZhultUi)

new Vue({
  render: (h) => h(App)
}).$mount('#app')
