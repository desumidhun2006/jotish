# Employee Insights Dashboard

This project is a 4-screen employee insights dashboard built with React. It was developed as a solution to an advanced front-end engineering assignment, with a heavy focus on performance, security, and a deep understanding of browser APIs and the React rendering lifecycle.

## Core Engineering Constraints

This application was built under several hard constraints to demonstrate foundational engineering skills:

-   **Zero UI Libraries:** All components and styling were built from scratch using raw Tailwind CSS v4. No component libraries like MUI, Ant Design, or Bootstrap were used.
-   **Zero Core Logic Libraries:** All complex logic, including list virtualization, was implemented natively without relying on libraries like `react-window`.
-   **Git Integrity:** The project was developed with regular, meaningful commits following the Conventional Commits specification.

## Features & Architecture

1. **Secure Authentication (Login Page)**
   - Implemented via a custom React Context API (`AuthProvider`).
   - Protects routes (`/list`, `/details`, `/analytics`) from unauthorized access.
   - Persists session state across page reloads safely using `localStorage`.

2. **High-Performance Grid (List Page)**
   - Fetches data from the live API endpoint, specifically transforming the raw nested array-of-arrays into a clean, iterable object format on the client side.
   - Implements a **Custom Virtualization** engine (`useVirtualizer`) to render thousands of DOM nodes performantly.

3. **Identity Verification (Details Page)**
   - Integrates the browser's native **Camera API** (`getUserMedia`) to capture live video frames.
   - Uses an **HTML5 `<canvas>`** to capture user touch and mouse events for drawing a signature over the photo.
   - Programmatically merges the live video frame layer and the drawn signature layer into a single Base64 image export.

4. **Data Visualization (Analytics Page)**
   - Renders a dynamic bar chart using **strictly raw `<svg>` elements** and custom mathematical scale calculations (zero charting libraries).
   - Implements **Geospatial Mapping** using a performant, rate-limit-proof **Static Geocoding Dictionary** instead of relying on fragile live third-party geocoding APIs.

---

## Technical Explanation: Custom Virtualization

To ensure the employee list renders smoothly with thousands of rows, I implemented a custom list virtualization hook (`useVirtualizer`). This avoids the performance bottleneck of a naive `.map()` which would render thousands of DOM nodes at once.

The logic is based on creating an illusion for the browser's scroll container.

### The Virtualization Math

1.  **The Scrollable Window:** A container element is given a fixed height (e.g., `600px`) and `overflow-y: auto`. This is the viewport.

2.  **The Sizer Element:** Inside the viewport, a single child element is rendered with `position: relative`. Its height is programmatically set to the *total* height the list *would* have if all items were rendered (`totalHeight = items.length * itemHeight`). This is what creates a correctly-sized scrollbar.

3.  **Calculating the View:** On every scroll event (attached directly to the container), we capture the `scrollTop` value within a `requestAnimationFrame` to prevent layout thrashing and UI jank. We use this to calculate which items should be visible:
    -   `startIndex = Math.floor(scrollTop / itemHeight)`: This gives us the index of the first item that should be visible at the top of the viewport.
    -   `endIndex = startIndex + visibleItemCount`: We then calculate the end index based on how many items fit into the container's height. A small buffer (e.g., +2) is added to prevent flickering during fast scrolls.

4.  **Rendering and Positioning:** We slice the main `employees` array from `startIndex` to `endIndex`. This new, small array (e.g., ~15 items) is the only thing that gets rendered. Each rendered item is given `position: absolute` and a `top` style of `index * itemHeight`. This places it at the exact pixel offset it would occupy within the giant "Sizer" element, completing the illusion.

This ensures that no matter how large the dataset, the DOM remains lightweight and the application stays responsive.

---

## Intentional Vulnerability

As required by the assignment, this codebase contains one intentional logic bug.

-   **What is the bug?**
    A **Stale Closure** in a `useEffect` hook.

-   **Where is it located?**
    The bug is in the `EmployeeEngagementTracker` component, used on the `/details/:id` page. The `useEffect` hook that initializes a `setInterval` to track view duration has an empty dependency array `[]`.

    ```javascript
    // src/components/EmployeeEngagementTracker.js

    useEffect(() => {
      const timer = setInterval(() => {
        // The value of `secondsViewed` is "closed over" from the initial render (value: 0).
        // This closure is never updated, so this calculation is always `0 + 1`.
        setSecondsViewed(secondsViewed + 1); 
      }, 1000);

      return () => clearInterval(timer);
    }, []); // Empty dependency array causes the stale closure
    ```

-   **Why was this bug chosen?**
    I chose a stale closure because it represents a classic and subtle React-specific logic error. It doesn't crash the application or cause a re-render loop, making it harder to spot than more obvious performance issues. It demonstrates a deep understanding of how React's lifecycle, state, and JavaScript closures interact. An engineer unfamiliar with this concept would find the component "stuck" at 1 second and be unable to debug it easily. The fix requires knowledge of either the functional update form of `setState` (`setSecondsViewed(prev => prev + 1)`) or correctly managing the `useEffect` dependency array.

---

## Setup & Installation

This project utilizes Vite and Tailwind CSS v4.

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

**Login Credentials:**
- Username: `testuser`
- Password: `Test123`
