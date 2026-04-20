"use client";

import { usePushNotifications } from "@jopgood/react-pwa";

export default function Home() {
  const {
    permission,
    isSupported,
    isSubscribed,
    subscription,
    swState,
    swUpdateAvailable,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    activateWaiting,
  } = usePushNotifications();

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          <code style={styles.code}>@jopgood/react-pwa</code>
        </h1>
        <p style={styles.subtitle}>Next.js App Router demo</p>
      </header>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>State</h2>
        <div style={styles.grid}>
          <StateRow
            label="isSupported"
            value={String(isSupported)}
            variant={isSupported ? "green" : "neutral"}
          />
          <StateRow
            label="swState"
            value={swState}
            variant={swStateVariant(swState)}
          />
          <StateRow
            label="permission"
            value={permission}
            variant={permVariant(permission)}
          />
          <StateRow
            label="isSubscribed"
            value={String(isSubscribed)}
            variant={isSubscribed ? "green" : "neutral"}
          />
          <StateRow
            label="isLoading"
            value={String(isLoading)}
            variant={isLoading ? "yellow" : "neutral"}
          />
          <StateRow
            label="error"
            value={error ? error.message : "null"}
            variant={error ? "red" : "neutral"}
          />
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Actions</h2>
        <div style={styles.actions}>
          <ActionButton
            label="Request Permission"
            onClick={requestPermission}
            disabled={permission !== "default" || isLoading}
          />
          <ActionButton
            label="Subscribe"
            onClick={subscribe}
            disabled={permission !== "granted" || isSubscribed || isLoading}
          />
          <ActionButton
            label="Unsubscribe"
            onClick={unsubscribe}
            disabled={!isSubscribed || isLoading}
            variant="danger"
          />
          <ActionButton
            label="Test Notification"
            onClick={async () => {
              const reg = await navigator.serviceWorker.ready;
              reg.showNotification("Test notification", {
                body: "Hello from @jopgood/react-pwa!",
              });
            }}
            disabled={permission !== "granted"}
          />
          {swUpdateAvailable && (
            <ActionButton
              label="Update Available — Activate"
              onClick={activateWaiting}
              variant="warning"
            />
          )}
        </div>
      </section>

      {subscription && (
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Subscription</h2>
          <pre style={styles.pre}>
            {JSON.stringify(subscription.toJSON(), null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}

// --- sub-components ---

function StateRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "green" | "red" | "yellow" | "neutral";
}) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span style={{ ...styles.badge, ...badgeColor[variant] }}>{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled = false,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "warning";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.button,
        ...(disabled ? styles.buttonDisabled : buttonVariant[variant]),
      }}
    >
      {label}
    </button>
  );
}

// --- helpers ---

function swStateVariant(s: string): "green" | "red" | "yellow" | "neutral" {
  if (s === "active") return "green";
  if (s === "error") return "red";
  if (s === "idle") return "neutral";
  return "yellow";
}

function permVariant(p: string): "green" | "red" | "yellow" | "neutral" {
  if (p === "granted") return "green";
  if (p === "denied") return "red";
  return "neutral";
}

// --- styles ---

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "2rem 1.5rem",
    fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
  },
  header: { marginBottom: "2rem" },
  title: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" },
  subtitle: { color: "#888", fontSize: "0.9rem" },
  code: {
    fontFamily: "var(--font-geist-mono, monospace)",
    background: "rgba(128,128,128,0.12)",
    padding: "0.1em 0.35em",
    borderRadius: 4,
  },
  card: {
    border: "1px solid rgba(128,128,128,0.2)",
    borderRadius: 8,
    padding: "1.25rem",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#888",
    marginBottom: "0.875rem",
  },
  grid: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "var(--font-geist-mono, monospace)",
    fontSize: "0.85rem",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: "0.2em 0.6em",
    borderRadius: 9999,
  },
  actions: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  button: {
    padding: "0.6rem 1rem",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
    transition: "opacity 0.15s",
  },
  buttonDisabled: {
    background: "rgba(128,128,128,0.15)",
    color: "#888",
    cursor: "not-allowed",
  },
  pre: {
    fontFamily: "var(--font-geist-mono, monospace)",
    fontSize: "0.75rem",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
};

const badgeColor: Record<string, React.CSSProperties> = {
  green: { background: "#d1fae5", color: "#065f46" },
  red: { background: "#fee2e2", color: "#991b1b" },
  yellow: { background: "#fef9c3", color: "#854d0e" },
  neutral: { background: "rgba(128,128,128,0.12)", color: "#888" },
};

const buttonVariant: Record<string, React.CSSProperties> = {
  primary: { background: "#171717", color: "#fff" },
  danger: { background: "#fee2e2", color: "#991b1b" },
  warning: { background: "#fef9c3", color: "#854d0e" },
};
