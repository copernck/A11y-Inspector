class A11yEngine {
    constructor() {
        this.results = {
            issues: [],
            warnings: [],
            passed: [],
            timestamp: new Date().toISOString()
        };
        this.overlay = null;
        this.highlights = [];
        this.toolbar = null;
        this.panel = null;
        this.isActive = false;
        
        this.initializeMessageListener();
        this.createOverlay();
    }

    initializeMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'quickScan':
                    this.performQuickScan().then(sendResponse);
                    return true;
                case 'detailedScan':
                    this.performDetailedScan().then(sendResponse);
                    return true;
                case 'highlightIssues':
                    this.highlightIssues(request.type);
                    break;
                case 'clearHighlights':
                    this.clearHighlights();
                    break;
                case 'togglePanel':
                    this.togglePanel();
                    break;
                case 'applyFilter':
                    this.applyFilter(request.filter);
                    break;
            }
        });
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'a11y-overlay';
        document.body.appendChild(this.overlay);
    }

    async performQuickScan() {
        this.clearResults();
        this.showLoadingIndicator();

        try {
            // Run accessibility checks
            await this.runQuickChecks();
            
            // Hide loading indicator
            this.hideLoadingIndicator();
            
            return this.results;
        } catch (error) {
            console.error('Quick scan failed:', error);
            this.hideLoadingIndicator();
            throw error;
        }
    }

    async performDetailedScan() {
        this.clearResults();
        this.showLoadingIndicator();

        try {
            // Run comprehensive accessibility checks
            await this.runDetailedChecks();
            
            // Hide loading indicator
            this.hideLoadingIndicator();
            
            // Show panel with results
            this.showPanel();
            
            return this.results;
        } catch (error) {
            console.error('Detailed scan failed:', error);
            this.hideLoadingIndicator();
            throw error;
        }
    }

    async runQuickChecks() {
        // Image alt text checks
        this.checkImageAltText();
        
        // Heading structure
        this.checkHeadingStructure();
        
        // Form labels
        this.checkFormLabels();
        
        // Link text
        this.checkLinkText();
        
        // Color contrast (basic check)
        this.checkColorContrast();
        
        // ARIA labels
        this.checkAriaLabels();
        
        // Keyboard accessibility
        this.checkKeyboardAccessibility();
    }

    async runDetailedChecks() {
        // Run all quick checks first
        await this.runQuickChecks();
        
        // Additional detailed checks
        this.checkSemanticHTML();
        this.checkFocusManagement();
        this.checkScreenReaderCompatibility();
        this.checkMobileAccessibility();
        this.checkPerformanceImpact();
        this.checkLanguageAttributes();
        this.checkTableAccessibility();
        this.checkMultimediaAccessibility();
        this.checkCognitiveAccessibility();
        this.checkSeizureSafety();
    }

    checkImageAltText() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (!img.alt && !img.hasAttribute('aria-hidden')) {
                this.addIssue({
                    title: 'Missing Alt Text',
                    description: 'Image missing alt text for screen readers',
                    element: img.tagName.toLowerCase(),
                    severity: 'error'
                });
            } else if (img.alt === '' && !img.hasAttribute('aria-hidden')) {
                this.addWarning({
                    title: 'Empty Alt Text',
                    description: 'Image has empty alt text - ensure this is intentional',
                    element: img.tagName.toLowerCase(),
                    severity: 'warning'
                });
            } else {
                this.addPassed({
                    title: 'Alt Text Present',
                    description: 'Image has appropriate alt text',
                    element: img.tagName.toLowerCase()
                });
            }
        });
    }

    checkHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level === 1 && previousLevel > 0) {
                this.addWarning({
                    title: 'Multiple H1 Headings',
                    description: 'Multiple H1 headings found on the page',
                    element: heading.tagName.toLowerCase(),
                    severity: 'warning'
                });
            }
            
            if (level > previousLevel + 1 && previousLevel > 0) {
                this.addWarning({
                    title: 'Heading Level Skipped',
                    description: `Heading level skipped from H${previousLevel} to H${level}`,
                    element: heading.tagName.toLowerCase(),
                    severity: 'warning'
                });
            }
            
            previousLevel = level;
        });
        
        if (headings.length === 0) {
            this.addWarning({
                title: 'No Headings Found',
                description: 'No heading elements found on the page',
                element: 'document',
                severity: 'warning'
            });
        }
    }

    checkFormLabels() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const hasLabel = this.hasAssociatedLabel(input);
            const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
            
            if (!hasLabel && !hasAriaLabel && input.type !== 'hidden') {
                this.addIssue({
                    title: 'Missing Form Label',
                    description: 'Form input missing associated label',
                    element: input.tagName.toLowerCase(),
                    severity: 'error'
                });
            } else {
                this.addPassed({
                    title: 'Form Label Present',
                    description: 'Form input has proper labeling',
                    element: input.tagName.toLowerCase()
                });
            }
        });
    }

    checkLinkText() {
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const text = link.textContent.trim();
            
            if (!text) {
                this.addIssue({
                    title: 'Empty Link Text',
                    description: 'Link has no text content',
                    element: 'a',
                    severity: 'error'
                });
            } else if (text.toLowerCase() === 'click here' || text.toLowerCase() === 'read more') {
                this.addWarning({
                    title: 'Generic Link Text',
                    description: 'Link uses generic text that lacks context',
                    element: 'a',
                    severity: 'warning'
                });
            } else {
                this.addPassed({
                    title: 'Descriptive Link Text',
                    description: 'Link has descriptive text content',
                    element: 'a'
                });
            }
        });
    }

    checkColorContrast() {
        // Basic color contrast check
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = this.rgbToHex(style.color);
            const backgroundColor = this.rgbToHex(style.backgroundColor);
            
            if (color && backgroundColor && color !== '#000000' && backgroundColor !== '#ffffff') {
                const contrast = this.calculateContrast(color, backgroundColor);
                
                if (contrast < 4.5) {
                    this.addWarning({
                        title: 'Low Color Contrast',
                        description: `Low color contrast ratio (${contrast.toFixed(2)}:1)`,
                        element: element.tagName.toLowerCase(),
                        severity: 'warning'
                    });
                } else {
                    this.addPassed({
                        title: 'Good Color Contrast',
                        description: `Color contrast ratio is acceptable (${contrast.toFixed(2)}:1)`,
                        element: element.tagName.toLowerCase()
                    });
                }
            }
        });
    }

    checkAriaLabels() {
        const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby]');
        
        ariaElements.forEach(element => {
            const ariaLabel = element.getAttribute('aria-label');
            const ariaLabelledby = element.getAttribute('aria-labelledby');
            
            if (ariaLabel && ariaLabel.trim() === '') {
                this.addWarning({
                    title: 'Empty ARIA Label',
                    description: 'ARIA label is empty',
                    element: element.tagName.toLowerCase(),
                    severity: 'warning'
                });
            } else if (ariaLabelledby && !document.getElementById(ariaLabelledby)) {
                this.addIssue({
                    title: 'Invalid ARIA Label Reference',
                    description: 'ARIA-labelledby references non-existent element',
                    element: element.tagName.toLowerCase(),
                    severity: 'error'
                });
            } else {
                this.addPassed({
                    title: 'Valid ARIA Label',
                    description: 'ARIA label is properly implemented',
                    element: element.tagName.toLowerCase()
                });
            }
        });
    }

    checkKeyboardAccessibility() {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
        
        interactiveElements.forEach(element => {
            const tabIndex = element.getAttribute('tabindex');
            
            if (tabIndex && tabIndex === '-1') {
                // Element intentionally not focusable
                return;
            }
            
            // Check if element is keyboard accessible
            const computedStyle = window.getComputedStyle(element);
            
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                return;
            }
            
            // Check for keyboard event handlers
            const hasKeyboardHandler = element.hasAttribute('onkeydown') || 
                                     element.hasAttribute('onkeyup') ||
                                     element.hasAttribute('onkeypress');
            
            if (!hasKeyboardHandler && element.tagName === 'DIV') {
                this.addWarning({
                    title: 'Potential Keyboard Accessibility Issue',
                    description: 'Interactive element may not be keyboard accessible',
                    element: element.tagName.toLowerCase(),
                    severity: 'warning'
                });
            } else {
                this.addPassed({
                    title: 'Keyboard Accessible',
                    description: 'Element appears to be keyboard accessible',
                    element: element.tagName.toLowerCase()
                });
            }
        });
    }

    checkSemanticHTML() {
        // Check for proper use of semantic HTML elements
        const semanticElements = ['main', 'nav', 'header', 'footer', 'article', 'section', 'aside'];
        
        semanticElements.forEach(tag => {
            const elements = document.querySelectorAll(tag);
            
            if (elements.length > 0) {
                this.addPassed({
                    title: 'Semantic HTML Used',
                    description: `Proper use of ${tag} element`,
                    element: tag
                });
            }
        });
        
        // Check for proper landmark roles
        const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]');
        
        if (landmarks.length === 0) {
            this.addWarning({
                title: 'No Landmark Roles',
                description: 'No ARIA landmark roles found',
                element: 'document',
                severity: 'warning'
            });
        }
    }

    checkFocusManagement() {
        // Check for proper focus management
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        if (focusableElements.length === 0) {
            this.addWarning({
                title: 'No Focusable Elements',
                description: 'No focusable elements found on the page',
                element: 'document',
                severity: 'warning'
            });
        }
        
        // Check for skip links
        const skipLinks = document.querySelectorAll('a[href^="#"], a[href^="."]');
        
        if (skipLinks.length === 0) {
            this.addWarning({
                title: 'No Skip Links',
                description: 'No skip links found for keyboard navigation',
                element: 'document',
                severity: 'warning'
            });
        }
    }

    checkScreenReaderCompatibility() {
        // Check for screen reader compatibility issues
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach(iframe => {
            if (!iframe.title) {
                this.addIssue({
                    title: 'Missing iframe Title',
                    description: 'iframe missing title attribute for screen readers',
                    element: 'iframe',
                    severity: 'error'
                });
            }
        });
        
        // Check for proper table headers
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            const headers = table.querySelectorAll('th');
            const hasScope = table.querySelectorAll('th[scope]');
            
            if (headers.length > 0 && hasScope.length === 0) {
                this.addWarning({
                    title: 'Missing Table Header Scope',
                    description: 'Table headers missing scope attribute',
                    element: 'table',
                    severity: 'warning'
                });
            }
        });
    }

    checkMobileAccessibility() {
        // Check for mobile accessibility issues
        const viewport = document.querySelector('meta[name="viewport"]');
        
        if (!viewport) {
            this.addWarning({
                title: 'Missing Viewport Meta',
                description: 'No viewport meta tag found for mobile responsiveness',
                element: 'head',
                severity: 'warning'
            });
        }
        
        // Check for touch targets
        const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
        
        touchTargets.forEach(element => {
            const rect = element.getBoundingClientRect();
            const minSize = Math.min(rect.width, rect.height);
            
            if (minSize < 44) {
                this.addWarning({
                    title: 'Small Touch Target',
                    description: 'Touch target smaller than recommended 44px minimum',
                    element: element.tagName.toLowerCase(),
                    severity: 'warning'
                });
            }
        });
    }

    checkPerformanceImpact() {
        // Check for performance issues that affect accessibility
        const largeImages = document.querySelectorAll('img');
        
        largeImages.forEach(img => {
            if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
                this.addWarning({
                    title: 'Large Image',
                    description: 'Very large image may impact performance',
                    element: 'img',
                    severity: 'warning'
                });
            }
        });
    }

    checkLanguageAttributes() {
        // Check for language attributes
        const html = document.documentElement;
        
        if (!html.hasAttribute('lang')) {
            this.addIssue({
                title: 'Missing Language Attribute',
                description: 'HTML element missing lang attribute',
                element: 'html',
                severity: 'error'
            });
        }
    }

    checkTableAccessibility() {
        // Check table accessibility
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            const captions = table.querySelectorAll('caption');
            const summaries = table.querySelectorAll('summary');
            
            if (captions.length === 0 && summaries.length === 0) {
                this.addWarning({
                    title: 'Missing Table Caption',
                    description: 'Table missing caption or summary',
                    element: 'table',
                    severity: 'warning'
                });
            }
        });
    }

    checkMultimediaAccessibility() {
        // Check multimedia accessibility
        const videos = document.querySelectorAll('video');
        const audios = document.querySelectorAll('audio');
        
        videos.forEach(video => {
            if (!video.hasAttribute('tracks')) {
                this.addWarning({
                    title: 'Missing Video Captions',
                    description: 'Video missing caption tracks',
                    element: 'video',
                    severity: 'warning'
                });
            }
        });
        
        audios.forEach(audio => {
            if (!audio.hasAttribute('aria-label') && !audio.hasAttribute('aria-describedby')) {
                this.addWarning({
                    title: 'Missing Audio Description',
                    description: 'Audio missing description',
                    element: 'audio',
                    severity: 'warning'
                });
            }
        });
    }

    checkCognitiveAccessibility() {
        // Check cognitive accessibility
        const complexElements = document.querySelectorAll('div, span');
        
        complexElements.forEach(element => {
            const text = element.textContent;
            
            if (text && text.length > 200) {
                const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
                
                if (sentences.length > 5) {
                    this.addWarning({
                        title: 'Complex Content',
                        description: 'Long text block may be difficult to process',
                        element: element.tagName.toLowerCase(),
                        severity: 'warning'
                    });
                }
            }
        });
    }

    checkSeizureSafety() {
        // Check for seizure safety
        const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"]');
        
        animatedElements.forEach(element => {
            const style = element.style;
            
            if (style.animation || style.transition) {
                this.addWarning({
                    title: 'Animated Content',
                    description: 'Animated content may affect users with photosensitivity',
                    element: element.tagName.toLowerCase(),
                    severity: 'warning'
                });
            }
        });
    }

    // Helper methods
    hasAssociatedLabel(input) {
        const id = input.id;
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) return true;
        }
        
        let parent = input.parentElement;
        while (parent) {
            if (parent.tagName === 'LABEL') return true;
            parent = parent.parentElement;
        }
        
        return false;
    }

    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return null;
        
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return rgb;
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    calculateContrast(color1, color2) {
        // Simplified contrast calculation
        const l1 = this.getLuminance(color1);
        const l2 = this.getLuminance(color2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    getLuminance(hex) {
        // Simplified luminance calculation
        const r = parseInt(hex.substr(1, 2), 16) / 255;
        const g = parseInt(hex.substr(3, 2), 16) / 255;
        const b = parseInt(hex.substr(5, 2), 16) / 255;
        
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    addIssue(issue) {
        this.results.issues.push({
            ...issue,
            timestamp: new Date().toISOString()
        });
    }

    addWarning(warning) {
        this.results.warnings.push({
            ...warning,
            timestamp: new Date().toISOString()
        });
    }

    addPassed(passed) {
        this.results.passed.push({
            ...passed,
            timestamp: new Date().toISOString()
        });
    }

    clearResults() {
        this.results = {
            issues: [],
            warnings: [],
            passed: [],
            timestamp: new Date().toISOString()
        };
    }

    showLoadingIndicator() {
        const loading = document.createElement('div');
        loading.className = 'a11y-loading';
        loading.textContent = 'Scanning for accessibility issues...';
        document.body.appendChild(loading);
        
        setTimeout(() => {
            if (loading.parentNode) {
                loading.parentNode.removeChild(loading);
            }
        }, 5000);
    }

    hideLoadingIndicator() {
        const loading = document.querySelector('.a11y-loading');
        if (loading) {
            loading.parentNode.removeChild(loading);
        }
    }

    highlightIssues(type = 'all') {
        this.clearHighlights();
        
        const elements = [];
        
        if (type === 'all' || type === 'issues') {
            this.results.issues.forEach(issue => {
                const element = document.querySelector(issue.element);
                if (element) elements.push({ element, type: 'error', issue });
            });
        }
        
        if (type === 'all' || type === 'warnings') {
            this.results.warnings.forEach(warning => {
                const element = document.querySelector(warning.element);
                if (element) elements.push({ element, type: 'warning', issue: warning });
            });
        }
        
        elements.forEach(({ element, type, issue }) => {
            const highlight = this.createHighlight(element, type, issue);
            this.overlay.appendChild(highlight);
            this.highlights.push(highlight);
        });
    }

    createHighlight(element, type, issue) {
        const rect = element.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = `a11y-highlight ${type}`;
        highlight.style.left = `${rect.left + window.scrollX}px`;
        highlight.style.top = `${rect.top + window.scrollY}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'a11y-tooltip';
        tooltip.textContent = issue.description;
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 40}px`;
        
        this.overlay.appendChild(tooltip);
        this.highlights.push(tooltip);
        
        return highlight;
    }

    clearHighlights() {
        this.highlights.forEach(highlight => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        });
        this.highlights = [];
    }

    showPanel() {
        if (!this.panel) {
            this.createPanel();
        }
        this.panel.classList.add('open');
        this.updatePanelContent();
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'a11y-panel';
        
        this.panel.innerHTML = `
            <div class="a11y-panel-header">
                <div class="a11y-panel-title">A11y Inspector Results</div>
                <button class="a11y-panel-close">&times;</button>
            </div>
            <div class="a11y-panel-content">
                <div class="a11y-section">
                    <div class="a11y-section-title">Issues (${this.results.issues.length})</div>
                    <div id="a11y-issues-list"></div>
                </div>
                <div class="a11y-section">
                    <div class="a11y-section-title">Warnings (${this.results.warnings.length})</div>
                    <div id="a11y-warnings-list"></div>
                </div>
                <div class="a11y-section">
                    <div class="a11y-section-title">Passed (${this.results.passed.length})</div>
                    <div id="a11y-passed-list"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
        
        // Add close button functionality
        this.panel.querySelector('.a11y-panel-close').addEventListener('click', () => {
            this.panel.classList.remove('open');
        });
    }

    updatePanelContent() {
        const issuesList = this.panel.querySelector('#a11y-issues-list');
        const warningsList = this.panel.querySelector('#a11y-warnings-list');
        const passedList = this.panel.querySelector('#a11y-passed-list');
        
        issuesList.innerHTML = this.results.issues.map(issue => `
            <div class="a11y-item error">
                <div class="a11y-item-title">${issue.title}</div>
                <div class="a11y-item-description">${issue.description}</div>
                <div class="a11y-item-element">${issue.element}</div>
            </div>
        `).join('');
        
        warningsList.innerHTML = this.results.warnings.map(warning => `
            <div class="a11y-item warning">
                <div class="a11y-item-title">${warning.title}</div>
                <div class="a11y-item-description">${warning.description}</div>
                <div class="a11y-item-element">${warning.element}</div>
            </div>
        `).join('');
        
        passedList.innerHTML = this.results.passed.slice(0, 10).map(passed => `
            <div class="a11y-item success">
                <div class="a11y-item-title">${passed.title}</div>
                <div class="a11y-item-description">${passed.description}</div>
                <div class="a11y-item-element">${passed.element}</div>
            </div>
        `).join('');
        
        if (this.results.passed.length > 10) {
            passedList.innerHTML += `<div class="a11y-item">... and ${this.results.passed.length - 10} more passed checks</div>`;
        }
    }

    togglePanel() {
        if (!this.panel) {
            this.createPanel();
        }
        
        if (this.panel.classList.contains('open')) {
            this.panel.classList.remove('open');
        } else {
            this.panel.classList.add('open');
        }
    }

    applyFilter(filter) {
        // Apply accessibility filters
        document.body.classList.remove('a11y-colorblind-protanopia', 'a11y-colorblind-deuteranopia', 'a11y-colorblind-tritanopia', 'a11y-high-contrast', 'a11y-large-text', 'a11y-reduced-motion');
        
        switch (filter) {
            case 'protanopia':
                document.body.classList.add('a11y-colorblind-protanopia');
                break;
            case 'deuteranopia':
                document.body.classList.add('a11y-colorblind-deuteranopia');
                break;
            case 'tritanopia':
                document.body.classList.add('a11y-colorblind-tritanopia');
                break;
            case 'high-contrast':
                document.body.classList.add('a11y-high-contrast');
                break;
            case 'large-text':
                document.body.classList.add('a11y-large-text');
                break;
            case 'reduced-motion':
                document.body.classList.add('a11y-reduced-motion');
                break;
        }
    }
}

// Initialize the accessibility engine
const a11yEngine = new A11yEngine();