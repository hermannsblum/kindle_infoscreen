import m from 'mithril';
import { token, wifi, address, media_sources, groupname, refreshinterval } from './config.json';
import './style.css';

const errdiv = document.createElement('div');
const container = document.createElement('div');

document.body.appendChild(errdiv);
document.body.appendChild(container);

var Entities = {
  switches: [],
  lights: [],
  scenes: [],
  sensors: [],
  media_players: [],
  loadEntities: function () {
    // document.getElementById('error').textContent = 'loading...';
    m.request({
      url: `${address}/api/states`,
      headers: { authorization: 'Bearer ' + token },
    }).then((result) => {
      // document.getElementById('error').textContent = 'got result ...';
      // get entities of the watch group
      var entities = result.filter(({ entity_id }) => entity_id === `group.${groupname}`)[0]
        .attributes.entity_id;
      // get the states of these entities
      Entities.switches = [];
      entities
        .filter((entity_id) => entity_id.startsWith('switch'))
        .forEach((entity_id) => {
          Entities.switches.push(result.filter((item) => item.entity_id === entity_id)[0]);
        });
      Entities.lights = [];
      entities
        .filter((entity_id) => entity_id.startsWith('light'))
        .forEach((entity_id) => {
          Entities.lights.push(result.filter((item) => item.entity_id === entity_id)[0]);
        });
      Entities.scenes = [];
      entities
        .filter((entity_id) => entity_id.startsWith('scene'))
        .forEach((entity_id) => {
          Entities.scenes.push(result.filter((item) => item.entity_id === entity_id)[0]);
        });
      Entities.sensors = [];
      entities
        .filter((entity_id) => entity_id.startsWith('sensor'))
        .forEach((entity_id) => {
          Entities.sensors.push(result.filter((item) => item.entity_id == entity_id)[0]);
        });
      Entities.media_players = [];
      entities
        .filter((entity_id) => entity_id.startsWith('media_player'))
        .forEach((entity_id) => {
          Entities.media_players.push(result.filter((item) => item.entity_id == entity_id)[0]);
        });
      // document.getElementById('error').textContent = '';
    });
  },
};

class MediaPlayer {
  select_source(entity_id, source) {
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
  }
  view({ attrs: { attributes, entity_id, state } }) {
    var name = attributes.friendly_name || entity_id;
    name = attributes.media_title || name;
    var source_list = ['Off'];
    // custom filter for now
    if (media_sources && media_sources[entity_id]) {
      source_list = source_list.concat(media_sources[entity_id]);
    } else {
      source_list = source_list.concat(attributes.source_list);
    }
    return m(
      '.media_player',
      {
        style: {
          'background-color': state == 'off' ? 'white' : 'black',
          color: state == 'off' ? 'black' : 'white',
        },
      },
      [
        m('div', name),
        attributes.entity_picture &&
          m('img', {
            src: address + attributes.entity_picture,
          }),
        m(
          '.media_player_sources',
          source_list.map(function (source) {
            return m(
              'div',
              {
                style: {
                  'background-color': attributes.source == source ? 'black' : 'white',
                  color: attributes.source == source ? 'white' : 'black',
                  height: 170 / source_list.length + 'px',
                  'line-height': 170 / source_list.length + 'px',
                },
                onclick: () => {
                  MediaPlayer.select_source(entity_id, source);
                },
              },
              source
            );
          })
        ),
      ]
    );
  }
}

class Sensor {
  view({ attrs: { attributes, entity_id, state } }) {
    var name = attributes.friendly_name || entity_id;
    var unit = attributes.unit_of_measurement ? ` ${attributes.unit_of_measurement}` : '';
    return m('.sensor', [
      m('.sensorname', name),
      m('.sensorvalue', state + unit),
    ]);
  }
}

class Switch {
  view({ attrs: { attributes, entity_id, state } }) {
    var name = attributes.friendly_name || entity_id;
    return m(
      '.switch',
      {
        style: {
          'background-color': state == 'on' ? 'black' : 'white',
          color: state == 'on' ? 'white' : 'black',
        },
        onclick: () => {
          m.request({
            method: 'POST',
            url: `${address}/api/services/switch/${state == 'on' ? 'turn_off' : 'turn_on'}`,
            headers: { authorization: 'Bearer ' + token },
            data: { entity_id: entity_id },
          });
          state = state == 'on' ? 'off' : 'on';
          m.redraw();
        },
      },
      name
    );
  }
}

class Light {
  view({ attrs: { attributes, entity_id, state } }) {
    var name = attributes.friendly_name || entity_id;
    return m(
      '.light',
      {
        style: {
          'background-color': state == 'on' ? 'black' : 'white',
          color: state == 'on' ? 'white' : 'black',
        },
        onclick: () => {
          m.request({
            method: 'POST',
            url: `${address}/api/services/light/${state == 'on' ? 'turn_off' : 'turn_on'}`,
            headers: { authorization: 'Bearer ' + token },
            data: { entity_id: entity_id },
          });
          state = state == 'on' ? 'off' : 'on';
          m.redraw();
        },
      },
      name
    );
  }
}

class Scene {
  view({ attrs: { attributes, entity_id } }) {
    var name = attributes.friendly_name || entity_id;
    return m(
      '.scene',
      {
        style: {
          'background-color': 'white',
          color: 'black',
        },
        onclick: () => {
          m.request({
            method: 'POST',
            url: `${address}/api/services/scene/turn_on`,
            headers: { authorization: 'Bearer ' + token },
            data: { entity_id: entity_id },
          });
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
  view({ attrs: { label }, children }) {
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
        `${this.visible ? 'hide' : 'show'}${label ? ' ' + label : ''}`
      ),
      m('.overlay', { style: { display: this.visible ? 'block' : 'none' } }, children),
    ]);
  }
}

class Layout {
  oninit() {
    Entities.loadEntities();
  }
  view() {
    return m('div', [
      m(
        '.div',
        Entities.sensors.map((sensorData) => m(Sensor, sensorData))
      ),
      m(
        '.switch-row',
        Entities.switches.map((switchData) => m(Switch, switchData))
      ),
      m(
        '.light-row',
        Entities.lights.map((lightData) => m(Light, lightData))
      ),
      m(
        '.scene-row',
        Entities.scenes.map((sceneData) => m(Scene, sceneData))
      ),
      ...Entities.media_players.map((mediaPlayerData) => m(MediaPlayer, mediaPlayerData)),
      wifi ? m(Overlay, { label: 'wifi' }, m('img.wifi', { src: wifi })) : '',
    ]);
  }
}

m.mount(container, Layout);
// repeatedly poll the state
setInterval(Entities.loadEntities, refreshinterval * 1000);
