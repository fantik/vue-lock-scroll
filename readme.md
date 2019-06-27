# Vue lock scroll

> Vue/Nuxt body-scroll-lock implementation. Lock body scroll at all devices

[![NPM Version][npm-image]][npm-url]

## Install

```bash
npm i -S vue-scroll-lock
```

## Usage

```
import ScrollLock from 'vue-lock-scroll'

Vue.use(ScrollLock, options)
```
### Options
| Property        | Type           | Default  |
| ------------- |:-------------:| -----:|
| propName      | String | $scrollLock |
| gapedElements      | String      |   '' |

propName - recommended to use with $ prefix to prevent duplicate naming in component

gapedElements - when scroll locks scrollbar 
disappears so fixed element position change relative to scrollBar width. To prevent it you can pass gapedElements property with css selectors: '.header, .fixed-div, .absolute-div'

### Example
```
Vue.use(ScrollLock, {
  propName: '$locker',
  gapedElements: '.header'
})
```
Lock scroll:
```
this.$locker.lock(targetElement, options)
```

#### Options
```
this.$locker.lock(targetElement, {
    reserveScrollBarGap: true
})
```
targetElement - DOM element that can be scrolled
reserveScrollBarGap - add padding to elements in gapedElements string to prevent content jumping on lock/unlock scroll

** targetElement required in IOS devices

Unlock scroll with element:
```
this.$locker.unlock(targetElement)
```
Unlock all scroll locks:
```
this.$locker.unlockAll()
```
## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/vue-lock-scroll.svg
[npm-url]: https://www.npmjs.com/package/vue-lock-scroll
