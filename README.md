# New Tab Chrome Extension

A beautiful Chrome extension that replaces your new tab page with a modern, React-based interface built with Next.js and Tailwind CSS.

## Features

- 🕐 Live time and date display
- 🔍 Google search integration
- 🔗 Quick links to popular websites
- 🌙 Dark/light theme toggle
- ⚡ Built with modern tech stack (React, Next.js, Tailwind CSS, shadcn/ui)

## Tech Stack

- **React 18** - UI library
- **Next.js 14** - React framework with static export
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **Bun** - Package manager

## Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start development server:
   ```bash
   bun run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view in browser.

## Building for Chrome Extension

1. Build the extension:
   ```bash
   bun run build
   ```

2. This creates a `build` folder with all necessary files for the Chrome extension.

## Installing the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `build` folder
4. The extension will now replace your new tab page!

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main new tab page
├── components/ui/         # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── lib/
│   └── utils.ts           # Utility functions
├── scripts/
│   └── build-extension.js # Extension build script
├── icons/                 # Extension icons
├── manifest.json          # Chrome extension manifest
├── next.config.js         # Next.js configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Customization

- **Quick Links**: Edit the `quickLinks` array in `app/page.tsx`
- **Styling**: Modify Tailwind classes or add custom CSS
- **Theme**: Customize colors in `tailwind.config.js` and `app/globals.css`
- **Permissions**: Update `manifest.json` if you need additional Chrome APIs 