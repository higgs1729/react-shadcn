import type { Preview } from '@storybook/nextjs-vite'
import { withThemeByClassName } from '@storybook/addon-themes'

import '../app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'error' fails the portable-story test run on any axe violation; used by
      // the `a11y` planned check (scripts/lib/check-registry.mjs). Default to
      // 'todo' (report without failing) everywhere else, e.g. `npm run storybook`.
      // Vite only exposes env vars to the browser bundle under import.meta.env
      // with a VITE_ prefix -- plain process.env.* is not defined client-side.
      test: import.meta.env.VITE_SB_A11Y_MODE === 'error' ? 'error' : 'todo',
    },
  },
  decorators: [
    // shadcn/ui dark mode toggles the `.dark` class on the <html> element.
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
