<template>
  <md-card>
    <md-list>
      <md-list-item>
        <span class="md-list-item-text">Papiersammlung: {{paper}}</span>
      </md-list-item>
      <md-list-item>
        <span class="md-list-item-text">Kartonsammlung: {{cardboard}}</span>
      </md-list-item>
    </md-list>
  </md-card>
</template>

<script>
import axios from 'axios';

const ZhAbfallAPI = axios.create({
  //baseURL: '/erz/api/calendar',
  baseURL: 'https://cors-anywhere.herokuapp.com/openerz.herokuapp.com/api/calendar/',
  headers: {
    origin: window.location.protocol + '//' + window.location.host,
  }
});

function daysFromNow(dateStr){
  const abfallDate = new Date(dateStr)
  var timeDiff = Math.abs(abfallDate.getTime() - Date.now());
  var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
  if (diffDays == 1) return 'heute'
  else if (diffDays == 2) return 'morgen'
  else return `in ${diffDays} Tagen`
}

export default {
  name: 'panel',
  data() {
    return {
      paper: '',
      cardboard: '',
    };
  },
  created() {
    this.get_date('paper');
    this.get_date('cardboard')
  },
  methods: {
    get_date(entity) {
      const today = new Date(Date.now());
      ZhAbfallAPI.get(`/${entity}.json?zip=8046&start=${today.toISOString().substring(0,10)}&sort=date&offset=0&limit=1`).then((response) => {
        this[entity] = daysFromNow(response.data.result[0].date);
      }).catch((error) => { console.log(error); });
    },
  },
};
</script>

<style>
</style>
