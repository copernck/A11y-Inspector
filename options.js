class A11yOptions {
    constructor() {
        this.settings = {};
        this.originalSettings = {};
        this.currentSection = 'general';
        this.pendingAction = null;
        
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Settings inputs
        document.getElementById('autoScan').addEventListener('change', (e) => {
            this.updateSetting('autoScan', e.target.checked);
        });

        document.getElementById('showNotifications').addEventListener('change', (e) => {
            this.updateSetting('showNotifications', e.target.checked);
        });

        document.getElementById('highlightIssues').addEventListener('change', (e) => {
            this.updateSetting('highlightIssues', e.target.checked);
        });

        document.getElementById('language').addEventListener('change', (e) => {
            this.updateSetting('language', e.target.value);
        });

        document.getElementById('wcagVersion').addEventListener('change', (e) => {
            this.updateSetting('wcagVersion', e.target.value);
        });

        document.getElementById('complianceLevel').addEventListener('change', (e) => {
            this.updateSetting('complianceLevel', e.target.value);
        });

        document.getElementById('scanFrequency').addEventListener('change', (e) => {
            this.updateSetting('scanFrequency', e.target.value);
        });

        document.getElementById('exportFormat').addEventListener('change', (e) => {
            this.updateSetting('exportFormat', e.target.value);
        });

        document.getElementById('theme').addEventListener('change', (e) => {
            this.updateSetting('theme', e.target.value);
        });

        document.getElementById('compactMode').addEventListener('change', (e) => {
            this.updateSetting('compactMode', e.target.checked);
        });

        document.getElementById('telemetry').addEventListener('change', (e) => {
            this.updateSetting('telemetry', e.target.checked);
        });

        document.getElementById('autoUpdate').addEventListener('change', (e) => {
            this.updateSetting('autoUpdate', e.target.checked);
        });

        // Textareas
        document.getElementById('excludedSelectors').addEventListener('input', (e) => {
            this.updateSetting('excludedSelectors', e.target.value.split('\n').filter(s => s.trim()));
        });

        document.getElementById('customRules').addEventListener('input', (e) => {
            try {
                const rules = e.target.value ? JSON.parse(e.target.value) : [];
                this.updateSetting('customRules', rules);
            } catch (error) {
                // Invalid JSON, don't update
            }
        });

        // Color inputs
        document.getElementById('errorColor').addEventListener('input', (e) => {
            this.updateColorSetting('errorColor', e.target.value);
        });

        document.getElementById('warningColor').addEventListener('input', (e) => {
            this.updateColorSetting('warningColor', e.target.value);
        });

        document.getElementById('successColor').addEventListener('input', (e) => {
            this.updateColorSetting('successColor', e.target.value);
        });

        // Action buttons
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('resetSettingsBtn').addEventListener('click', () => {
            this.resetSettings();
        });

        document.getElementById('checkUpdateBtn').addEventListener('click', () => {
            this.checkForUpdate();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearData();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Modal
        document.getElementById('closeConfirmModal').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('confirmBtn').addEventListener('click', () => {
            this.executePendingAction();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                this.closeConfirmModal();
            }
        });
    }

    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
            this.settings = response || {};
            this.originalSettings = JSON.parse(JSON.stringify(this.settings));
            this.populateSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showMessage('Failed to load settings', 'error');
        }
    }

    populateSettings() {
        // General settings
        document.getElementById('autoScan').checked = this.settings.autoScan || false;
        document.getElementById('showNotifications').checked = this.settings.showNotifications !== false;
        document.getElementById('highlightIssues').checked = this.settings.highlightIssues !== false;
        document.getElementById('language').value = this.settings.language || 'en';

        // Scanning settings
        document.getElementById('wcagVersion').value = this.settings.wcagVersion || '2.1';
        document.getElementById('complianceLevel').value = this.settings.complianceLevel || 'AA';
        document.getElementById('scanFrequency').value = this.settings.scanFrequency || 'manual';
        document.getElementById('exportFormat').value = this.settings.exportFormat || 'html';
        
        // Excluded selectors
        const excludedSelectors = this.settings.excludedSelectors || [];
        document.getElementById('excludedSelectors').value = excludedSelectors.join('\n');

        // Appearance settings
        document.getElementById('theme').value = this.settings.theme || 'default';
        document.getElementById('compactMode').checked = this.settings.compactMode || false;
        
        // Color settings
        const colors = this.settings.colors || {};
        document.getElementById('errorColor').value = colors.error || '#ef4444';
        document.getElementById('warningColor').value = colors.warning || '#f59e0b';
        document.getElementById('successColor').value = colors.success || '#10b981';
        
        // Update color value displays
        this.updateColorDisplay('errorColor');
        this.updateColorDisplay('warningColor');
        this.updateColorDisplay('successColor');

        // Advanced settings
        const customRules = this.settings.customRules || [];
        document.getElementById('customRules').value = customRules.length > 0 ? JSON.stringify(customRules, null, 2) : '';
        document.getElementById('telemetry').checked = this.settings.telemetry !== false;
        document.getElementById('autoUpdate').checked = this.settings.autoUpdate !== false;
    }

    updateSetting(key, value) {
        this.settings[key] = value;
    }

    updateColorSetting(colorType, value) {
        if (!this.settings.colors) {
            this.settings.colors = {};
        }
        this.settings.colors[colorType] = value;
        this.updateColorDisplay(colorType);
    }

    updateColorDisplay(colorType) {
        const input = document.getElementById(colorType);
        const display = input.parentNode.querySelector('.color-value');
        if (display) {
            display.textContent = input.value;
        }
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;
    }

    async saveSettings() {
        try {
            // Validate custom rules if provided
            const customRulesText = document.getElementById('customRules').value;
            if (customRulesText.trim()) {
                try {
                    JSON.parse(customRulesText);
                } catch (error) {
                    this.showMessage('Invalid JSON in custom rules', 'error');
                    return;
                }
            }

            const response = await chrome.runtime.sendMessage({
                action: 'saveSettings',
                settings: this.settings
            });

            if (response.success) {
                this.originalSettings = JSON.parse(JSON.stringify(this.settings));
                this.showMessage('Settings saved successfully', 'success');
            } else {
                this.showMessage('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showMessage('Failed to save settings', 'error');
        }
    }

    resetSettings() {
        this.showConfirmModal(
            'Reset Settings',
            'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
            () => {
                this.settings = {
                    autoScan: false,
                    showNotifications: true,
                    highlightIssues: true,
                    language: 'en',
                    wcagVersion: '2.1',
                    complianceLevel: 'AA',
                    scanFrequency: 'manual',
                    exportFormat: 'html',
                    theme: 'default',
                    compactMode: false,
                    excludedSelectors: [],
                    customRules: [],
                    telemetry: true,
                    autoUpdate: true,
                    colors: {
                        error: '#ef4444',
                        warning: '#f59e0b',
                        success: '#10b981'
                    }
                };
                this.populateSettings();
                this.showMessage('Settings reset to defaults', 'success');
            }
        );
    }

    async checkForUpdate() {
        const btn = document.getElementById('checkUpdateBtn');
        const originalText = btn.textContent;
        
        btn.innerHTML = '<span class="loading"></span> Checking...';
        btn.disabled = true;

        try {
            const response = await chrome.runtime.sendMessage({ action: 'checkUpdate' });
            
            if (response.success) {
                if (response.updateAvailable) {
                    this.showMessage('Update available! Please restart your browser.', 'success');
                } else {
                    this.showMessage('You\'re using the latest version', 'info');
                }
            } else {
                this.showMessage('Failed to check for updates', 'error');
            }
        } catch (error) {
            console.error('Failed to check for update:', error);
            this.showMessage('Failed to check for updates', 'error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async exportData() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'exportData' });
            
            if (response.success) {
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `a11y-inspector-backup-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                
                URL.revokeObjectURL(url);
                this.showMessage('Data exported successfully', 'success');
            } else {
                this.showMessage('Failed to export data', 'error');
            }
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showMessage('Failed to export data', 'error');
        }
    }

    async importData(file) {
        if (!file) return;

        this.showConfirmModal(
            'Import Data',
            'Are you sure you want to import this data? This will overwrite all current settings and scan history.',
            async () => {
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    
                    // Validate data structure
                    if (data.settings && typeof data.settings === 'object') {
                        this.settings = { ...this.settings, ...data.settings };
                        this.populateSettings();
                        this.showMessage('Data imported successfully', 'success');
                    } else {
                        this.showMessage('Invalid data format', 'error');
                    }
                } catch (error) {
                    console.error('Failed to import data:', error);
                    this.showMessage('Failed to import data', 'error');
                }
            }
        );
    }

    clearData() {
        this.showConfirmModal(
            'Clear All Data',
            'Are you sure you want to clear all settings and scan history? This action cannot be undone.',
            async () => {
                try {
                    // Clear storage
                    await chrome.storage.sync.clear();
                    
                    // Reset to defaults
                    this.settings = {
                        autoScan: false,
                        showNotifications: true,
                        highlightIssues: true,
                        language: 'en',
                        wcagVersion: '2.1',
                        complianceLevel: 'AA',
                        scanFrequency: 'manual',
                        exportFormat: 'html',
                        theme: 'default',
                        compactMode: false,
                        excludedSelectors: [],
                        customRules: [],
                        telemetry: true,
                        autoUpdate: true,
                        colors: {
                            error: '#ef4444',
                            warning: '#f59e0b',
                            success: '#10b981'
                        }
                    };
                    
                    this.populateSettings();
                    this.showMessage('All data cleared successfully', 'success');
                } catch (error) {
                    console.error('Failed to clear data:', error);
                    this.showMessage('Failed to clear data', 'error');
                }
            }
        );
    }

    showConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        this.pendingAction = onConfirm;
        modal.style.display = 'block';
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.pendingAction = null;
    }

    executePendingAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
        this.closeConfirmModal();
    }

    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Check for unsaved changes before leaving
    checkUnsavedChanges() {
        const hasChanges = JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings);
        
        if (hasChanges) {
            return 'You have unsaved changes. Are you sure you want to leave?';
        }
        return null;
    }
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
    const options = new A11yOptions();
    
    // Handle page unload
    window.addEventListener('beforeunload', (e) => {
        const message = options.checkUnsavedChanges();
        if (message) {
            e.preventDefault();
            e.returnValue = message;
            return message;
        }
    });
});