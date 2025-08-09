class A11yBackground {
    constructor() {
        this.initializeExtension();
        this.setupMessageListeners();
        this.setupContextMenus();
        this.initializeStorage();
    }

    initializeExtension() {
        console.log('A11y Inspector extension initialized');
        
        // Set default settings
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.setDefaults();
                this.showWelcomeMessage();
            }
        });
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'openDonateModal':
                    this.openDonateModal();
                    break;
                case 'getSettings':
                    this.getSettings().then(sendResponse);
                    return true;
                case 'saveSettings':
                    this.saveSettings(request.settings).then(sendResponse);
                    return true;
                case 'getScanHistory':
                    this.getScanHistory().then(sendResponse);
                    return true;
                case 'saveScanResult':
                    this.saveScanResult(request.result).then(sendResponse);
                    return true;
                case 'exportData':
                    this.exportData().then(sendResponse);
                    return true;
                case 'checkUpdate':
                    this.checkForUpdate().then(sendResponse);
                    return true;
            }
        });
    }

    setupContextMenus() {
        // Create context menu for accessibility scanning
        chrome.contextMenus.create({
            id: 'a11y-scan-page',
            title: 'Scan page for accessibility issues',
            contexts: ['page', 'selection']
        });

        chrome.contextMenus.create({
            id: 'a11y-scan-element',
            title: 'Scan element for accessibility',
            contexts: ['selection', 'link', 'image']
        });

        chrome.contextMenus.create({
            id: 'a11y-separator',
            type: 'separator',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'a11y-open-sidebar',
            title: 'Open A11y Inspector sidebar',
            contexts: ['page']
        });

        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'a11y-scan-page':
                await this.scanPage(tab);
                break;
            case 'a11y-scan-element':
                await this.scanElement(tab, info);
                break;
            case 'a11y-open-sidebar':
                await this.openSidebar(tab);
                break;
        }
    }

    async scanPage(tab) {
        try {
            // Execute quick scan
            const results = await chrome.tabs.sendMessage(tab.id, { action: 'quickScan' });
            
            // Save results
            await this.saveScanResult({
                url: tab.url,
                timestamp: new Date().toISOString(),
                results: results
            });

            // Show notification
            this.showNotification(
                'Accessibility Scan Complete',
                `Found ${results.issues.length} issues and ${results.warnings.length} warnings`
            );

            // Open sidebar with results
            chrome.sidebarAction.open();
        } catch (error) {
            console.error('Page scan failed:', error);
            this.showNotification('Scan Failed', 'Unable to scan page for accessibility issues');
        }
    }

    async scanElement(tab, info) {
        try {
            // For element scanning, we'll need to get the selected element
            const results = await chrome.tabs.sendMessage(tab.id, { 
                action: 'scanElement',
                info: info
            });
            
            if (results) {
                this.showNotification(
                    'Element Scan Complete',
                    `Element: ${results.element} - ${results.severity}`
                );
            }
        } catch (error) {
            console.error('Element scan failed:', error);
            this.showNotification('Element Scan Failed', 'Unable to scan element');
        }
    }

    async openSidebar(tab) {
        try {
            chrome.sidebarAction.open();
        } catch (error) {
            console.error('Failed to open sidebar:', error);
        }
    }

    async initializeStorage() {
        // Initialize storage with default values
        const result = await chrome.storage.sync.get(['settings', 'scanHistory']);
        
        if (!result.settings) {
            await this.setDefaults();
        }
        
        if (!result.scanHistory) {
            await chrome.storage.sync.set({
                scanHistory: []
            });
        }
    }

    async setDefaults() {
        const defaultSettings = {
            autoScan: false,
            highlightIssues: true,
            showNotifications: true,
            exportFormat: 'html',
            theme: 'default',
            language: 'en',
            wcagVersion: '2.1',
            scanFrequency: 'manual',
            excludedSelectors: [],
            customRules: [],
            telemetry: true,
            lastUpdateCheck: null
        };

        await chrome.storage.sync.set({
            settings: defaultSettings
        });
    }

    async getSettings() {
        const result = await chrome.storage.sync.get(['settings']);
        return result.settings || {};
    }

    async saveSettings(settings) {
        try {
            await chrome.storage.sync.set({ settings });
            return { success: true };
        } catch (error) {
            console.error('Failed to save settings:', error);
            return { success: false, error: error.message };
        }
    }

    async getScanHistory() {
        const result = await chrome.storage.sync.get(['scanHistory']);
        return result.scanHistory || [];
    }

    async saveScanResult(scanResult) {
        try {
            const result = await chrome.storage.sync.get(['scanHistory']);
            const history = result.scanHistory || [];
            
            // Add new result to history
            history.unshift(scanResult);
            
            // Keep only last 50 results
            if (history.length > 50) {
                history.splice(50);
            }
            
            await chrome.storage.sync.set({ scanHistory: history });
            return { success: true };
        } catch (error) {
            console.error('Failed to save scan result:', error);
            return { success: false, error: error.message };
        }
    }

    async exportData() {
        try {
            const result = await chrome.storage.sync.get(['settings', 'scanHistory']);
            const exportData = {
                settings: result.settings,
                scanHistory: result.scanHistory,
                exportDate: new Date().toISOString(),
                version: chrome.runtime.getManifest().version
            };
            
            return { success: true, data: exportData };
        } catch (error) {
            console.error('Failed to export data:', error);
            return { success: false, error: error.message };
        }
    }

    async checkForUpdate() {
        try {
            const settings = await this.getSettings();
            const now = new Date().getTime();
            const lastCheck = settings.lastUpdateCheck ? new Date(settings.lastUpdateCheck).getTime() : 0;
            
            // Only check once per day
            if (now - lastCheck < 24 * 60 * 60 * 1000) {
                return { success: true, updateAvailable: false };
            }
            
            // Simulate update check (in a real extension, this would check a server)
            const updateAvailable = Math.random() < 0.1; // 10% chance of update
            
            // Update last check time
            await this.saveSettings({
                ...settings,
                lastUpdateCheck: new Date().toISOString()
            });
            
            if (updateAvailable) {
                this.showNotification(
                    'Update Available',
                    'A new version of A11y Inspector is available'
                );
            }
            
            return { success: true, updateAvailable };
        } catch (error) {
            console.error('Failed to check for update:', error);
            return { success: false, error: error.message };
        }
    }

    showNotification(title, message) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-48.png',
            title: title,
            message: message
        });
    }

    showWelcomeMessage() {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-48.png',
            title: 'Welcome to A11y Inspector!',
            message: 'Thank you for installing A11y Inspector. Click the extension icon to start scanning for accessibility issues.'
        });
    }

    openDonateModal() {
        // This would typically open the donate modal in the popup
        // Since we can't directly open the popup from background,
        // we'll show a notification instead
        this.showNotification(
            'Support A11y Inspector',
            'Thank you for your interest in supporting our work! Please open the extension popup to see donation options.'
        );
    }

    // Analytics and telemetry (anonymous)
    async trackEvent(event, data = {}) {
        try {
            const settings = await this.getSettings();
            
            if (!settings.telemetry) {
                return;
            }
            
            // In a real extension, this would send data to an analytics service
            // For now, we'll just log it
            console.log('Event tracked:', event, data);
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    // Performance monitoring
    monitorPerformance() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.trackEvent('page_loaded', {
                    url: tab.url,
                    loadTime: Date.now()
                });
            }
        });
    }

    // Handle extension updates
    handleUpdate() {
        chrome.runtime.onUpdateAvailable.addListener((details) => {
            this.showNotification(
                'Update Available',
                'A new version of A11y Inspector is available. Please restart your browser to apply the update.'
            );
        });
    }

    // Handle storage changes
    handleStorageChanges() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                if (key === 'settings') {
                    this.trackEvent('settings_changed', {
                        changedKeys: Object.keys(newValue).filter(k => 
                            JSON.stringify(oldValue[k]) !== JSON.stringify(newValue[k])
                        )
                    });
                }
            }
        });
    }

    // Initialize all features
    initializeFeatures() {
        this.monitorPerformance();
        this.handleUpdate();
        this.handleStorageChanges();
        
        // Track extension installation
        this.trackEvent('extension_installed', {
            version: chrome.runtime.getManifest().version,
            timestamp: new Date().toISOString()
        });
    }
}

// Initialize the background service
const a11yBackground = new A11yBackground();
a11yBackground.initializeFeatures();