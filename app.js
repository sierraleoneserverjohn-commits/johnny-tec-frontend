/**
 * JOHNNY TEC AI Assistant - Core Orchestrator
 * Asynchronously loads HTML components and initializes their respective JS.
 */
class AppOrchestrator {
    constructor() {
        this.appContainer = document.getElementById('app-root');
        this.init();
    }

    async init() {
        // 1. Mount Loading Screen
        await this.loadComponent('loading', 'loading-container');
        
        // Simulate initial system boot/API check
        setTimeout(async () => {
            // 2. Load Core Application UI
            await Promise.all([
                this.loadComponent('left-bar', 'left-sidebar-container'),
                this.loadComponent('main-screen', 'main-chat-container'),
                this.loadComponent('right-bar', 'right-sidebar-container')
            ]);
            
            // 3. Dismount Loading Screen smoothly
            this.dismountLoading();
        }, 2500); 
    }

    async loadComponent(componentName, targetElementId) {
        try {
            // Fetch HTML fragment
            const response = await fetch(`./components/${componentName}.html`);
            if (!response.ok) throw new Error(`Failed to load ${componentName}.html`);
            
            const html = await response.text();
            
            // Inject into DOM
            const target = document.getElementById(targetElementId);
            if (target) {
                target.innerHTML = html;
            } else {
                console.warn(`Target container #${targetElementId} not found.`);
                return;
            }

            // Dynamically load component-specific JS
            await this.loadScript(componentName);

        } catch (error) {
            console.error(`Error loading component [${componentName}]:`, error);
        }
    }

    loadScript(scriptName) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `./js/${scriptName}.js`;
            script.type = 'module'; // Ensures scoped variables
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    dismountLoading() {
        const loader = document.getElementById('loading-container');
        if (loader) {
            loader.style.transition = 'opacity 0.5s ease';
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    }
}

// Initialize Application on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.JTApp = new AppOrchestrator();
});
