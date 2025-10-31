// login.js
export async function initLogin() {
  // Wait for DOM ready
  if (document.readyState === "loading") {
    await new Promise((resolve) =>
      document.addEventListener("DOMContentLoaded", resolve)
    );
  }

  // Dynamically load MSAL if not loaded
  await new Promise((resolve, reject) => {
    if (window.msal) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://alcdn.msauth.net/browser/2.34.0/js/msal-browser.min.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load MSAL script"));
    document.head.appendChild(script);
  });

  if (!window.msal) {
    console.error("MSAL library not loaded");
    return;
  }

  // Dummy configuration - TO DO
  // const msalConfig = {
  //   auth: {
  //     clientId: "00000000-0000-0000-0000-000000000000", // dummy clientId
  //     authority: "https://login.microsoftonline.com/common",
  //     redirectUri: window.location.origin,
  //   },
  // };

  // MSAL configuration
  const msalConfig = {
    auth: {
      clientId: "CLIENT_ID", // replace with Azure AD App Client ID
      authority: "https://login.microsoftonline.com/TENANT_ID", // replace with Tenant ID
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };

  // Create instance
  const msalInstance = new msal.PublicClientApplication(msalConfig);

  // Mock loginUser - to bypass authentication error
  // TO DO --> remove this Mock code once we have real endpoint & ID
  // msalInstance.loginPopup = ({ scopes }) => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve({
  //         account: {
  //           username: "test_user",
  //         },
  //       });
  //     }, 500); // simulate async login
  //   });
  // };

  // Attach login to .button element - TO DO (create an element specific to login button)
  const buttons = document.querySelectorAll(".login");
  // Null/empty check
  if (!buttons || buttons.length === 0) {
    console.warn("No Login button with class '.login' found — skipping login binding.");
    return;
  }
  buttons.forEach((btn) => {
    btn.classList.add("login-btn");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      msalInstance
        .loginPopup({ scopes: ["User.Read"] })
        .then((response) => {
          console.log("Login successful:", response.account);
          console.log(`Hello, ${response.account.username}`);

          // Replace the button text
          btn.textContent = `Hello, ${response.account.username.split(" ")[0]}`;

          // btn.disabled = true; // Optional - disable the button after login
          // location.reload(); // Optional - page refresh
        })
        .catch((error) => console.error("Login failed:", error));
    });
  });
}
