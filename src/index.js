import m from 'mithril';
import { token, wifi, address, media_sources } from './config.json';
import './style.css';

const errdiv = document.createElement('div');
const container = document.createElement('div');

document.body.appendChild(errdiv);
document.body.appendChild(container);

var Entities = {
  switches: [],
  sensors: [],
  media_players: [],
  loadEntities: function () {
    // document.getElementById('error').textContent = 'loading...';
    m.request({
      url: `${address}/api/states`,
      headers: { authorization: 'Bearer ' + token },
    }).then(function (result) {
      // document.getElementById('error').textContent = 'got result ...';
      // get entities of the watch group
      var entities = result.filter(function (item) {
        return item.entity_id == 'group.on_kindle';
      })[0].attributes.entity_id;
      // get the states of these entities
      Entities.switches = [];
      entities
        .filter(function (entity_id) {
          return entity_id.startsWith('switch');
        })
        .forEach(function (entity_id) {
          Entities.switches.push(
            result.filter(function (item) {
              return item.entity_id == entity_id;
            })[0]
          );
        });
      Entities.sensors = [];
      entities
        .filter(function (entity_id) {
          return entity_id.startsWith('sensor');
        })
        .forEach(function (entity_id) {
          Entities.sensors.push(
            result.filter(function (item) {
              return item.entity_id == entity_id;
            })[0]
          );
        });
      Entities.media_players = [];
      entities
        .filter(function (entity_id) {
          return entity_id.startsWith('media_player');
        })
        .forEach(function (entity_id) {
          Entities.media_players.push(
            result.filter(function (item) {
              return item.entity_id == entity_id;
            })[0]
          );
        });
      // document.getElementById('error').textContent = '';
    });
  },
};

var MediaPlayer = {
  select_source: function (entity_id, source) {
    if (source === 'Off') {
      m.request({
        method: 'POST',
        url: `${address}/api/services/media_player/turn_off`,
        headers: { authorization: 'Bearer ' + token },
        data: { entity_id: entity_id },
      });
    } else {
      m.request({
        method: 'POST',
        url: `${address}/api/services/media_player/select_source`,
        headers: { authorization: 'Bearer ' + token },
        data: { entity_id: entity_id, source: source },
      });
    }
  },
  view: function (vnode) {
    var attrs = vnode.attrs;
    var name = attrs.attributes.friendly_name || attrs.entity_id;
    name = attrs.attributes.media_title || name;
    var style = {
      'background-color': attrs.state == 'off' ? 'white' : 'black',
      color: attrs.state == 'off' ? 'black' : 'white',
    };
    var source_list = ['Off'];
    // custom filter for now
    if (media_sources && media_sources[attrs.entity_id]) {
      source_list = source_list.concat(media_sources[attrs.entity_id]);
    } else {
      source_list = source_list.concat(attrs.attributes.source_list);
    }
    return m(
      '.media_player',
      {
        style: style,
        onclick: function () {},
      },
      [
        m('div', name),
        attrs.attributes.entity_picture &&
          m('img', {
            src: address + attrs.attributes.entity_picture,
          }),
        m(
          '.media_player_sources',
          source_list.map(function (source) {
            return m(
              'div',
              {
                style: {
                  'background-color': attrs.attributes.source == source ? 'black' : 'white',
                  color: attrs.attributes.source == source ? 'white' : 'black',
                  height: 170 / source_list.length + 'px',
                  'line-height': 170 / source_list.length + 'px',
                },
                onclick: function () {
                  MediaPlayer.select_source(attrs.entity_id, source);
                },
              },
              source
            );
          })
        ),
      ]
    );
  },
};

var Sensor = {
  view: function (vnode) {
    var attrs = vnode.attrs;
    var name = attrs.attributes.friendly_name || attrs.entity_id;
    return m('.sensor', [
      m('.sensorname', name),
      m('.sensorvalue', attrs.state + ' ' + attrs.attributes.unit_of_measurement),
    ]);
  },
};

class Switch {
  view({ attrs }) {
    var name = attrs.attributes.friendly_name || attrs.entity_id;
    var style = {
      'background-color': attrs.state == 'on' ? 'black' : 'white',
      color: attrs.state == 'on' ? 'white' : 'black',
    };
    return m(
      '.switch',
      {
        style: style,
        onclick: () => {
          m.request({
            method: 'POST',
            url: `${address}/api/services/switch/${attrs.state == 'on' ? 'turn_off' : 'turn_on'}`,
            headers: { authorization: 'Bearer ' + token },
            data: { entity_id: attrs.entity_id },
          });
          attrs.state = attrs.state == 'on' ? 'off' : 'on';
          m.redraw();
        },
      },
      name
    );
  }
}

class Overlay {
  constructor() {
    this.visible = false;
  }
  toggle() {
    this.visible = !this.visible;
    m.redraw();
  }
  view({ attrs, children }) {
    var style = {
      'background-color': this.visible ? 'black' : 'white',
      color: this.visible ? 'white' : 'black',
    };
    return m('div', [
      m(
        '.overlaybutton',
        {
          style: style,
          onclick: () => {
            this.toggle();
          },
        },
        `${this.visible ? 'hide' : 'show'}${attrs.label ? ' ' + attrs.label : ''}`
      ),
      m('.overlay', { style: { display: this.visible ? 'block' : 'none' } }, children),
    ]);
  }
}

var ListOfSwitches = {
  oninit: Entities.loadEntities,
  view() {
    return m('div', [
      m(
        '.div',
        Entities.sensors.map(function (item) {
          return m(Sensor, item);
        })
      ),
      m(
        '.switch-row',
        Entities.switches.map(function (item) {
          return m(Switch, item);
        })
      ),
      ...Entities.media_players.map(function (item) {
        return m(MediaPlayer, item);
      }),
      wifi ? m(Overlay, { label: 'wifi' }, m('img.wifi', { src: wifi })) : '',
    ]);
  },
};

m.mount(container, ListOfSwitches);
// repeatedly poll the state
setInterval(Entities.loadEntities, 10000);
