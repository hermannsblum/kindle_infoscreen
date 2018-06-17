<template>
  <md-card>
    <md-card-header><div class="md-title">{{title}}</div></md-card-header>
    <md-list>
      <md-list-item
        v-for="item in items"
        :key="item.id"
        v-on:click="toggle_done(item)">
          <span class="md-list-item-text"
                v-bind:class="{ done: item.completed }">
              {{item.title}}</span>
      </md-list-item>
    </md-list>
  </md-card>
</template>

<script>
import axios from 'axios';

const wunderlistAPI = axios.create({
  baseURL: 'https://a.wunderlist.com/api/v1',
  headers: {
    'X-Access-Token': '0ed45c4664ed12436264d5f2327da7ab027b043c7cc4ea9a7f97e3b60678',
    'X-Client-ID': 'b83b48327a072923c6b0',
  },
});

export default {
  name: 'listitem',
  props: ['title', 'items'],
  methods: {
    toggle_done(item) {
      let newDoneState = true;
      if (item.completed) {
        newDoneState = false;
      }

      // now send the update
      wunderlistAPI.patch(`/tasks/${item.id}`, {
        completed: newDoneState,
        revision: item.revision,
      })
        .then((response) => {
          item.completed = newDoneState;
          item.revision = response.data.revision;
        });
    },
  },
};
</script>

<style>
.md-card {
  width: 250px;
  float: left;
  margin: 10px;
}
.done, .done:hover {
  text-decoration: line-through;
  color: #999999;
}
</style>
