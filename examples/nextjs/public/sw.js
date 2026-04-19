self.addEventListener("install", () => {
  console.log("[SW] Installed");
});

self.addEventListener("activate", () => {
  console.log("[SW] Activated");
});

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    // test
    const options = {
      body: data.body,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
