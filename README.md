CSS Design System (Styling & Layout)
global.css
Responsible for: Global design tokens, color variables (neon themes, dark space backgrounds, borders), CSS resets, typography rules, scrollbar styling, and root layout containers.
loading.css
Responsible for: Keyframe animations, glow effects, and positioning for the startup loading screen.
left-bar-css.css (or left-bar.css)
Responsible for: The styling of the left sidebar, hover states, navigation item highlights, and mobile responsiveness for the navigation drawer.
main-screen.css
Responsible for: Flexbox alignments, chat bubble gradients, typing indicator bounce animations, quick-action card styling, responsive grid layouts, and preventing mobile viewport overflow.
right-bar-css.css (or right-bar.css)
Responsible for: Glassmorphism styling for the profile drawer, model selection cards, active radio states, and system operation indicators.
voice-visualizer-css.css (or voice-visualizer.css)
Responsible for: The glowing audio wave graphics, microphone pulse animations, and visualizer containers.
JavaScript Logic & Orchestrators (Behavior & APIs)
loading-js.js (or loading.js)
Responsible for: Controlling the timer or async check for the splash screen, hiding it once components are mounted.
left-bar-js.js (or left-bar.js)
Responsible for: Handling sidebar toggle events, menu selection highlights, and listening for system events (like turning the API status indicator red/green).
main-screen-js.js (or main-screen.js)
Responsible for: Core chat mechanics. It handles user submissions, randomized welcome greetings, message history logging, typing delays, API offline fallback alerts, and quick-prompt injections.
right-bar-js.js (or right-bar.js)
Responsible for: Managing active model toggles, handling user profile clicks, and updating system stats.
voice-visualization-js.js (or voice-visualization.js)
Responsible for: Handling microphone input streams, audio recording logic, and animating the voice visualizer canvas or DOM elements.
