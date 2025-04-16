# Butter-Table 🧈

A React table library that is effortless for beginners yet limitless for power users. Butter-Table delivers a fully-styled, production-ready data-grid in one import, while exposing a headless core and plug-in system for deep customization.

## Features

- 🚀 **One-liner to production, zero-liner to customize**
- ⚡ **High performance** with built-in virtualization
- 🎨 **Theme-agnostic styling** that matches any design system
- 📦 **Lightweight** core with tree-shakable modules
- ♿ **Accessibility first** with keyboard navigation and ARIA support
- 📱 **Responsive** with mobile-friendly layouts

## Project Structure

```
/packages
  /butter-core        → Headless state + data-model (no React)
  /butter-virtual     → Thin wrapper around TanStack Virtual
  /butter-ui          → React 18 components that wrap core hooks
  /butter-theme-*     → Theme packages
/examples/            → Example implementations
/docs/                → Documentation site
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/butter-table.git
   cd butter-table
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development:
   ```bash
   npm run dev
   ```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details. 