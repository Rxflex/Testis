'use client'

import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@testis/ui"
import { Button } from "@testis/ui"
import { Copy, Check, Code, Globe, Zap } from "lucide-react"
import { useState } from "react"

export default function InstallPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedApiKey] = useState('test_key_12345') // In real app, get from user's account

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const scriptTag = `<script>
(function(t,e,s,i,s) {
  t[s]=t[s]||function(){(t[s].q=t[s].q||[]).push(arguments)};
  var n=e.createElement("script");n.async=1;n.src=i;
  e.getElementsByTagName("head")[0].appendChild(n);
})(window,document,"testis","https://your-domain.com/api/script/testis.js");

testis('init', '${selectedApiKey}');
testis('pageview');
</script>`

  const htmlExample = `<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
  ${scriptTag}
</head>
<body>
  <!-- Your content -->
</body>
</html>`

  const jsApiExamples = `// Track custom events
testis('track', 'button_click', {
  button_id: 'signup-btn',
  campaign: 'header-cta'
});

// Track with custom data
testis('track', 'purchase', {
  value: 99.99,
  currency: 'USD',
  product_id: 'prod_123'
});

// Set custom visitor properties
testis('set', 'visitor_id', 'user_12345');

// Manual pageview tracking
testis('pageview', {
  page_title: 'Custom Page Title',
  custom_property: 'value'
});`

  return (
    <>
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Install Tracking Script
            </h1>
            <p className="text-sm text-muted-foreground">
              Add Testis Analytics to your website with a simple script tag
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">High Performance</div>
                    <div className="text-xs text-muted-foreground">< 10KB gzipped</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">Zero Config</div>
                    <div className="text-xs text-muted-foreground">Works out of the box</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium text-sm">ES5 Compatible</div>
                    <div className="text-xs text-muted-foreground">All browsers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Installation Steps */}
          <div className="space-y-6">
            {/* Step 1: Basic Installation */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">1</span>
                  Basic Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add this script tag to the &lt;head&gt; section of your website:
                </p>
                
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{scriptTag}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(scriptTag, 'script')}
                  >
                    {copied === 'script' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-amber-500 mt-0.5">⚠️</div>
                    <div className="text-sm">
                      <div className="font-medium text-amber-600 dark:text-amber-400">Important</div>
                      <div className="text-muted-foreground mt-1">
                        Replace <code className="bg-muted px-1 rounded">your-domain.com</code> with your actual domain name.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: HTML Example */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">2</span>
                  Complete HTML Example
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Here's how it looks in a complete HTML document:
                </p>
                
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                    <code>{htmlExample}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(htmlExample, 'html')}
                  >
                    {copied === 'html' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Advanced Usage */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full text-sm flex items-center justify-center">3</span>
                  Advanced Usage (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Track custom events and add additional data:
                </p>
                
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                    <code>{jsApiExamples}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(jsApiExamples, 'api')}
                  >
                    {copied === 'api' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Options */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Configuration Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium mb-2">Basic Options</div>
                      <div className="space-y-2 text-muted-foreground">
                        <div><code className="bg-muted px-1 rounded">endpoint</code> - Custom collector URL</div>
                        <div><code className="bg-muted px-1 rounded">debug</code> - Enable console logging</div>
                        <div><code className="bg-muted px-1 rounded">visitorId</code> - Custom visitor ID</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-2">Advanced Options</div>
                      <div className="space-y-2 text-muted-foreground">
                        <div><code className="bg-muted px-1 rounded">enableHeatmap</code> - Mouse tracking</div>
                        <div><code className="bg-muted px-1 rounded">enableAutoTrack</code> - Auto pageviews</div>
                        <div><code className="bg-muted px-1 rounded">throttle</code> - Mouse event throttling</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="font-medium text-sm mb-2">Example with options:</div>
                    <pre className="text-xs overflow-x-auto"><code>{`testis('init', '${selectedApiKey}', {
  debug: true,
  enableHeatmap: true,
  throttle: 100
});`}</code></pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Verify Installation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    After installing the script, you can verify it's working:
                  </p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500/20 text-green-600 w-6 h-6 rounded-full text-xs flex items-center justify-center mt-0.5">✓</div>
                      <div>
                        <div className="font-medium">Check Browser Console</div>
                        <div className="text-muted-foreground">Enable debug mode and look for Testis log messages</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500/20 text-green-600 w-6 h-6 rounded-full text-xs flex items-center justify-center mt-0.5">✓</div>
                      <div>
                        <div className="font-medium">Monitor Dashboard</div>
                        <div className="text-muted-foreground">Visit your dashboard to see real-time visitor data</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500/20 text-green-600 w-6 h-6 rounded-full text-xs flex items-center justify-center mt-0.5">✓</div>
                      <div>
                        <div className="font-medium">Test Events</div>
                        <div className="text-muted-foreground">Click around your site and check if events appear in analytics</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}