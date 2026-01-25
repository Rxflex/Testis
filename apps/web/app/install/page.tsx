'use client'

import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@testis/ui"
import { Button } from "@testis/ui"
import { 
  Code, 
  Copy, 
  CheckCircle,
  Globe,
  Key,
  Settings,
  AlertTriangle,
  ExternalLink,
  BarChart3
} from "lucide-react"
import { useState } from "react"

function CodeBlock({ title, code, language = "html" }: { title: string; code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8"
          >
            {copied ? (
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 mr-1" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </CardContent>
    </Card>
  )
}

function ApiKeySelector() {
  const [selectedKey, setSelectedKey] = useState('testis_default_key_12345')
  
  // Mock API keys - in real app, fetch from user's projects
  const apiKeys = [
    { id: '1', name: 'Default API Key', key: 'testis_default_key_12345', project: 'Default Project' },
    { id: '2', name: 'Production Key', key: 'testis_prod_key_67890', project: 'Production Site' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Select API Key
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedKey === apiKey.key
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setSelectedKey(apiKey.key)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{apiKey.name}</div>
                  <div className="text-xs text-muted-foreground">{apiKey.project}</div>
                </div>
                <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {apiKey.key.slice(-8)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Selected:</strong> {selectedKey}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function InstallPage() {
  const selectedApiKey = 'testis_default_key_12345'
  const collectorUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3001'

  const basicScript = `<!-- Testis Analytics Tracking Script -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${collectorUrl}/testis.js';
  script.async = true;
  script.setAttribute('data-api-key', '${selectedApiKey}');
  script.setAttribute('data-domain', window.location.hostname);
  document.head.appendChild(script);
})();
</script>`

  const advancedScript = `<!-- Testis Analytics - Advanced Configuration -->
<script>
window.testisConfig = {
  apiKey: '${selectedApiKey}',
  domain: window.location.hostname,
  trackPageViews: true,
  trackClicks: true,
  trackMouseMovements: true,
  trackScrolling: true,
  throttleMouseMovements: 100, // ms
  batchSize: 10,
  batchTimeout: 5000, // ms
  debug: false
};

(function() {
  var script = document.createElement('script');
  script.src = '${collectorUrl}/testis.js';
  script.async = true;
  document.head.appendChild(script);
})();
</script>`

  const reactExample = `import { useEffect } from 'react';

// Testis Analytics Hook
export function useTestisAnalytics() {
  useEffect(() => {
    // Load Testis script
    const script = document.createElement('script');
    script.src = '${collectorUrl}/testis.js';
    script.async = true;
    script.setAttribute('data-api-key', '${selectedApiKey}');
    script.setAttribute('data-domain', window.location.hostname);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      document.head.removeChild(script);
    };
  }, []);
}

// Usage in your App component
function App() {
  useTestisAnalytics();
  
  return (
    <div>
      {/* Your app content */}
    </div>
  );
}`

  const nextjsExample = `// pages/_app.js or app/layout.js
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Script
        src="${collectorUrl}/testis.js"
        strategy="afterInteractive"
        data-api-key="${selectedApiKey}"
        data-domain={typeof window !== 'undefined' ? window.location.hostname : ''}
      />
      <Component {...pageProps} />
    </>
  );
}`

  const verificationSteps = [
    {
      step: 1,
      title: "Add the tracking script",
      description: "Copy and paste the script into your website's <head> section"
    },
    {
      step: 2,
      title: "Deploy your changes",
      description: "Push your changes to production or refresh your local development server"
    },
    {
      step: 3,
      title: "Visit your website",
      description: "Navigate to your website to generate the first tracking events"
    },
    {
      step: 4,
      title: "Check the Realtime page",
      description: "Visit the Realtime page to see if your events are being tracked"
    }
  ]

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
              Add Testis Analytics to your website in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* API Key Selection */}
              <ApiKeySelector />

              {/* Basic Installation */}
              <CodeBlock
                title="Basic Installation"
                code={basicScript}
                language="html"
              />

              {/* Advanced Configuration */}
              <CodeBlock
                title="Advanced Configuration"
                code={advancedScript}
                language="html"
              />

              {/* Framework Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CodeBlock
                  title="React Example"
                  code={reactExample}
                  language="javascript"
                />
                <CodeBlock
                  title="Next.js Example"
                  code={nextjsExample}
                  language="javascript"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Verification Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verification Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {verificationSteps.map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                          {item.step}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Collector URL</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {collectorUrl}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Script Size</div>
                    <div className="text-xs text-muted-foreground">
                      ~8KB gzipped
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Performance</div>
                    <div className="text-xs text-muted-foreground">
                      &lt;5ms response time
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Globe className="h-3 w-3 mr-2" />
                    Manage Domains
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Key className="h-3 w-3 mr-2" />
                    API Keys
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3 className="h-3 w-3 mr-2" />
                    View Realtime
                  </Button>
                </CardContent>
              </Card>

              {/* Important Notes */}
              <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                        Important Notes
                      </h3>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• Place script in &lt;head&gt; for best performance</li>
                        <li>• Script loads asynchronously (non-blocking)</li>
                        <li>• GDPR compliant - no personal data stored</li>
                        <li>• Works with all modern browsers</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}