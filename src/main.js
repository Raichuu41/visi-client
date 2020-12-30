import Vue from 'vue';
import VTooltip from 'v-tooltip';
import Notifications from 'vue-notification';
import VModal from 'vue-js-modal';
import VueEvaInput from 'vue-eva-input';
import App from './App';
import router from './router';
import './index.css';
import vuetify from '@/plugins/vuetify';

Vue.use(VueEvaInput);
Vue.use(Notifications);
Vue.use(VTooltip, { defaultDelay: 500, defaultPlacement: 'bottom' });
Vue.use(VModal, { dialog: true, dynamic: true, injectModalsContainer: true });

Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
    router,
    vuetify,
}).$mount('#app');
