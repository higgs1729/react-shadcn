import type { Preview } from "@storybook/nextjs-vite"
import { withThemeByClassName } from "@storybook/addon-themes"

import "../app/globals.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    // shadcn/ui dark mode toggles the `.dark` class on the <html> element.
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
}

export default preview
