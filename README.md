# alt:V UI

In-game user interface of alt:V multiplayer.

## Event API

### Core -> UI

#### Connection

| Event                                       | Arguments                                                     | Description                                                                                                |
|:--------------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `connection:idle`                           |                                                               | Close connection UI                                                                                        |
| `connection:setServer`                      | `serverName: string`                                          | Set target joining server name                                                                             |
| `connection:connecting`                     | `serverName?: string`                                         | Set "Connecting to the server" stage (indeterminate progress bar).                                         |
| `connection:joining`                        |                                                               | Set "Joining the game" stage (indeterminate progress bar).                                                 |
| `connection:startingResources`              |                                                               | Set "Starting resources" stage (indeterminate progress bar).                                               |
| `connection:reloadingGameMap`               |                                                               | Set "Reloading game map" stage (indeterminate progress bar).                                               |
| `connection:preloadingMods`                 |                                                               | Set "Preloading mods" stage (indeterminate progress bar).                                                  |
| `connection:startingGame`                   | `progress: number, progressTotal: number`                     | Set "Starting the game" stage                                                                              |
| `connection:downloadingResources`           | `bytesDownloaded: number, bytesTotal: number, speed?: number` | Set "Downloading resources" stage. Speed in bytes                                                          |
| `connection:validatingResources`            | `resourcesValidated: number, resourcesTotal: number`          | Set "Validating resources" stage                                                                           |
| `connection:downloadingRuntimes`            | `bytesDownloaded: number, bytesTotal: number, speed?: number` | Set "Downloading runtimes" stage. Speed in bytes                                                           |
| `connection:validatingRuntimes`             | `bytesDownloaded: number, bytesTotal: number, speed?: number` | Set "Validating runtimes" stage. Speed in bytes                                                            |
| `connection:inQueue`                        | `message?: string`                                            | Set "In queue" stage. Message can be a localization string.                                                |
| `connection:downloadingAdditionalResources` | `bytesDownloaded: number, bytesTotal: number, speed?: number` | Set "Downloading additional resources" stage (for resources dl after join). Speed in bytes                 |
| `connection:validatingAdditionalResources`  | `bytesDownloaded: number, bytesTotal: number, speed?: number` | Set "Validating additional resources" stage (for resources validation after join). Speed in bytes          |
| `connection:disconnected`                   | `message: string`                                             | Set "Disconnected" stage. Message can be a localization string.                                            |
| `connection:failed`                         | `message: string, allowReconnect?: boolean`                   | Sets "Connection failed" state, which can be closed by Close button. Message can be a localization string. |
| `connection:connected`                      | `serverId?: string`                                           | Set UI into connected state and toggles UI off (if wasn't connected yet) by default.                       |
| `connection:requestPermissions`             | `required: number[], optional: number[]`                      | Open "Permission request" modal (not a connection stage). Permissions from enum.                           |

#### Console

| Event                      | Arguments                              | Description                                                                                |
|:---------------------------|----------------------------------------|--------------------------------------------------------------------------------------------|
| `console:push`             | `color: number, data: string`          | Pushes log to the console buffer                                                           |
| `console:end`              | `resource?: string, logType?: LogType` | Flushes log buffer. For log types see [LogType](src/stores/console.ts)                     |
| `console:reset`            |                                        | Resets log buffer                                                                          |
| `console:clear`            |                                        | Clears the console                                                                         |
| `console:open`             | `state?: boolean`                      | Changes console open state. Sets the state if the argument is provided, toggles otherwise. |
| `console:forceTransparent` |                                        | Forces the console into the semi-transparent state.                                        |


#### Servers

| Event                     | Arguments                        | Description                                                                     |
|:--------------------------|----------------------------------|---------------------------------------------------------------------------------|
| `servers:update`          | `servers: IServer[]`             | Updates server list. Core should emit `servers:setPing` for each server         |
| `servers:updateError`     | `error?: string`                 | Shows server list error. If message is not specified, it's an unspecified error |
| `servers:recent:update`   | `servers: IHistoryServer[]`      | Updates list of recent servers                                                  |
| `servers:favorite:update` | `servers: IHistoryServer[]`      | Updates list of favorite servers                                                |
| `serverData:update`       | `data: IServerData[]`            | Updates server cache (storage) data                                             |
| `serverData:updateOne`    | `data: IServerData`              | Updates server cache (storage) data for one server                              |
| `servers:setPing`         | `serverId: string, ping: number` | Updates server's ping. -1 is "N/A"                                              | 

#### Misc

| Event                           | Arguments                                                                               | Description                                                                                                                                                |
|:--------------------------------|-----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `settings:update`               | `newData: Record<string, any>`                                                          | Updates settings data. New data is applied on top, only keys that exist in the newData get updated. Keys that are not specified in newData are not deleted |
| `settings:devices:update`       | `devicesData: Record<string, string>`                                                   | Updates available input audio devices. Key is unique device identifier, value is device name                                                               |
| `settings:currentVolume:update` | `value: number`                                                                         | Sets current mic volume (level). Value is 0-100, it is used for preview in settings UI                                                                     |
| `version:update`                | `version: string, branch: string, lastIp?: string, debug?: boolean, earlyLoad: boolean` | Updates version and branch data.                                                                                                                           |
| `version:setRss`                | `rss?: string`                                                                          | Updates RSS feed.                                                                                                                                          |
| `version:setManifest`           | `manifest?: string`                                                                     | Updates client manifest. Manifest should be a JSON string.                                                                                                 |
| `version:ready`                 |                                                                                         | Indicates that core emitted all the initial version data                                                                                                   |
| `ui:ready`                      |                                                                                         | Indicates that game is ready (loaded) and enables UI                                                                                                       |
| `ui:toggle`                     | `state?: boolean`                                                                       | Closes/opens UI (F1 menu). Sets the state if argument is provided, toggles otherwise. Has effect only when connected to a server                           |
| `ui:startupProgress`            | `current: number, max: number`                                                          | Updates game startup progress. Only has effect if invoked before `ui:ready`                                                                                |
| `ui:setWatermarkPosition`       | `position: number`                                                                      | Sets watermark position (from enum).                                                                                                                       |
| `ui:setEarlyAuthState`          | `state: boolean`                                                                        | Toggles early auth UI overlay (only bg visible)                                                                                                            |
| `ui:customLocales`              | `data: string`                                                                          | Registers custom_locales.json content                                                                                                                      |
| `keydown`                       | `key: number`                                                                           | Emitted on a keydown                                                                                                                                       |

### UI -> Core

#### Connection
| Event                  | Arguments                                                                                                                           | Description                                                                                            |
|:-----------------------|-------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| `connection:connect`   | `host: string, port: number, cdnUrl: string, earlyAuthUrl: string, password: string, id: string, name: string, applyTheme: boolean` | Connect to the server                                                                                  |
| `connection:abort`     |                                                                                                                                     | Abort connection                                                                                       |
| `connection:accept`    | `permissions: string[]`                                                                                                             | Accept the connection (permission request). `permissions` only contains selected optional permissions. |
| `connection:deny`      |                                                                                                                                     | Deny the connection (permission request)                                                               |
| `connection:reconnect` |                                                                                                                                     | Reconnect to server (debug only)                                                                       |


#### Console

| Event                 | Arguments         | Description                            |
|:----------------------|-------------------|----------------------------------------|
| `console:execute`     | `command: string` | Fires when user has executed a command |
| `console:openLogFile` | ``                | Open current log file                  |
| `console:setState`    | `state: boolean`  | Force console closed/opened state      |

#### Servers

| Event                     | Arguments                  | Description                                                                      |
|:--------------------------|----------------------------|----------------------------------------------------------------------------------|
| `servers:favorite:add`    | `id: string, name: strnig` | Add server to favorites                                                          |
| `servers:favorite:remove` | `id: string`               | Remove server from favorites                                                     |
| `servers:reload`          |                            | Requests server list reload. Core should emit `servers:update` with the new data |
| `serverData:delete`       | `id: string, type: number` | Delete server cache. `id` is masterlist id. Type 0 - resources, type 1 - data    |

#### Misc

| Event                           | Arguments                 | Description                                                  |
|:--------------------------------|---------------------------|--------------------------------------------------------------|
| `ui:resetSkin`                  |                           | Resets UI skin                                               |
| `settings:change`               | `key: string, value: any` | Fires when user has changed a setting value                  |
| `settings:devices:reload`       |                           | Requests audio devices from core (`settings:devices:update`) |
| `settings:currentVolume:toggle` | `state: boolean`          | Sets if Core should emit `settings:currentVolume:update`     |
| `loaded`                        |                           | Fires when UI is loaded and ready to receive data            |
| `exit`                          |                           | Fires when user decided to exit the game                     |

## Example event flow

### Startup

- UI --> Core `loaded`
- UI <-- Core `version:update` `"14.0", "release"`
- UI <-- Core `version:setManifest` `manifest content` (in case of launcher skin being used)
- UI <-- Core `version:ready`
- UI <-- Core `version:setRss` `rss content`
- UI <-- Core `settings:update` `{ ...settings data... }`
- UI <-- Core `serverData:update` `[ ...server data (cache) info list... ]`
- UI <-- Core `servers:recent:update` `[ ...recent servers list... ]`
- UI <-- Core `servers:favorite:update` `[ ...favorite servers list... ]`
- UI <-- Core `servers:update` `[ ...servers list... ]`
- UI <-- Core `ui:ready`

### Server connection

- UI --> Core `connection:connect` `connection arguments`
- UI <-- Core `connection:setServer` `"127.0.0.1"` (not required if connection wasn't initiated by UI)
- UI <-- Core `connection:connecting`
- UI <-- Core `connection:downloadingResources` `10, 10`
- UI <-- Core `connection:validatingResources` `10, 10`
- UI <-- Core `connection:connected`

## RSS

If RSS feed `title` is an empty string, localized LATEST_NEWS key will be used instead.<br>

### Used RSS feed item properties
- `title` - shown at the top of the post, optional
- `link` - opened in browser when user clicks on the post, optional
- `pubDate` - shown as a localized date at the bottom
- `description` - post content (HTML allowed, only some selected special elements are available)
- `dc:creator` - shown at the bottom above the date, optional (HTML allowed, see info below)

### HTML in RSS

**Allowed tags:** address, article, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, blockquote, dd, div, dl, dt, figcaption, figure, hr, li, main, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kbd, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, u, var, wbr, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, img, del

#### Special elements

#### Spoiler
```html
<span data-spoiler>content</span>
```
Acts as a Discord spoiler (hidden until user clicks on it)

#### Localized string
```html
<span data-localized="localization argument">LOCALIZATION_KEY</span>
<span data-localized>LOCALIZATION_KEY</span>
```
Shows localized string, optionally providing an argument (`{0}` in the localization will be replaced with the content of `data-localized`).
<br>Allowed in both `description` and `dc:creator` fields.

#### Timestamp
```html
<span data-timestamp="F">1675455031</span>
```
Acts as a Discord timestamp, shows timestamp in user's timezone. Span content is a unix timestamp (in seconds), attribute value is Discord timestamp style ([docs](https://discord.com/developers/docs/reference#message-formatting-timestamp-styles)). If attribute value is not specified (just `data-dimestamp`) then default style `f` is used.


#### Mention
```html
<span data-mention="255, 0, 0">@someone</span>
```
Displays Discord-style mention. Attribute value is RGB color values 0-255 separated with comma. If no value is specified (just `data-mention`), then Discord's default mention color is used.

#### Emoji
```html
<img data-emoji src="https://emoji/icon/url.png" alt="emojiname">
```
Display image as a small (1.375em in height) inline element
<br>Allowed in both `description` and `dc:creator` fields.

#### Quote
```html
<blockquote>quote content</blockquote>
```
Displays Discord-style quote.


#### Inline code
```html
<code>Inline code</code>
```
Displays Discord-style code line. (\`code\`)

#### Code block
```html
<pre>
    <code>
        Multi line
        Code block
    </code>
</pre>
```
Displays Discord-style code block (\`\`\`code\`\`\`, any `code` element enclosed in `pre`)

#### Images row
```html
<span data-images>
    <img src="https://image/one/url.png" alt="image one">
    <img src="https://image/two/url.png" alt="image two">
    <img src="https://image/three/url.png" alt="image three">
</span>
```
Displays horizontally scrolled image row (scrolled only if overflowed). Recommended for media display.