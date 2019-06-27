/* safari helper */
const setAsyncTimeout = (cb, timeout = 0) => new Promise(resolve => {
  setTimeout(() => {
    cb()
    resolve()
  }, timeout)
})
let gapedDOMElements
export default class ScrollLock {
  static install (Vue, options) {
    /* define defaults options */
    const defaults = {
      propName: '$scrollLock',
      gapedElements: null
    }
    /* reassign defaults */
    const populated = Object.assign(defaults, options)
    if (Vue.prototype.hasOwnProperty(populated.propName)) return

    Object.defineProperty(Vue.prototype, populated.propName, {
      value: new ScrollLock(populated.gapedElements)
    })
  }

  constructor (gapedElements) {
    gapedDOMElements = gapedElements ? gapedElements.split(', ').map(el => document.querySelector(el)) : []
    /* define entry values */
    this.locks = []
    this.documentListenerAdded = false
    this.previousBodyPaddingRight = undefined
    this.initialClientY = -1
    this.init()
  }

  init () {
    /* test if window supports passive events */
    this.testPassiveEvents()
    /* check is IOS device */
    this.testIsIos()
  }

  testPassiveEvents () {
    const _this = this
    this.hasPassiveEvents = false
    if (typeof window !== 'undefined') {
      const passiveTestOptions = {
        get passive () {
          _this.hasPassiveEvents = true
          return undefined
        }
      }
      window.addEventListener('testPassive', null, passiveTestOptions)
      window.removeEventListener('testPassive', null, passiveTestOptions)
    }
  }

  testIsIos () {
    this.isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && /iP(ad|hone|od)/.test(window.navigator.platform)
  }

  isTouchMoveAllowed (el) {
    this.locks.some(lock => {
      return lock.options.allowTouchMove && lock.options.allowTouchMove(el)
    })
  }

  preventDefault (evt) {
    const e = evt || window.event

    // For the case whereby consumers adds a touchmove event listener to document.
    // Recall that we do document.addEventListener('touchmove', preventDefault, { passive: false })
    // in disableBodyScroll - so if we provide this opportunity to allowTouchMove, then
    // the touchmove event on document will break.
    if (this.isTouchMoveAllowed(e.target)) {
      return true
    }

    // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom)
    if (e.touches.length > 1) return true

    if (e.preventDefault) e.preventDefault()

    return false
  }

  isTargetElementTotallyScrolled (targetElement) {
    return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false
  }

  async setOverflowHidden (options) {
    // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
    // the responsiveness for some reason. Setting within a setTimeout fixes this.
    await setAsyncTimeout(() => {
      if (this.previousBodyPaddingRight === undefined) {
        const reserveScrollBarGap = !!options && options.reserveScrollBarGap === true
        const scrollBarGap = window.innerWidth - document.documentElement.clientWidth
        if (reserveScrollBarGap && scrollBarGap > 0) {
          this.previousBodyPaddingRight = document.body.style.paddingRight
          document.body.style.paddingRight = `${scrollBarGap}px`
          gapedDOMElements.forEach(el => {
            el.style.paddingRight = scrollBarGap + 'px'
          })
        }
      }

      // If previousBodyOverflowSetting is already set, don't set it again.
      if (this.previousBodyOverflowSetting === undefined) {
        this.previousBodyOverflowSetting = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      }
    })
  }
  async restoreOverflowSetting () {
    // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
    // the responsiveness for some reason. Setting within a setTimeout fixes this.
    await setAsyncTimeout(() => {
      if (this.previousBodyPaddingRight !== undefined) {
        document.body.style.paddingRight = this.previousBodyPaddingRight
        gapedDOMElements.forEach(el => {
          el.style.paddingRight = this.previousBodyPaddingRight
        })
        // Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
        // can be set again.
        this.previousBodyPaddingRight = undefined
      }

      if (this.previousBodyOverflowSetting !== undefined) {
        document.body.style.overflow = this.previousBodyOverflowSetting

        // Restore previousBodyOverflowSetting to undefined
        // so setOverflowHidden knows it can be set again.
        this.previousBodyOverflowSetting = undefined
      }
    })
  }

  handleScroll (event, targetElement) {
    const clientY = event.targetTouches[0].clientY - this.initialClientY

    if (this.allowTouchMove(event.target)) {
      return false
    }

    if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
      // element is at the top of its scroll
      return this.preventDefault(event)
    }

    if (this.isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
      // element is at the top of its scroll
      return this.preventDefault(event)
    }

    event.stopPropagation()
    return true
  }

  async lock (targetElement, options) {
    if (this.isIosDevice) {
      // targetElement must be provided, and disableBodyScroll must not have been
      // called on this targetElement before.
      if (!targetElement) {
        // eslint-disable-next-line no-console
        console.error('"lock" unsuccessful - targetElement must be provided when calling "lock" on IOS devices.')
        return
      }

      if (targetElement && !this.locks.some(lock => lock.targetElement === targetElement)) {
        const lock = {
          targetElement,
          options: options || {}
        }

        this.locks = [...this.locks, lock]

        targetElement.ontouchstart = event => {
          if (event.targetTouches.length === 1) {
            // detect single touch
            this.initialClientY = event.targetTouches[0].clientY
          }
        }
        targetElement.ontouchmove = event => {
          if (event.targetTouches.length === 1) {
            // detect single touch
            this.handleScroll(event, targetElement)
          }
        }

        if (!this.documentListenerAdded) {
          document.addEventListener('touchmove', this.preventDefault, this.hasPassiveEvents ? { passive: false } : undefined)
          this.documentListenerAdded = true
        }
      }
    } else {
      this.setOverflowHidden(options)
      const lock = {
        targetElement,
        options: options || {}
      }

      this.locks = [...this.locks, lock]
    }
  }

  async unlockAll () {
    if (this.isIosDevice) {
      // Clear all locks ontouchstart/ontouchmove handlers, and the references
      this.locks.forEach(lock => {
        lock.targetElement.ontouchstart = null
        lock.targetElement.ontouchmove = null
      })

      if (this.documentListenerAdded) {
        document.removeEventListener('touchmove', this.preventDefault, this.hasPassiveEvents ? { passive: false } : undefined)
        this.documentListenerAdded = false
      }

      this.locks = []

      // Reset initial clientY
      this.initialClientY = -1
    } else {
      await this.restoreOverflowSetting()
      this.locks = []
    }
  }

  async unlock (targetElement) {
    if (this.isIosDevice) {
      if (!targetElement) {
        // eslint-disable-next-line no-console
        console.error('"unlock" unsuccessful - targetElement must be provided when calling "unlock" on IOS devices.')
        return
      }

      targetElement.ontouchstart = null
      targetElement.ontouchmove = null

      this.locks = this.locks.filter(lock => lock.targetElement !== targetElement)

      if (this.documentListenerAdded && this.locks.length === 0) {
        document.removeEventListener('touchmove', this.preventDefault, this.hasPassiveEvents ? { passive: false } : undefined)

        this.documentListenerAdded = false
      }
    } else if (this.locks.length === 1 && this.locks[0].targetElement === targetElement) {
      await this.restoreOverflowSetting()

      this.locks = []
    } else {
      this.locks = this.locks.filter(lock => lock.targetElement !== targetElement)
    }
  }
}
