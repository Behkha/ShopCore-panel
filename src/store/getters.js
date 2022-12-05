import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex)

export default {
    axios(state, getters) {
        return Axios.create({
            baseURL: `http://api.surprisechy.ratin.cloud/api`,
            // baseURL: `your api`,
            headers: {
              device:'panel',
              Authorization: 'Bearer ' + getters.getToken
            }
        })
    }
}
