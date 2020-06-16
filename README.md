# Home-Assisstant Interface That Runs in the Kindle Browser

![NPM Build](https://github.com/hermannsblum/kindle_infoscreen/workflows/Node.js%20CI/badge.svg)

<img height="30em" src="https://raw.githubusercontent.com/hermannsblum/kindle_infoscreen/master/example.jpg" />

# How to use

1. create a long-lived access token to your home-assistant in your [account profile](https://www.home-assistant.io/docs/authentication/#your-account-profile). This token will be saved locally on your kindle and used to log into home-assistant.

2. create a [group of entities](https://www.home-assistant.io/integrations/group/) you want to display on the kindle. Currently supported are sensors, switches and media players.

```yaml
# Example configuration.yaml entry
group:
  on_kindle:
    name: Kindle Entities
    entities:
      - switch.kitchen_pin_3
      - sensor.bedroom_temp
      - sensor.porch_temp
```

3. create a configuration file `src/config.json` for your kindle interface based on the [example config](https://github.com/hermannsblum/kindle_infoscreen/blob/master/src/config.json.example).

```json
// example config.json
{
  "token": "askjhdfkshdkf", // your long lived access token
  "wifi": "",  // see below
  "address": "http://hassio.local:8123",  // address of your home-assisstant WITHOUT trailing slash /
  "groupname": "on_kindle",  // the group configured above, you may choose any name
  "media_sources": {
    "media_player.your_media_player": ["Source 1", "Source 3"]  // optional, if you want to show only specific source options
  }
}
```

4. build the `index.html` file
```bash
npm install
npm run build
```

5. Copy the file to your kindle. Your kindle has to be connected via USB.
```bash
# example on Mac
cp dist/index.html /Volumes/Kindle/documents/index.html
```

6. Detach the kindle from USB and open the 'Beta-Browser'. Make sure that javascript and images are enabled. Navigate to 'file:////mnt/us/documents/index.html'. Done.
The screen reloads every 10s and will update automatically when new entities are added to the specified group on home-assistant.
