// Light-only for now. Dark theme tokens lived in globals.css's .dark block
// but were never properly designed; stripped until they get their own pass.
// Keeping this wrapper as a no-op so existing imports (and a future dark mode)
// have a single integration point to come back to.
function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { ThemeProvider }
