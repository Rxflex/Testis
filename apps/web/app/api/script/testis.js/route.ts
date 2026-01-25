import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Read the compiled tracking script
    const scriptPath = join(process.cwd(), '../../packages/tracking/dist/testis.js')
    const script = await readFile(scriptPath, 'utf-8')

    // Set appropriate headers for JavaScript delivery
    const headers = new Headers({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    })

    return new NextResponse(script, { headers })

  } catch (error) {
    console.error('Error serving tracking script:', error)
    
    // Return a minimal fallback script
    const fallbackScript = `
      console.warn('[Testis] Tracking script not available');
      window.testis = window.testis || function() {
        console.warn('[Testis] Tracking disabled - script not loaded');
      };
    `

    return new NextResponse(fallbackScript, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
      }
    })
  }
}