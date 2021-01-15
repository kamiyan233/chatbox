import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {setToken} from '@/core/apis'
import '@/utils/rem'
import './assets/reset.module.css'
import './assets/common.scss'
import store from './store'

import { Tabbar, TabbarItem, Button,Form,Field,List,Cell,NavBar,Image as VanImage,Toast } from 'vant';
// import { LazyLoad } from '@vant/lazyload';
const app = createApp(App).use(store).use(router).use(List).use(Cell).use(NavBar).use(VanImage).use(Toast)

app.use(Tabbar).use(Button).use(Form).use(Field);
app.use(TabbarItem);


let token
token = localStorage.getItem('token')
if (token) {
  setToken(token)
}

app.config.performance = true //性能追踪
app.mount('#app')
