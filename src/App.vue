<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-6">
          <listcard title="Einkaufsliste" :items="einkaufsliste" />
        </div>
        <div class="col-6">
          <listcard title="Keller" :items="keller" />
        </div>
      </div>
      <controlpanel />
    </div>

  </div>
</template>

<script>
import axios from 'axios';

import listcard from './components/listcard';
import controlpanel from './components/controlpanel';

const wunderlistAPI = axios.create({
  baseURL: 'https://a.wunderlist.com/api/v1',
  headers: {
    'X-Access-Token': '0ed45c4664ed12436264d5f2327da7ab027b043c7cc4ea9a7f97e3b60678',
    'X-Client-ID': 'b83b48327a072923c6b0',
  },
});

export default {
  name: 'app',
  components: {
    listcard,
    controlpanel,
  },
  data() {
    return {
      einkaufsliste: [],
      keller: [],
    };
  },
  created() {
    this.getEinkaufsliste();
    this.getKellerliste();
  },
  methods: {
    getEinkaufsliste() {
      // Einkaufsliste id is 291484578
      wunderlistAPI.get('/tasks?list_id=291484578')
        .then((response) => {
          this.einkaufsliste = response.data;
        });
    },
    getKellerliste() {
      // Keller list id is 292825371
      wunderlistAPI.get('/tasks?list_id=292825371')
        .then((response) => {
          this.keller = response.data;
        });
    },
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
