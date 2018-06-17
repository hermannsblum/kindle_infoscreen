<template>
  <md-card>
    <div class="full-control">
      <md-list>
        <md-list-item>
          <md-icon>movie_creation</md-icon>
          <span class="md-list-item-text">Beamer</span>
          <md-switch v-model="beamer" />
        </md-list-item>
      </md-list>
    </div>
  </md-card>
</template>

<script>
import axios from 'axios';

const hassioAPI = axios.create({
  baseURL: 'https://hassio.local:8123/api',
  headers: {
    'x-ha-access': 'D;]cZm=A2bkEf4u6FWrT',
  },
});

export default {
  name: 'panel',
  data() {
    return {
      beamer: false,
    };
  },
  created() {
    this.get_state('beamer');
  },
  methods: {
    get_state(entity) {
      hassioAPI.get(`/states/${entity}`).then((response) => {
        this[entity] = response.state;
      });
    },
  },
};
</script>

<style>
</style>
