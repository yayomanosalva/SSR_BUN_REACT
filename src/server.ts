import { renderToString } from "react-dom/server";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { serve } from "bun";
import React from "react";
import App from "./App";
import { join } from "path";
import { ENV } from './config/env';

// Static file handler
async function handleStaticFile(path: string) {
  try {
    // Remove leading slash and use dist directory
    const cleanPath = path.replace(/^\//, '');
    const file = Bun.file(join(process.cwd(), cleanPath));
    const exists = await file.exists();
    
    if (!exists) {
      console.error(`File not found: ${cleanPath}`);
      return new Response('Not found', { status: 404 });
    }

    const ext = path.split('.').pop();
    const mimeType = ENV.MIME_TYPES[`.${ext}`] || 'application/octet-stream';

    return new Response(file, {
      headers: {
        'Content-Type': mimeType,
      },
    });
  } catch (error) {
    console.error('Static file error:', error);
    return new Response('Server error', { status: 500 });
  }
}

// HTML template generator
function generateStaticContent(url: string) {
  const htmlContent = renderToString(
    React.createElement(App, null, 
      React.createElement(RouterProvider, {
        router,
        context: {
          url
        }
      })
    )
  );

  const title = "SSR with Bun";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <script type="module" src="/dist/main.js"></script>
      </head>
      <body>
        <div id="root">${htmlContent}</div>
      </body>
    </html>
  `;
}

// Server handler
serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);
    
    // Handle static files
    if (url.pathname.startsWith('/dist/')) {
      return handleStaticFile(url.pathname);
    }

    // Handle HTML requests
    const content = generateStaticContent(url.pathname);
    return new Response(content, {
      headers: { 
        "Content-Type": "text/html",
        "Cache-Control": "no-store, must-revalidate",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  },
});

console.log("Server running on http://localhost:3000");