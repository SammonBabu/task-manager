**Prompt for React.js Passwordless Auth Frontend (Notion Style)**

Please generate a complete, self-contained React.js application for a passwordless login and sign-up flow, adhering to the following specifications. The application should be provided as a single immersive code block.

**Overall Design & Styling (Notion Inspired):**

* **Font:** Use "Inter" for all text.
* **Color Palette:** Minimalist, clean, and professional. Use shades of gray, white, and a subtle accent color (e.g., a muted purple or blue, similar to Notion's primary button color).
* **Elements:** All interactive elements (buttons, input fields) should have rounded corners and subtle shadow/hover effects.
* **Layout:** Centered content, generous padding, and clean spacing. Responsive design is crucial, ensuring optimal viewing on mobile, tablet, and desktop. Avoid horizontal scrolling.
* **Icons:** Use `lucide-react` for icons where appropriate. If a specific icon is not available, use an inline SVG.
* **CSS Framework:** Use Tailwind CSS for all styling. Ensure the Tailwind CDN script is included.

**Core Functionality & User Flow:**

1.  **Login/Sign-up Page (`AuthPage`):**
    * **Email Input:** A prominent input field for the user to enter their email address.
    * **"Continue with Email" Button:** When clicked, it should:
        * Display a loading spinner.
        * Simulate (for now) sending an OTP and a Magic Link to the entered email.
        * Transition to an "OTP/Magic Link Sent" state on the same page.
    * **OTP Input:**
        * After "Continue with Email," display a 6-digit OTP input field.
        * Include a countdown timer (e.g., 60 seconds) indicating OTP validity.
        * A "Resend OTP" button should appear after the timer expires, enabling the user to request a new OTP.
        * A "Login with OTP" button to submit the entered OTP.
    * **Magic Link Instruction:** Below the OTP input, display a clear message like "Or, check your email for a magic link to log in instantly."
    * **Loading States:** Show a loading spinner during any asynchronous operations (e.g., "sending email," "verifying OTP").
    * **Error Messages:** Display user-friendly error messages for invalid email, incorrect OTP, or network issues. Use a custom modal/message box instead of `alert()`.

2.  **Onboarding Flow (for New Users):**
    * **Conditional Redirection:** If the user is identified as new (e.g., after successful OTP/Magic Link verification and no existing user data in Firestore), they should be redirected to the onboarding flow.
    * **Page 1: Name Input (`OnboardingName`):**
        * An input field for "Your Name".
        * A "Next" button to proceed.
        * A "Back" button (or similar navigation) to return to the previous step if applicable (though for a new user, this might be less critical).
    * **Page 2: Workspace Name Input (`OnboardingWorkspace`):**
        * An input field for "Workspace Name" (e.g., "My Team's Workspace").
        * A "Finish Setup" button.
        * A "Back" button to return to the name input page.
    * **Data Storage:** Upon completing the onboarding, simulate saving the user's name and workspace name to Firestore.

3.  **Dashboard/Main Application (`Dashboard`):**
    * A simple placeholder page indicating successful login and setup. Display a welcome message including the user's name and workspace name (if available).
    * A "Logout" button.

**Technical Requirements:**

* **React Components:**
    * `App.js`: The main component responsible for routing (using `switch` `case` for different views like `AuthPage`, `OnboardingName`, `OnboardingWorkspace`, `Dashboard`).
    * `AuthPage.js`: Handles email input, OTP input, and magic link instructions.
    * `OnboardingName.js`: Handles user name input.
    * `OnboardingWorkspace.js`: Handles workspace name input.
    * `Dashboard.js`: A simple placeholder for the main application.
    * `LoadingSpinner.js`: A reusable component for loading states.
    * `MessageBox.js`: A reusable modal component for displaying messages or confirmations instead of `alert()`.
* **State Management:** Use `useState` and `useContext` (or `Zustand` if you prefer, but `useContext` is sufficient for this scope) for managing application-wide state (e.g., `userId`, `userName`, `workspaceName`, `isAuthenticated`, `isNewUser`, `currentView`).
* **Firebase Integration (Client-Side):**
    * Initialize Firebase using `__firebase_config` and `__app_id`.
    * Implement `signInWithCustomToken` using `__initial_auth_token` for initial authentication, falling back to `signInAnonymously` if the token is not defined.
    * Use `onAuthStateChanged` to listen for authentication state changes and update the `isAuthenticated` state.
    * Simulate (for now) sending email links and OTPs. **Do not implement actual email sending or OTP generation on the frontend.** Instead, have placeholder functions that simulate success/failure after a delay.
    * Simulate (for now) Firestore operations for checking if a user is new and storing their name/workspace.
    * **Crucially, ensure all Firebase operations are performed *only after* authentication is ready (i.e., `onAuthStateChanged` has fired and `userId` is available).**
* **OTP Timer:** Implement a client-side countdown timer for the OTP, enabling the "Resend OTP" button when it expires.
* **URL Handling:** Simulate parsing URL parameters for magic links (e.g., `?mode=signIn&oobCode=...`) to determine if a magic link login is being attempted.
* **Error Handling:** Implement `try/catch` blocks for asynchronous operations and display errors using the `MessageBox` component.
* **Code Structure:**
    * All React components should be functional components using hooks.
    * Add extensive comments to explain logic, state management, and UI rendering.
    * Ensure the code is self-contained within a single React `App` component and exported as default.

**Placeholder Data & Simulation:**

* Since the backend is separate, simulate the following:
    * `sendSignInLinkToEmail(email)`: A function that resolves after a few seconds, simulating success.
    * `verifyOtp(email, otp)`: A function that resolves after a few seconds, simulating success for a hardcoded OTP (e.g., "123456") and failure otherwise.
    * `checkIfNewUser(userId)`: A function that randomly returns `true` or `false` to simulate new/existing users.
    * `saveUserData(userId, name, workspace)`: A function that resolves after a delay, simulating saving data to Firestore.

**Example Flow:**

1.  User lands on `AuthPage`.
2.  Enters email, clicks "Continue with Email".
3.  `AuthPage` transitions to show OTP input and "Magic Link" instruction. Timer starts.
4.  User enters OTP "123456" and clicks "Login with OTP".
5.  If `checkIfNewUser` returns `true`, user is redirected to `OnboardingName`.
6.  User enters name, clicks "Next", redirected to `OnboardingWorkspace`.
7.  User enters workspace, clicks "Finish Setup".
8.  `saveUserData` is simulated. User is redirected to `Dashboard`.
9.  If `checkIfNewUser` returns `false`, user is redirected directly to `Dashboard`.

---

-----

**Firebase Cloud Functions Backend (Passwordless Auth & User Management)**

Please generate the necessary Firebase Cloud Functions and outline the Firestore structure and Security Rules to support the passwordless login and sign-up flow. The focus is on robust, secure, and scalable backend logic.

**I. Firebase Project Setup & Configuration (Pre-requisites):**

  * Ensure you have a Firebase Project initialized with Cloud Functions and Firestore enabled.
  * You'll need a Blaze plan (pay-as-you-go) to use Cloud Functions for outbound network requests (like sending emails) and to increase quotas if needed.
  * Install Firebase CLI (`npm install -g firebase-tools`).
  * Initialize Cloud Functions in your project: `firebase init functions` (choose TypeScript for best practice).
  * Install necessary Node.js packages in your `functions` directory:
      * `firebase-admin` (already included by default)
      * `firebase-functions` (already included by default)
      * `nodemailer` (for sending emails via SMTP)
      * `cors` (for handling CORS if using HTTP callable functions or Express app)
      * `dotenv` (for local environment variables)
      * `otp-generator` (or a similar library for generating secure OTPs)
  * **Email Sending Service:** Lets use https://resend.com/nodejs for email services. check their documentation for more details

**II. Firestore Database Structure:**

Define the following collections and document structures in Firestore:

1.  **`otps` Collection:**

      * Purpose: Stores One-Time Passwords sent to users for verification.
      * Document ID: Auto-generated UUID for each OTP.
      * Fields for each document:
          * `email` (string): The email address the OTP was sent to.
          * `otpCode` (string): The generated 6-digit OTP.
          * `createdAt` (timestamp): Server timestamp when the OTP was created.
          * `expiresAt` (timestamp): Server timestamp when the OTP expires (e.g., `createdAt + 1 minute`).
          * `used` (boolean): `true` if the OTP has been successfully used, `false` otherwise. Default to `false`.
      * **TTL Policy:** Implement a Firestore TTL (Time-To-Live) policy on the `otps` collection using the `expiresAt` field. This will automatically delete expired OTP documents. (Configure this via Google Cloud Console -\> Firestore -\> TTL tab).

2.  **`users` Collection:**

      * Purpose: Stores additional user profile information beyond Firebase Auth.
      * Document ID: Firebase Authentication `uid` (matching `request.auth.uid` in security rules).
      * Fields for each document:
          * `email` (string): User's primary email.
          * `name` (string, optional): User's name, set during onboarding.
          * `workspaceName` (string, optional): User's workspace name, set during onboarding.
          * `onboarded` (boolean): `true` if the user has completed the onboarding flow, `false` otherwise. Default to `false`.
          * `createdAt` (timestamp): Server timestamp when the user document was created.
          * `lastLoginAt` (timestamp): Server timestamp of the last successful login.

**III. Firebase Security Rules (for Firestore):**

Write strict Firestore Security Rules for the `otps` and `users` collections.

1.  **`otps` Collection Rules:**

      * Allow creation: Only if `request.auth != null` (signed in with custom token/email link), the `email` field matches `request.auth.token.email`, `otpCode` is generated by the server (not client), `createdAt` and `expiresAt` are valid timestamps.
      * Allow read: Only if `request.auth != null` and the `email` field matches `request.auth.token.email`. Only allow read of *their own* OTPs.
      * Allow update: Only for the server to mark `used: true`. No client updates to `otpCode` or `expiresAt`.
      * Allow delete: Only by the server (or TTL policy).

2.  **`users` Collection Rules:**

      * Allow create: Only if `request.auth != null` and the document ID matches `request.auth.uid`. Also, allow initial creation if `onboarded` is `false`.
      * Allow read: Only if `request.auth != null` and the document ID matches `request.auth.uid`.
      * Allow update: Only if `request.auth != null`, the document ID matches `request.auth.uid`, and specifically allow updates to `name`, `workspaceName`, and `onboarded` (for completing onboarding). No other fields should be client-updatable.
      * Allow delete: No direct client deletion.

**IV. Firebase Cloud Functions (index.ts/js):**

Implement the following callable Cloud Functions and helper utilities:

1.  **`sendOtpAndMagicLink` (Callable HTTP Function):**

      * **Trigger:** Called by the frontend when a user enters their email and clicks "Continue".
      * **Input:** `data: { email: string }`
      * **Logic:**
        1.  **Input Validation:** Validate `email` format.
        2.  **Rate Limiting:** Implement basic rate limiting per IP or email to prevent abuse (e.g., using a Firestore counter or `express-rate-limit` if using an Express app for functions).
        3.  **OTP Generation:** Generate a random 6-digit OTP.
        4.  **OTP Storage:**
              * Calculate `expiresAt` (e.g., `Date.now() + 60 * 1000` for 1 minute TTL).
              * Save the `email`, `otpCode`, `createdAt`, `expiresAt`, and `used: false` to the `otps` collection.
        5.  **Magic Link Generation:**
              * Generate a Firebase Authentication email sign-in link using `admin.auth().generateSignInWithEmailLink()`.
              * Set `actionCodeSettings`:
                  * `url`: Your frontend's URL where the magic link is handled (e.g., `https://your-app.com/auth/magic-link`).
                  * `handleCodeInApp`: `true`.
                  * `iOS`, `android`: Optional, if you have mobile apps.
                  * `dynamicLinkDomain`: Optional, if using Firebase Dynamic Links.
              * **Crucial:** Ensure your frontend URL is whitelisted in Firebase Console -\> Authentication -\> Sign-in method -\> Authorized domains.
        6.  **Email Sending:**
              * Use `https://resend.com/nodejs` to send *one* email containing *both* the OTP and the Magic Link.
              * Subject: "Your Login Code & Magic Link for [Your App Name]"
              * Body:
                  * "Your One-Time Password (OTP) is: **[OTP\_CODE]** (Expires in 1 minute)."
                  * "Or, click this magic link to log in instantly: [MAGIC\_LINK\_URL]"
                  * Include a "Resend OTP" instruction (client-side managed).
        7.  **Response:** Return a success message (e.g., `{ success: true, message: "OTP and Magic Link sent to your email." }`). Handle errors (e.g., invalid email, email sending failure) and return appropriate error messages.

2.  **`verifyOtpAndLogin` (Callable HTTP Function):**

      * **Trigger:** Called by the frontend when a user submits an OTP.
      * **Input:** `data: { email: string, otp: string }`
      * **Logic:**
        1.  **Input Validation:** Validate `email` and `otp` format.
        2.  **Retrieve OTP:** Query the `otps` collection for an active, unused OTP matching the `email` and `otpCode`.
        3.  **OTP Validation:**
              * Check if OTP exists.
              * Check if OTP is `used: false`.
              * Check if `expiresAt` is in the future.
              * If any check fails, return an error (e.g., "Invalid or expired OTP.").
        4.  **Mark OTP as Used:** If valid, update the OTP document in Firestore to `used: true`.
        5.  **Firebase Authentication:**
              * Try to get user by email: `admin.auth().getUserByEmail(email)`.
              * If user exists:
                  * Generate a custom token for the existing user: `admin.auth().createCustomToken(user.uid)`.
                  * Check `users` collection to see if `onboarded: true`.
                  * Update `lastLoginAt` in the `users` collection.
              * If user does NOT exist (new user):
                  * Create a new user in Firebase Auth: `admin.auth().createUser({ email: email })`.
                  * Generate a custom token for the new user.
                  * Create a new document in the `users` collection with `uid`, `email`, `onboarded: false`, `createdAt`, `lastLoginAt`.
        6.  **Response:** Return the custom Firebase Auth token (`{ customToken: string, isNewUser: boolean, email: string }`).

3.  **`updateUserProfile` (Callable HTTP Function):**

      * **Trigger:** Called by the frontend during the onboarding process.
      * **Input:** `data: { name?: string, workspaceName?: string }` (These fields will be provided incrementally).
      * **Context:** `context.auth.uid` and `context.auth.token.email` will be available if the user is authenticated.
      * **Logic:**
        1.  **Authentication Check:** Ensure `context.auth` is present. If not, throw an unauthenticated error.
        2.  **Input Validation:** Validate `name` and `workspaceName` if provided.
        3.  **Update User Document:** Update the corresponding user document in the `users` collection (using `context.auth.uid` as the document ID) with the provided `name` and `workspaceName`.
        4.  **Mark Onboarding Complete:** If `name` and `workspaceName` are both provided (or based on your onboarding logic, e.g., if this is the final step), set `onboarded: true`.
        5.  **Response:** Return a success message (`{ success: true, message: "Profile updated." }`).

4.  **`getUserProfile` (Callable HTTP Function):**

      * **Trigger:** Called by the frontend to fetch user data for the dashboard.
      * **Input:** None.
      * **Context:** `context.auth.uid` will be available.
      * **Logic:**
        1.  **Authentication Check:** Ensure `context.auth` is present.
        2.  **Fetch User Data:** Retrieve the user's document from the `users` collection using `context.auth.uid`.
        3.  **Response:** Return the user's profile data (`{ name: string, workspaceName: string, email: string, onboarded: boolean }`). Handle cases where the user document might not exist yet (e.g., `onboarded: false` or initial login redirect).

**V. Helper Functions and Utilities:**

  * **Email Sender (`sendEmail`):** A helper function that encapsulates `https://resend.com/nodejs` logic.
      * Takes `to`, `subject`, `html` (or `text`) as arguments.
      * Uses Firebase `functions.config().mail.user` and `functions.config().mail.password`.
  * **OTP Generator (`generateOtp`):** A helper function that generates a secure, random 6-digit string.

**VI. Error Handling & Security Best Practices:**

  * **Input Validation:** Strictly validate all input on the backend (e.g., email format, OTP length).
  * **Authentication Check:** Always verify `context.auth` in callable functions to ensure the request is from an authenticated user.
  * **Authorization:** Ensure users can only access/modify their *own* data using `context.auth.uid`. Firestore Security Rules are critical here.
  * **Environment Variables:** Store sensitive information (like SMTP passwords) in Firebase environment configuration, not directly in code.
  * **Logging:** Use `console.log` and `console.error` for debugging and monitoring in Cloud Functions logs.
  * **Idempotency:** Consider making `sendOtpAndMagicLink` idempotent if multiple rapid clicks could cause issues.
  * **`cors`:** If you wrap your callable functions in an Express app, ensure proper CORS configuration to only allow requests from your frontend domain. For `https.onCall` functions, CORS is handled automatically by Firebase.

-----

Okay, this is an exciting challenge\! Creating a Notion-like tasks dashboard involves a blend of clean UI, intuitive interactions, and robust data handling.

Below is a single, immersive React.js code block that implements the Notion-like simple tasks dashboard. It includes:

  * **Overall Structure:** A basic `App` component with routing, and a `Dashboard` component that houses the task system.
  * **Notion Aesthetic:** Uses Tailwind CSS (via CDN for simplicity), Google Fonts (Inter), and `lucide-react` for icons, all styled to resemble Notion's clean design.
  * **Task Management:**
      * **Board View (Kanban):** Tasks grouped by status ("To Do", "In Progress", "Done").
      * **List View:** Tasks displayed in a simple list with sorting options.
      * **Quick Add Task:** A prominent input for quick task creation.
      * **Add/Edit Task Modal:** A modal for detailed task creation and editing (title, status, priority, due date, description).
      * **Task Card/Item:** Reusable components for displaying tasks in both views.
  * **Firebase/Firestore Simulation:** All Firestore operations (fetching, adding, updating, deleting tasks) are simulated using local state and `setTimeout` to mimic asynchronous API calls. This allows the frontend to be fully functional before you connect it to your actual backend.
  * **Context API:** Used for simple state management (user info, tasks, view mode).
  * **Responsiveness:** Basic responsiveness applied using Tailwind CSS.
  * **"My Ideas" Integration:**
      * Progress summary (tasks done, remaining).
      * Subtle background pattern (a very light texture).
      * Clear empty states for task lists.
      * Enhanced visual feedback for interactions (loading states, messages).

**Before you run this code:**

1.  **HTML Setup:** Create an `index.html` file in your public folder (or similar) and ensure it has a `div` with `id="root"`. This code provides the full `index.html` structure including CDN links.
2.  **Install Dependencies:**
    ```bash
    npm install react react-dom lucide-react react-datepicker
    # or
    yarn add react react-dom lucide-react react-datepicker
    ```
3.  **Basic React Project:** This code assumes you have a basic React project set up (e.g., created with `create-react-app` or Vite). Replace your `src/index.js` or `src/App.js` with the content provided below, ensuring the necessary `ReactDOM.createRoot` is used.

-----

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notion Clone - Passwordless & Tasks</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/react-datepicker/dist/react-datepicker.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f6f6f6; /* Light gray background */
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden; /* Hide main body scroll */
        }
        #root {
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        /* Custom styles for Notion-like UI */
        .notion-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease-in-out;
        }
        .notion-card:hover {
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
            transform: translateY(-1px);
        }
        .notion-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 14px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease-in-out;
            cursor: pointer;
            border: 1px solid transparent;
        }
        .notion-button.primary {
            background-color: #3649E9; /* Notion blue */
            color: white;
        }
        .notion-button.primary:hover {
            background-color: #2b3bcc;
        }
        .notion-button.secondary {
            background-color: #f0f0f0;
            color: #333;
        }
        .notion-button.secondary:hover {
            background-color: #e0e0e0;
        }
        .notion-input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
            transition: all 0.2s ease-in-out;
            font-size: 1rem;
            color: #333;
        }
        .notion-input:focus {
            outline: none;
            border-color: #3649E9;
            box-shadow: 0 0 0 2px rgba(54, 73, 233, 0.2);
        }
        .notion-select {
            appearance: none; /* Remove default arrow */
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 16px;
            padding-right: 30px; /* Make space for the custom arrow */
        }

        /* Subtle background pattern */
        .pattern-bg {
            background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="module">
        import React, { useState, useEffect, createContext, useContext, useRef } from 'https://esm.sh/react@18.2.0'
        import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client'
        import * as LucideIcons from 'https://esm.sh/lucide-react@0.379.0'
        import DatePicker from 'https://esm.sh/react-datepicker@6.9.0' // Make sure to install react-datepicker: npm install react-datepicker

        const {
            Circle, Gauge, CheckCircle2, ChevronDown, Minus, ChevronUp,
            LayoutDashboard, List, Plus, Edit, Trash2, CalendarDays,
            X, AlertCircle, Loader2, LogOut
        } = LucideIcons;

        // --- 1. AuthContext (from previous prompt, simplified for demo) ---
        const AuthContext = createContext(null);

        const AuthProvider = ({ children }) => {
            const [isAuthenticated, setIsAuthenticated] = useState(false);
            const [currentUser, setCurrentUser] = useState(null);
            const [isNewUser, setIsNewUser] = useState(false); // For onboarding flow
            const [userName, setUserName] = useState('');
            const [workspaceName, setWorkspaceName] = useState('');
            const [loadingAuth, setLoadingAuth] = useState(true);

            useEffect(() => {
                // Simulate Firebase auth state listener
                setLoadingAuth(true);
                setTimeout(() => {
                    const storedUser = JSON.parse(localStorage.getItem('notion_clone_user'));
                    if (storedUser && storedUser.uid) {
                        setIsAuthenticated(true);
                        setCurrentUser(storedUser);
                        setIsNewUser(!storedUser.onboarded); // Assume storedUser has 'onboarded' flag
                        setUserName(storedUser.name || '');
                        setWorkspaceName(storedUser.workspaceName || '');
                    }
                    setLoadingAuth(false);
                }, 500);
            }, []);

            const loginUser = (user, newUserFlag = false) => {
                const userData = { ...user, onboarded: !newUserFlag }; // Simulate onboarding status
                localStorage.setItem('notion_clone_user', JSON.stringify(userData));
                setIsAuthenticated(true);
                setCurrentUser(userData);
                setIsNewUser(newUserFlag);
                setUserName(userData.name || '');
                setWorkspaceName(userData.workspaceName || '');
            };

            const logoutUser = () => {
                localStorage.removeItem('notion_clone_user');
                setIsAuthenticated(false);
                setCurrentUser(null);
                setIsNewUser(false);
                setUserName('');
                setWorkspaceName('');
            };

            const completeOnboarding = (name, workspace) => {
                const updatedUser = { ...currentUser, name, workspaceName: workspace, onboarded: true };
                localStorage.setItem('notion_clone_user', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
                setUserName(name);
                setWorkspaceName(workspace);
                setIsNewUser(false); // Onboarding complete
            };

            return (
                <AuthContext.Provider value={{
                    isAuthenticated, currentUser, loginUser, logoutUser, loadingAuth,
                    isNewUser, completeOnboarding, userName, workspaceName
                }}>
                    {children}
                </AuthContext.Provider>
            );
        };

        // --- 2. Reusable UI Components ---

        const LoadingSpinner = ({ size = 24, className = 'text-gray-500' }) => (
            <Loader2 className={`animate-spin ${className}`} size={size} />
        );

        const MessageBox = ({ message, type = 'info', onClose }) => {
            if (!message) return null;
            const bgColor = {
                info: 'bg-blue-100 border-blue-400 text-blue-700',
                success: 'bg-green-100 border-green-400 text-green-700',
                error: 'bg-red-100 border-red-400 text-red-700',
            }[type];

            return (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg border ${bgColor} z-50 flex items-center gap-2 max-w-sm`}>
                    {type === 'error' && <AlertCircle size={20} />}
                    <span className="flex-grow">{message}</span>
                    {onClose && (
                        <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/10 transition">
                            <X size={16} />
                        </button>
                    )}
                </div>
            );
        };

        // --- 3. AuthPage, OnboardingName, OnboardingWorkspace (from previous prompt, simplified) ---
        const AuthPage = ({ onLogin }) => {
            const [email, setEmail] = useState('');
            const [otpInput, setOtpInput] = useState('');
            const [showOtpInput, setShowOtpInput] = useState(false);
            const [message, setMessage] = useState('');
            const [messageType, setMessageType] = useState('info');
            const [loading, setLoading] = useState(false);
            const [otpTimer, setOtpTimer] = useState(0);
            const timerRef = useRef(null);

            const startOtpTimer = () => {
                setOtpTimer(60);
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = setInterval(() => {
                    setOtpTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            };

            const handleEmailSubmit = async (e) => {
                e.preventDefault();
                setMessage('');
                setLoading(true);
                // Simulate backend call
                setTimeout(() => {
                    if (email.includes('@')) {
                        setMessage('OTP and Magic Link sent to your email (check console for OTP: 123456)');
                        setMessageType('success');
                        setShowOtpInput(true);
                        startOtpTimer();
                        console.log('Simulated OTP: 123456');
                    } else {
                        setMessage('Please enter a valid email address.');
                        setMessageType('error');
                    }
                    setLoading(false);
                }, 1500);
            };

            const handleOtpLogin = async (e) => {
                e.preventDefault();
                setMessage('');
                setLoading(true);
                // Simulate backend call
                setTimeout(() => {
                    if (otpInput === '123456' && otpTimer > 0) {
                        const isNew = email.endsWith('@newuser.com'); // Simulate new user based on email
                        onLogin({ uid: email, email: email, name: '', workspaceName: '', onboarded: !isNew }, isNew);
                    } else {
                        setMessage('Invalid or expired OTP.');
                        setMessageType('error');
                    }
                    setLoading(false);
                }, 1500);
            };

            const handleMagicLinkClick = () => {
                setMessage('Simulating magic link login...');
                setMessageType('info');
                setLoading(true);
                setTimeout(() => {
                    const isNew = email.endsWith('@newuser.com');
                    onLogin({ uid: email, email: email, name: '', workspaceName: '', onboarded: !isNew }, isNew);
                }, 2000);
            };

            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 pattern-bg">
                    <div className="notion-card p-8 w-full max-w-md text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Notion Clone</h2>
                        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />

                        {!showOtpInput ? (
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    className="notion-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" className="notion-button primary w-full" disabled={loading}>
                                    {loading ? <LoadingSpinner className="text-white" /> : 'Continue with Email'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleOtpLogin} className="space-y-4">
                                <p className="text-gray-600 mb-4">
                                    We've sent a 6-digit code and a magic link to <span className="font-semibold">{email}</span>.
                                </p>
                                <input
                                    type="text"
                                    className="notion-input text-center tracking-wider"
                                    placeholder="Enter OTP"
                                    maxLength="6"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                    required
                                />
                                <button type="submit" className="notion-button primary w-full" disabled={loading || otpTimer === 0}>
                                    {loading ? <LoadingSpinner className="text-white" /> : `Login with OTP ${otpTimer > 0 ? `(${otpTimer}s)` : '(Expired)'}`}
                                </button>
                                {otpTimer === 0 && (
                                    <button
                                        type="button"
                                        onClick={handleEmailSubmit}
                                        className="notion-button secondary w-full mt-2"
                                        disabled={loading}
                                    >
                                        Resend OTP
                                    </button>
                                )}
                                <p className="text-sm text-gray-500 mt-4">
                                    Or, check your email for a <span className="text-blue-600 cursor-pointer hover:underline" onClick={handleMagicLinkClick}>magic link</span> to log in instantly.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            );
        };

        const OnboardingName = ({ onNext }) => {
            const { userName, currentUser } = useContext(AuthContext);
            const [name, setName] = useState(userName || '');
            const [message, setMessage] = useState('');
            const [loading, setLoading] = useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!name.trim()) {
                    setMessage('Please enter your name.');
                    return;
                }
                setLoading(true);
                // Simulate save to backend (Firestore)
                setTimeout(() => {
                    setMessage('Name saved successfully!');
                    onNext(name);
                    setLoading(false);
                }, 1000);
            };

            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 pattern-bg">
                    <div className="notion-card p-8 w-full max-w-md text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">What's your name?</h2>
                        <MessageBox message={message} onClose={() => setMessage('')} />
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                className="notion-input"
                                placeholder="e.g., Jane Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <button type="submit" className="notion-button primary w-full" disabled={loading}>
                                {loading ? <LoadingSpinner className="text-white" /> : 'Next'}
                            </button>
                        </form>
                    </div>
                </div>
            );
        };

        const OnboardingWorkspace = ({ onFinish }) => {
            const { workspaceName, currentUser } = useContext(AuthContext);
            const [workspace, setWorkspace] = useState(workspaceName || '');
            const [message, setMessage] = useState('');
            const [loading, setLoading] = useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!workspace.trim()) {
                    setMessage('Please enter your workspace name.');
                    return;
                }
                setLoading(true);
                // Simulate save to backend (Firestore)
                setTimeout(() => {
                    setMessage('Workspace saved successfully!');
                    onFinish(workspace);
                    setLoading(false);
                }, 1000);
            };

            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 pattern-bg">
                    <div className="notion-card p-8 w-full max-w-md text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">What's your workspace name?</h2>
                        <MessageBox message={message} onClose={() => setMessage('')} />
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                className="notion-input"
                                placeholder="e.g., My Team's Workspace"
                                value={workspace}
                                onChange={(e) => setWorkspace(e.target.value)}
                                required
                            />
                            <button type="submit" className="notion-button primary w-full" disabled={loading}>
                                {loading ? <LoadingSpinner className="text-white" /> : 'Finish Setup'}
                            </button>
                        </form>
                    </div>
                </div>
            );
        };

        // --- 4. Dashboard & Task Components ---

        const TaskContext = createContext(null);

        const TaskProvider = ({ children }) => {
            const { currentUser } = useContext(AuthContext);
            const [tasks, setTasks] = useState([]);
            const [loadingTasks, setLoadingTasks] = useState(true);
            const [message, setMessage] = useState('');
            const [messageType, setMessageType] = useState('info');

            // Simulate Firestore real-time listener
            useEffect(() => {
                if (!currentUser || !currentUser.uid) return;

                setLoadingTasks(true);
                // Load tasks from localStorage (simulated Firestore)
                setTimeout(() => {
                    const storedTasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.uid}`)) || [];
                    setTasks(storedTasks.map(task => ({
                        ...task,
                        dueDate: task.dueDate ? new Date(task.dueDate) : null,
                        createdAt: new Date(task.createdAt),
                        updatedAt: new Date(task.updatedAt)
                    })));
                    setLoadingTasks(false);
                }, 800);
            }, [currentUser]);

            useEffect(() => {
                if (currentUser && currentUser.uid) {
                    localStorage.setItem(`tasks_${currentUser.uid}`, JSON.stringify(tasks));
                }
            }, [tasks, currentUser]);

            const showFeedback = (msg, type = 'info') => {
                setMessage(msg);
                setMessageType(type);
                setTimeout(() => setMessage(''), 3000);
            };

            const addTask = async (newTask) => {
                setLoadingTasks(true);
                return new Promise(resolve => {
                    setTimeout(() => {
                        const taskId = `task_${Date.now()}`;
                        const taskWithDefaults = {
                            id: taskId,
                            status: 'To Do',
                            priority: 'Low',
                            dueDate: null,
                            description: '',
                            ...newTask,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        setTasks(prev => [...prev, taskWithDefaults]);
                        showFeedback('Task added successfully!', 'success');
                        setLoadingTasks(false);
                        resolve(taskWithDefaults);
                    }, 500);
                });
            };

            const updateTask = async (taskId, updates) => {
                setLoadingTasks(true);
                return new Promise(resolve => {
                    setTimeout(() => {
                        setTasks(prev =>
                            prev.map(task =>
                                task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
                            )
                        );
                        showFeedback('Task updated successfully!', 'success');
                        setLoadingTasks(false);
                        resolve();
                    }, 500);
                });
            };

            const deleteTask = async (taskId) => {
                setLoadingTasks(true);
                return new Promise(resolve => {
                    setTimeout(() => {
                        setTasks(prev => prev.filter(task => task.id !== taskId));
                        showFeedback('Task deleted!', 'success');
                        setLoadingTasks(false);
                        resolve();
                    }, 500);
                });
            };

            return (
                <TaskContext.Provider value={{ tasks, loadingTasks, addTask, updateTask, deleteTask, message, messageType, showFeedback }}>
                    {children}
                </TaskContext.Provider>
            );
        };


        const ViewSwitcher = ({ currentView, onViewChange }) => (
            <div className="flex bg-gray-100 p-1 rounded-lg notion-card shadow-none border border-gray-200">
                <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${currentView === 'Board' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => onViewChange('Board')}
                >
                    <LayoutDashboard size={18} /> Board
                </button>
                <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${currentView === 'List' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => onViewChange('List')}
                >
                    <List size={18} /> List
                </button>
            </div>
        );

        const QuickAddTask = ({ onAddTask }) => {
            const [title, setTitle] = useState('');
            const [loading, setLoading] = useState(false);

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!title.trim()) return;
                setLoading(true);
                await onAddTask({ title: title.trim() });
                setTitle('');
                setLoading(false);
            };

            return (
                <form onSubmit={handleSubmit} className="relative mb-6">
                    <input
                        type="text"
                        className="notion-input pr-10 text-lg py-3"
                        placeholder="Add a new task..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-transparent hover:bg-gray-100 transition"
                        disabled={loading || !title.trim()}
                    >
                        {loading ? <LoadingSpinner size={20} /> : <Plus size={20} className="text-gray-500" />}
                    </button>
                </form>
            );
        };

        const TaskModal = ({ task, onClose, onSave }) => {
            const [formData, setFormData] = useState({
                title: task?.title || '',
                status: task?.status || 'To Do',
                priority: task?.priority || 'Low',
                dueDate: task?.dueDate || null,
                description: task?.description || ''
            });
            const [loading, setLoading] = useState(false);

            const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({ ...prev, [name]: value }));
            };

            const handleDateChange = (date) => {
                setFormData(prev => ({ ...prev, dueDate: date }));
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!formData.title.trim()) {
                    alert('Task title cannot be empty.'); // Use MessageBox in real app
                    return;
                }
                setLoading(true);
                await onSave(task?.id, formData);
                setLoading(false);
                onClose();
            };

            return ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="notion-card p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">{task ? 'Edit Task' : 'Add New Task'}</h2>
                            <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition">
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="notion-input"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="notion-input notion-select"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        className="notion-input notion-select"
                                        value={formData.priority}
                                        onChange={handleChange}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                                <DatePicker
                                    selected={formData.dueDate}
                                    onChange={handleDateChange}
                                    className="notion-input"
                                    dateFormat="MMM d, yyyy"
                                    isClearable
                                    placeholderText="Select a date"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    className="notion-input resize-y"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add more details about this task..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="notion-button secondary"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="notion-button primary"
                                    disabled={loading}
                                >
                                    {loading ? <LoadingSpinner className="text-white" /> : (task ? 'Save Changes' : 'Add Task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body // Portal to body to ensure it's on top
            );
        };


        const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
            const getStatusIcon = (status) => {
                switch (status) {
                    case 'To Do': return <Circle size={16} className="text-blue-500" />;
                    case 'In Progress': return <Gauge size={16} className="text-orange-500" />;
                    case 'Done': return <CheckCircle2 size={16} className="text-green-500" />;
                    default: return <Circle size={16} className="text-gray-500" />;
                }
            };

            const getPriorityIcon = (priority) => {
                switch (priority) {
                    case 'Low': return <ChevronDown size={16} className="text-green-500" />;
                    case 'Medium': return <Minus size={16} className="text-yellow-500" />;
                    case 'High': return <ChevronUp size={16} className="text-red-500" />;
                    default: return null;
                }
            };

            const getStatusBgColor = (status) => {
                switch (status) {
                    case 'To Do': return 'bg-blue-50';
                    case 'In Progress': return 'bg-orange-50';
                    case 'Done': return 'bg-green-50';
                    default: return 'bg-gray-50';
                }
            };

            const getPriorityBgColor = (priority) => {
                switch (priority) {
                    case 'Low': return 'bg-green-50';
                    case 'Medium': return 'bg-yellow-50';
                    case 'High': return 'bg-red-50';
                    default: return 'bg-gray-50';
                }
            };

            return (
                <div className="notion-card p-4 mb-3 flex flex-col gap-2 relative">
                    <h3 className="font-medium text-gray-800 text-base">{task.title}</h3>

                    {task.description && <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>}

                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${getStatusBgColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            <span className="capitalize">{task.status}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${getPriorityBgColor(task.priority)}`}>
                            {getPriorityIcon(task.priority)}
                            <span className="capitalize">{task.priority}</span>
                        </div>
                        {task.dueDate && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50">
                                <CalendarDays size={16} className="text-gray-500" />
                                <span>{task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={() => onEdit(task)} className="p-1 rounded-md hover:bg-gray-100 transition">
                            <Edit size={16} className="text-gray-500" />
                        </button>
                        <button onClick={() => onDelete(task.id)} className="p-1 rounded-md hover:bg-red-100 transition">
                            <Trash2 size={16} className="text-red-500" />
                        </button>
                    </div>

                    {/* Status Changer for Board View */}
                    <select
                        className="absolute bottom-2 left-2 p-1 text-sm bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value)}
                    >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
            );
        };

        const TaskListItem = ({ task, onEdit, onDelete, onStatusChange }) => {
            const getStatusIcon = (status) => {
                switch (status) {
                    case 'To Do': return <Circle size={16} className="text-blue-500" />;
                    case 'In Progress': return <Gauge size={16} className="text-orange-500" />;
                    case 'Done': return <CheckCircle2 size={16} className="text-green-500" />;
                    default: return <Circle size={16} className="text-gray-500" />;
                }
            };

            const getPriorityIcon = (priority) => {
                switch (priority) {
                    case 'Low': return <ChevronDown size={16} className="text-green-500" />;
                    case 'Medium': return <Minus size={16} className="text-yellow-500" />;
                    case 'High': return <ChevronUp size={16} className="text-red-500" />;
                    default: return null;
                }
            };

            return (
                <div className="notion-card p-4 flex items-center justify-between mb-2">
                    <div className="flex-grow">
                        <h3 className="font-medium text-gray-800 text-base">{task.title}</h3>
                        {task.description && <p className="text-gray-600 text-sm line-clamp-1">{task.description}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 min-w-[350px] justify-end">
                         {/* Status Dropdown */}
                        <select
                            className="p-1 text-sm bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer w-[120px]"
                            value={task.status}
                            onChange={(e) => onStatusChange(task.id, e.target.value)}
                        >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>

                        {/* Priority */}
                        <div className="flex items-center gap-1 w-[90px]">
                            {getPriorityIcon(task.priority)}
                            <span className="capitalize">{task.priority}</span>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-1 w-[100px]">
                            {task.dueDate && (
                                <>
                                    <CalendarDays size={16} className="text-gray-500" />
                                    <span>{task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </>
                            )}
                        </div>

                        <div className="flex gap-1 ml-4">
                            <button onClick={() => onEdit(task)} className="p-1 rounded-md hover:bg-gray-100 transition">
                                <Edit size={16} className="text-gray-500" />
                            </button>
                            <button onClick={() => onDelete(task.id)} className="p-1 rounded-md hover:bg-red-100 transition">
                                <Trash2 size={16} className="text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        };


        const Dashboard = () => {
            const { currentUser, userName, workspaceName, logoutUser } = useContext(AuthContext);
            const { tasks, loadingTasks, addTask, updateTask, deleteTask, message, messageType, showFeedback } = useContext(TaskContext);

            const [currentView, setCurrentView] = useState('Board'); // 'Board' or 'List'
            const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
            const [editingTask, setEditingTask] = useState(null);
            const [sortBy, setSortBy] = useState('createdAt'); // For List view
            const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

            const sortedTasks = [...tasks].sort((a, b) => {
                let valA, valB;
                if (sortBy === 'dueDate') {
                    valA = a.dueDate ? a.dueDate.getTime() : Infinity; // Nulls last
                    valB = b.dueDate ? b.dueDate.getTime() : Infinity;
                } else if (sortBy === 'priority') {
                    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    valA = priorityOrder[a.priority];
                    valB = priorityOrder[b.priority];
                } else { // createdAt
                    valA = a.createdAt.getTime();
                    valB = b.createdAt.getTime();
                }

                if (sortOrder === 'asc') {
                    return valA - valB;
                } else {
                    return valB - valA;
                }
            });

            const openTaskModal = (task = null) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
            };

            const closeTaskModal = () => {
                setIsTaskModalOpen(false);
                setEditingTask(null);
            };

            const handleSaveTask = async (taskId, formData) => {
                if (taskId) {
                    await updateTask(taskId, formData);
                } else {
                    await addTask(formData);
                }
            };

            const handleStatusChange = async (taskId, newStatus) => {
                await updateTask(taskId, { status: newStatus });
            };

            const getTasksByStatus = (status) => {
                return tasks.filter(task => task.status === status);
            };

            const tasksToDo = tasks.filter(t => t.status === 'To Do').length;
            const tasksInProgress = tasks.filter(t => t.status === 'In Progress').length;
            const tasksDone = tasks.filter(t => t.status === 'Done').length;

            return (
                <div className="flex h-screen bg-gray-50">
                    {/* Sidebar */}
                    <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between notion-card rounded-none shadow-none">
                        <div>
                            <div className="flex items-center gap-2 mb-8">
                                <LucideIcons.NotepadText size={24} className="text-blue-600" />
                                <h1 className="text-xl font-bold text-gray-800">Notion Clone</h1>
                            </div>
                            <nav className="space-y-2">
                                <a href="#" className="flex items-center gap-3 p-3 rounded-md text-gray-700 bg-gray-100 font-medium">
                                    <LucideIcons.ListTodo size={20} /> Tasks
                                </a>
                                {/* Add more sidebar links here */}
                            </nav>
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <p className="text-sm text-gray-600">Logged in as:</p>
                            <p className="font-semibold text-gray-800">{userName || currentUser?.email}</p>
                            {workspaceName && <p className="text-sm text-gray-600">Workspace: {workspaceName}</p>}
                            <button
                                onClick={logoutUser}
                                className="notion-button secondary w-full mt-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col p-8 overflow-auto pattern-bg">
                        <MessageBox message={message} type={messageType} onClose={() => showFeedback('')} />

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-800">My Tasks</h2>
                            <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
                        </div>

                        {/* Progress Summary */}
                        <div className="flex gap-4 mb-8 text-sm text-gray-600">
                            <div className="notion-card px-4 py-2 flex items-center gap-2">
                                <Circle size={18} className="text-blue-500" />
                                <span>{tasksToDo} To Do</span>
                            </div>
                            <div className="notion-card px-4 py-2 flex items-center gap-2">
                                <Gauge size={18} className="text-orange-500" />
                                <span>{tasksInProgress} In Progress</span>
                            </div>
                            <div className="notion-card px-4 py-2 flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-green-500" />
                                <span>{tasksDone} Done</span>
                            </div>
                        </div>

                        <QuickAddTask onAddTask={openTaskModal} />

                        {loadingTasks ? (
                            <div className="flex justify-center items-center h-full">
                                <LoadingSpinner size={48} className="text-blue-600" />
                                <span className="ml-4 text-gray-600">Loading tasks...</span>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <LucideIcons.Clipboard size={64} className="mb-4" />
                                <p className="text-xl font-medium mb-2">No tasks yet!</p>
                                <p className="text-center max-w-sm">
                                    Start by adding a new task above or clicking the 'Add a new task...' input.
                                </p>
                            </div>
                        ) : (
                            <>
                                {currentView === 'Board' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-auto p-1 -m-1">
                                        {['To Do', 'In Progress', 'Done'].map(status => (
                                            <div key={status} className="flex flex-col bg-gray-100 p-4 rounded-lg min-h-[200px]">
                                                <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center gap-2">
                                                    {status === 'To Do' && <Circle size={18} className="text-blue-500" />}
                                                    {status === 'In Progress' && <Gauge size={18} className="text-orange-500" />}
                                                    {status === 'Done' && <CheckCircle2 size={18} className="text-green-500" />}
                                                    {status} ({getTasksByStatus(status).length})
                                                </h3>
                                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                    {getTasksByStatus(status).length === 0 ? (
                                                        <p className="text-gray-500 text-sm text-center py-4">No tasks in this column.</p>
                                                    ) : (
                                                        getTasksByStatus(status).map(task => (
                                                            <TaskCard
                                                                key={task.id}
                                                                task={task}
                                                                onEdit={openTaskModal}
                                                                onDelete={deleteTask}
                                                                onStatusChange={handleStatusChange}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col flex-1 overflow-auto p-1 -m-1">
                                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
                                            <span>Sort by:</span>
                                            <select
                                                className="notion-input notion-select w-auto p-2"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                            >
                                                <option value="createdAt">Created At</option>
                                                <option value="dueDate">Due Date</option>
                                                <option value="priority">Priority</option>
                                            </select>
                                            <button
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                                className="p-2 rounded-md hover:bg-gray-100"
                                            >
                                                {sortOrder === 'asc' ? <LucideIcons.ArrowUp size={18} /> : <LucideIcons.ArrowDown size={18} />}
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                            {sortedTasks.map(task => (
                                                <TaskListItem
                                                    key={task.id}
                                                    task={task}
                                                    onEdit={openTaskModal}
                                                    onDelete={deleteTask}
                                                    onStatusChange={handleStatusChange}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {isTaskModalOpen && (
                            <TaskModal
                                task={editingTask}
                                onClose={closeTaskModal}
                                onSave={handleSaveTask}
                            />
                        )}
                    </div>
                </div>
            );
        };

        // --- 5. App Component (Router) ---
        const App = () => {
            const { isAuthenticated, isNewUser, loadingAuth, loginUser, completeOnboarding } = useContext(AuthContext);
            const [onboardingStep, setOnboardingStep] = useState(0); // 0: Name, 1: Workspace

            useEffect(() => {
                if (isAuthenticated && isNewUser) {
                    setOnboardingStep(0); // Reset for new user
                }
            }, [isAuthenticated, isNewUser]);

            if (loadingAuth) {
                return (
                    <div className="flex justify-center items-center min-h-screen bg-gray-50 pattern-bg">
                        <LoadingSpinner size={64} className="text-blue-600" />
                        <span className="ml-4 text-xl text-gray-700">Loading app...</span>
                    </div>
                );
            }

            if (!isAuthenticated) {
                return <AuthPage onLogin={loginUser} />;
            }

            if (isNewUser) {
                if (onboardingStep === 0) {
                    return <OnboardingName onNext={(name) => {
                        // In a real app, save name to backend here
                        setOnboardingStep(1);
                    }} />;
                } else if (onboardingStep === 1) {
                    return <OnboardingWorkspace onFinish={(workspace) => {
                        completeOnboarding(
                            JSON.parse(localStorage.getItem('notion_clone_user'))?.name || '', // Use current local name
                            workspace
                        );
                    }} />;
                }
            }

            // Authenticated and onboarded
            return (
                <TaskProvider>
                    <Dashboard />
                </TaskProvider>
            );
        };

        // --- Root Render ---
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
            <React.StrictMode>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </React.StrictMode>
        );

        // Custom scrollbar styles (Tailwind doesn't provide this directly)
        const style = document.createElement('style');
        style.innerHTML = `
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #f0f0f0;
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #c2c2c2;
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
        `;
        document.head.appendChild(style);

    </script>
</body>
</html>
```