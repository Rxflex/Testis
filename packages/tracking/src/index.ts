/**
 * Testis Analytics - High-Performance User Profiling & Analytics
 * Client-side tracking script
 */

interface TestisConfig {
  apiKey: string
  endpoint?: string
  visitorId?: string
  throttle?: number
  enableHeatmap?: boolean
  enableAutoTrack?: boolean
  debug?: boolean
}

interface EventData {
  type: 'pageview' | 'click' | 'mousemove' | 'scroll'
  timestamp: number
  url: string
  visitor_id: string
  data?: Record<string, any>
}

interface MouseCoordinate {
  x: number
  y: number
  t: number
}

class TestisTracker {
  private config: Required<TestisConfig>
  private visitorId: string
  private sessionId: string
  private mouseCoordinates: MouseCoordinate[] = []
  private lastMouseMove = 0
  private eventQueue: EventData[] = []
  private isUnloading = false

  constructor(config: TestisConfig) {
    this.config = {
      endpoint: 'https://collect.testis.com/collect',
      visitorId: 'auto',
      throttle: 100,
      enableHeatmap: true,
      enableAutoTrack: true,
      debug: false,
      ...config
    }

    this.visitorId = this.config.visitorId === 'auto' 
      ? this.generateVisitorId() 
      : this.config.visitorId
    
    this.sessionId = this.generateSessionId()

    this.init()
  }

  private init(): void {
    if (this.config.debug) {
      console.log('[Testis] Initialized with config:', this.config)
    }

    // Auto-track pageview on initialization
    if (this.config.enableAutoTrack) {
      this.pageview()
    }

    // Set up event listeners
    this.setupEventListeners()

    // Set up beforeunload handler for reliable event sending
    this.setupUnloadHandler()
  }

  private generateVisitorId(): string {
    // Try to get existing visitor ID from localStorage
    const stored = this.getStoredValue('testis_visitor_id')
    if (stored) return stored

    // Generate new visitor ID using browser fingerprinting
    const fingerprint = this.generateFingerprint()
    this.setStoredValue('testis_visitor_id', fingerprint)
    return fingerprint
  }

  private generateSessionId(): string {
    // Generate session ID (valid for browser session)
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    this.setStoredValue('testis_session_id', sessionId, true) // sessionStorage
    return sessionId
  }

  private generateFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Testis fingerprint', 2, 2)
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')

    // Simple hash function
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return 'visitor_' + Math.abs(hash).toString(36)
  }

  private getStoredValue(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  private setStoredValue(key: string, value: string, useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage
      storage.setItem(key, value)
    } catch {
      // Ignore storage errors
    }
  }

  private setupEventListeners(): void {
    // Click tracking
    document.addEventListener('click', this.handleClick.bind(this), true)

    // Scroll tracking
    let scrollTimeout: number
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => {
        this.handleScroll()
      }, 150)
    }, { passive: true })

    // Mouse movement tracking for heatmaps
    if (this.config.enableHeatmap) {
      document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true })
    }

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushEvents()
      }
    })
  }

  private setupUnloadHandler(): void {
    const handleUnload = () => {
      this.isUnloading = true
      this.flushEvents(true)
    }

    window.addEventListener('beforeunload', handleUnload)
    window.addEventListener('pagehide', handleUnload)
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    if (!target) return

    const data = {
      element_tag: target.tagName.toLowerCase(),
      element_id: target.id || undefined,
      element_class: target.className || undefined,
      element_text: target.textContent?.slice(0, 100) || undefined,
      x: event.clientX,
      y: event.clientY,
      page_x: event.pageX,
      page_y: event.pageY
    }

    this.track('click', data)
  }

  private handleScroll(): void {
    const scrollDepth = Math.min(
      (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight,
      1
    )

    const data = {
      scroll_depth: Math.round(scrollDepth * 100) / 100,
      scroll_y: window.scrollY,
      page_height: document.documentElement.scrollHeight,
      viewport_height: window.innerHeight
    }

    this.track('scroll', data)
  }

  private handleMouseMove(event: MouseEvent): void {
    const now = Date.now()
    
    // Throttle mouse movements
    if (now - this.lastMouseMove < this.config.throttle) {
      return
    }
    
    this.lastMouseMove = now

    // Add coordinate to batch
    this.mouseCoordinates.push({
      x: event.clientX,
      y: event.clientY,
      t: now
    })

    // Send batch when it gets large enough or after timeout
    if (this.mouseCoordinates.length >= 50) {
      this.sendMouseBatch()
    }
  }

  private sendMouseBatch(): void {
    if (this.mouseCoordinates.length === 0) return

    const data = {
      session_id: this.sessionId,
      coordinates: this.mouseCoordinates.slice(),
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight
    }

    this.track('mousemove', data)
    this.mouseCoordinates = []
  }

  public pageview(data?: Record<string, any>): void {
    const pageData = {
      page_title: document.title,
      referrer: document.referrer || undefined,
      user_agent: navigator.userAgent,
      screen_resolution: screen.width + 'x' + screen.height,
      viewport_size: window.innerWidth + 'x' + window.innerHeight,
      language: navigator.language,
      ...data
    }

    this.track('pageview', pageData)
  }

  public track(eventType: EventData['type'], data?: Record<string, any>): void {
    const event: EventData = {
      type: eventType,
      timestamp: Date.now(),
      url: window.location.href,
      visitor_id: this.visitorId,
      data
    }

    this.eventQueue.push(event)

    if (this.config.debug) {
      console.log('[Testis] Event tracked:', event)
    }

    // Send immediately for pageviews, batch others
    if (eventType === 'pageview' || this.eventQueue.length >= 5) {
      this.flushEvents()
    }
  }

  private flushEvents(useBeacon = false): void {
    if (this.eventQueue.length === 0) return

    const events = this.eventQueue.slice()
    this.eventQueue = []

    // Send mouse coordinates if any remain
    if (this.mouseCoordinates.length > 0) {
      this.sendMouseBatch()
    }

    // Send events
    events.forEach(event => {
      this.sendEvent(event, useBeacon)
    })
  }

  private sendEvent(event: EventData, useBeacon = false): void {
    const payload = JSON.stringify(event)
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey
    }

    if (useBeacon && navigator.sendBeacon) {
      // Use beacon API for reliability during page unload
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(this.config.endpoint, blob)
      
      if (this.config.debug) {
        console.log('[Testis] Event sent via beacon:', event.type)
      }
    } else {
      // Use fetch for normal requests
      fetch(this.config.endpoint, {
        method: 'POST',
        headers,
        body: payload,
        keepalive: this.isUnloading
      }).then(response => {
        if (this.config.debug) {
          console.log('[Testis] Event sent:', event.type, response.status)
        }
      }).catch(error => {
        if (this.config.debug) {
          console.error('[Testis] Failed to send event:', error)
        }
      })
    }
  }

  public enableHeatmap(): void {
    this.config.enableHeatmap = true
    if (!document.addEventListener) return
    
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true })
  }

  public disableHeatmap(): void {
    this.config.enableHeatmap = false
    // Note: Can't easily remove the specific listener, but it will be ignored
  }

  public setVisitorId(visitorId: string): void {
    this.visitorId = visitorId
    this.setStoredValue('testis_visitor_id', visitorId)
  }

  public getVisitorId(): string {
    return this.visitorId
  }

  public getSessionId(): string {
    return this.sessionId
  }
}

// Global API
interface TestisGlobal {
  (command: 'init', apiKey: string, config?: Partial<TestisConfig>): void
  (command: 'pageview', data?: Record<string, any>): void
  (command: 'track', eventType: string, data?: Record<string, any>): void
  (command: 'set', key: string, value: any): void
  q?: any[]
  instance?: TestisTracker
}

// Initialize global Testis object
declare global {
  interface Window {
    testis: TestisGlobal
  }
}

const testis: TestisGlobal = function(command: string, ...args: any[]) {
  if (command === 'init') {
    const [apiKey, config = {}] = args
    testis.instance = new TestisTracker({ apiKey, ...config })
    
    // Process queued commands
    if (testis.q) {
      testis.q.forEach((queuedArgs: any[]) => {
        testis.apply(null, queuedArgs)
      })
      testis.q = []
    }
    return
  }

  if (!testis.instance) {
    console.error('[Testis] Not initialized. Call testis("init", "your-api-key") first.')
    return
  }

  switch (command) {
    case 'pageview':
      testis.instance.pageview(args[0])
      break
    case 'track':
      testis.instance.track(args[0] as any, args[1])
      break
    case 'set':
      const [key, value] = args
      if (key === 'visitor_id') {
        testis.instance.setVisitorId(value)
      }
      break
    default:
      console.warn('[Testis] Unknown command:', command)
  }
}

// Handle pre-loaded queue
if (typeof window !== 'undefined') {
  if (window.testis && window.testis.q) {
    testis.q = window.testis.q
  }
  window.testis = testis
}

export default testis
export { TestisTracker, TestisConfig, EventData }