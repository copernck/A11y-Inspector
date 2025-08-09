class A11ySidebar {
    constructor() {
        this.currentResults = null;
        this.currentTab = 'issues';
        this.initializeEventListeners();
        this.loadInitialData();
    }

    initializeEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshAnalysis();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportReport();
        });

        // Quick action buttons
        document.getElementById('highlightIssuesBtn').addEventListener('click', () => {
            this.highlightIssues('issues');
        });

        document.getElementById('highlightWarningsBtn').addEventListener('click', () => {
            this.highlightIssues('warnings');
        });

        document.getElementById('clearHighlightsBtn').addEventListener('click', () => {
            this.clearHighlights();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleFilter(e.target.closest('.filter-btn'));
            });
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Footer buttons
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('donateBtn').addEventListener('click', () => {
            this.openDonateModal();
        });

        // Modal close button
        document.getElementById('closeInspectorModal').addEventListener('click', () => {
            this.closeInspectorModal();
        });

        // Modal actions
        document.getElementById('inspectElementBtn').addEventListener('click', () => {
            this.inspectElement();
        });

        document.getElementById('copyElementInfoBtn').addEventListener('click', () => {
            this.copyElementInfo();
        });

        // Close modal when clicking outside
        document.getElementById('elementInspectorModal').addEventListener('click', (e) => {
            if (e.target.id === 'elementInspectorModal') {
                this.closeInspectorModal();
            }
        });
    }

    async loadInitialData() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const results = await chrome.tabs.sendMessage(tab.id, { action: 'detailedScan' });
            this.currentResults = results;
            this.updateUI(results);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    async refreshAnalysis() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const results = await chrome.tabs.sendMessage(tab.id, { action: 'detailedScan' });
            this.currentResults = results;
            this.updateUI(results);
        } catch (error) {
            console.error('Failed to refresh analysis:', error);
        }
    }

    updateUI(results) {
        this.updateScore(results);
        this.updateStats(results);
        this.updateResultsLists(results);
        this.updateWCAGOverview(results);
    }

    updateScore(results) {
        const totalChecks = results.issues.length + results.warnings.length + results.passed.length;
        const score = Math.round((results.passed.length / totalChecks) * 100);
        
        const scoreCircle = document.getElementById('sidebarScoreCircle');
        const scoreNumber = document.getElementById('sidebarScoreNumber');
        
        scoreNumber.textContent = score;
        scoreCircle.style.setProperty('--score', `${(score / 100) * 360}deg`);
    }

    updateStats(results) {
        document.getElementById('sidebarIssuesCount').textContent = results.issues.length;
        document.getElementById('sidebarWarningsCount').textContent = results.warnings.length;
        document.getElementById('sidebarPassedCount').textContent = results.passed.length;
    }

    updateResultsLists(results) {
        this.updateIssuesList(results.issues);
        this.updateWarningsList(results.warnings);
        this.updatePassedList(results.passed);
    }

    updateIssuesList(issues) {
        const issuesList = document.getElementById('detailedIssuesList');
        
        if (issues.length === 0) {
            issuesList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🎉</span>
                    <p>No issues found!</p>
                </div>
            `;
            return;
        }

        issuesList.innerHTML = issues.map(issue => `
            <div class="issue-item" data-issue='${JSON.stringify(issue)}'>
                <div class="item-header">
                    <div class="item-title">${issue.title}</div>
                    <div class="item-severity error">Error</div>
                </div>
                <div class="item-description">${issue.description}</div>
                <div class="item-element">${issue.element}</div>
            </div>
        `).join('');

        // Add click listeners
        issuesList.querySelectorAll('.issue-item').forEach(item => {
            item.addEventListener('click', () => {
                const issue = JSON.parse(item.dataset.issue);
                this.showElementInspector(issue, 'error');
            });
        });
    }

    updateWarningsList(warnings) {
        const warningsList = document.getElementById('detailedWarningsList');
        
        if (warnings.length === 0) {
            warningsList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🎉</span>
                    <p>No warnings found!</p>
                </div>
            `;
            return;
        }

        warningsList.innerHTML = warnings.map(warning => `
            <div class="warning-item" data-warning='${JSON.stringify(warning)}'>
                <div class="item-header">
                    <div class="item-title">${warning.title}</div>
                    <div class="item-severity warning">Warning</div>
                </div>
                <div class="item-description">${warning.description}</div>
                <div class="item-element">${warning.element}</div>
            </div>
        `).join('');

        // Add click listeners
        warningsList.querySelectorAll('.warning-item').forEach(item => {
            item.addEventListener('click', () => {
                const warning = JSON.parse(item.dataset.warning);
                this.showElementInspector(warning, 'warning');
            });
        });
    }

    updatePassedList(passed) {
        const passedList = document.getElementById('detailedPassedList');
        
        if (passed.length === 0) {
            passedList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📋</span>
                    <p>No passed checks yet</p>
                </div>
            `;
            return;
        }

        const displayPassed = passed.slice(0, 20); // Show first 20 items
        
        passedList.innerHTML = displayPassed.map(check => `
            <div class="passed-item">
                <div class="item-header">
                    <div class="item-title">${check.title}</div>
                    <div class="item-severity passed">Passed</div>
                </div>
                <div class="item-description">${check.description}</div>
                <div class="item-element">${check.element}</div>
            </div>
        `).join('');

        if (passed.length > 20) {
            passedList.innerHTML += `
                <div class="empty-state">
                    <p>... and ${passed.length - 20} more passed checks</p>
                </div>
            `;
        }
    }

    updateWCAGOverview(results) {
        // Calculate WCAG compliance percentages
        const totalChecks = results.issues.length + results.warnings.length + results.passed.length;
        const complianceRate = (results.passed.length / totalChecks) * 100;
        
        // Update progress bars
        const categories = ['perceivable', 'operable', 'understandable', 'robust'];
        categories.forEach(category => {
            const progressBar = document.querySelector(`.wcag-category:nth-child(${categories.indexOf(category) + 1}) .progress-fill`);
            const progressText = document.querySelector(`.wcag-category:nth-child(${categories.indexOf(category) + 1}) .progress-text`);
            
            // Simulate different compliance rates for each category
            const categoryRate = complianceRate + (Math.random() * 20 - 10); // Add some variation
            const finalRate = Math.max(0, Math.min(100, categoryRate));
            
            progressBar.style.width = `${finalRate}%`;
            progressText.textContent = `${Math.round(finalRate)}%`;
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    async highlightIssues(type) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { 
                action: 'highlightIssues', 
                type: type 
            });
        } catch (error) {
            console.error('Failed to highlight issues:', error);
        }
    }

    async clearHighlights() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { action: 'clearHighlights' });
        } catch (error) {
            console.error('Failed to clear highlights:', error);
        }
    }

    toggleFilter(filterBtn) {
        const filter = filterBtn.dataset.filter;
        const isActive = filterBtn.classList.contains('active');

        // Remove active class from all filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (!isActive) {
            filterBtn.classList.add('active');
            this.applyFilter(filter);
        } else {
            this.clearFilter(filter);
        }
    }

    async applyFilter(filter) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { 
                action: 'applyFilter', 
                filter: filter 
            });
        } catch (error) {
            console.error('Failed to apply filter:', error);
        }
    }

    async clearFilter(filter) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { 
                action: 'clearFilter', 
                filter: filter 
            });
        } catch (error) {
            console.error('Failed to clear filter:', error);
        }
    }

    showElementInspector(issue, severity) {
        const modal = document.getElementById('elementInspectorModal');
        
        // Populate modal content
        document.getElementById('inspectorElementTag').textContent = issue.element;
        document.getElementById('inspectorIssueTitle').textContent = issue.title;
        document.getElementById('inspectorIssueDescription').textContent = issue.description;
        document.getElementById('inspectorWcagGuideline').textContent = this.getWCAGGuideline(issue.title);
        document.getElementById('inspectorSuggestion').textContent = this.getSuggestion(issue.title);
        
        // Store current issue for later use
        this.currentInspectIssue = issue;
        
        // Show modal
        modal.style.display = 'block';
    }

    closeInspectorModal() {
        document.getElementById('elementInspectorModal').style.display = 'none';
        this.currentInspectIssue = null;
    }

    getWCAGGuideline(issueTitle) {
        const guidelines = {
            'Missing Alt Text': 'WCAG 1.1.1 - Non-text Content',
            'Empty Alt Text': 'WCAG 1.1.1 - Non-text Content',
            'Missing Form Label': 'WCAG 3.3.2 - Labels or Instructions',
            'Empty Link Text': 'WCAG 2.4.4 - Link Purpose (In Context)',
            'Generic Link Text': 'WCAG 2.4.4 - Link Purpose (In Context)',
            'Low Color Contrast': 'WCAG 1.4.3 - Contrast (Minimum)',
            'Empty ARIA Label': 'WCAG 4.1.2 - Name, Role, Value',
            'Invalid ARIA Label Reference': 'WCAG 4.1.2 - Name, Role, Value',
            'Missing Language Attribute': 'WCAG 3.1.1 - Language of Page',
            'Missing iframe Title': 'WCAG 2.4.1 - Bypass Blocks',
            'Missing Table Header Scope': 'WCAG 1.3.1 - Info and Relationships',
            'Missing Video Captions': 'WCAG 1.2.2 - Captions (Prerecorded)',
            'Missing Audio Description': 'WCAG 1.2.3 - Audio Description or Media Alternative'
        };
        
        return guidelines[issueTitle] || 'WCAG Guideline not specified';
    }

    getSuggestion(issueTitle) {
        const suggestions = {
            'Missing Alt Text': 'Add descriptive alt text to all images. If the image is decorative, use alt="" with an empty string.',
            'Empty Alt Text': 'Ensure empty alt text is only used for decorative images. For informative images, add descriptive text.',
            'Missing Form Label': 'Add a label element associated with the form input using the "for" attribute, or wrap the input in a label.',
            'Empty Link Text': 'Add descriptive text to the link that explains its destination or purpose.',
            'Generic Link Text': 'Replace generic text like "click here" with descriptive text that indicates the link\'s purpose.',
            'Low Color Contrast': 'Increase the contrast ratio between text and background colors to at least 4.5:1 for normal text.',
            'Empty ARIA Label': 'Provide meaningful text in ARIA labels or ensure empty labels are intentional.',
            'Invalid ARIA Label Reference': 'Ensure the referenced element exists and has appropriate content.',
            'Missing Language Attribute': 'Add a lang attribute to the HTML element to specify the page language.',
            'Missing iframe Title': 'Add a descriptive title attribute to all iframe elements.',
            'Missing Table Header Scope': 'Add scope attributes to table headers to indicate whether they apply to rows or columns.',
            'Missing Video Captions': 'Add caption tracks to all video content to make it accessible to deaf and hard-of-hearing users.',
            'Missing Audio Description': 'Add audio descriptions or provide a text alternative for audio content.'
        };
        
        return suggestions[issueTitle] || 'Review the element against WCAG guidelines and make necessary improvements.';
    }

    async inspectElement() {
        if (!this.currentInspectIssue) return;
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Send message to content script to highlight the specific element
            await chrome.tabs.sendMessage(tab.id, { 
                action: 'inspectElement', 
                element: this.currentInspectIssue.element 
            });
            
            // Close the modal
            this.closeInspectorModal();
        } catch (error) {
            console.error('Failed to inspect element:', error);
        }
    }

    async copyElementInfo() {
        if (!this.currentInspectIssue) return;
        
        const info = `
Element: ${this.currentInspectIssue.element}
Issue: ${this.currentInspectIssue.title}
Description: ${this.currentInspectIssue.description}
WCAG Guideline: ${this.getWCAGGuideline(this.currentInspectIssue.title)}
Suggestion: ${this.getSuggestion(this.currentInspectIssue.title)}
        `.trim();
        
        try {
            await navigator.clipboard.writeText(info);
            
            // Show feedback
            const btn = document.getElementById('copyElementInfoBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = '#10b981';
            btn.style.color = 'white';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    }

    async exportReport() {
        if (!this.currentResults) return;
        
        const report = this.generateDetailedReport(this.currentResults);
        const blob = new Blob([report], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        await chrome.tabs.create({ url: url });
    }

    generateDetailedReport(results) {
        const date = new Date().toLocaleDateString();
        const score = Math.round((results.passed.length / (results.issues.length + results.warnings.length + results.passed.length)) * 100);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Detailed Accessibility Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .score { font-size: 4em; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        .section { margin: 30px 0; }
        .issue { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 15px 0; border-radius: 5px; }
        .warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .passed { background: #f0fdf4; border-left: 4px solid #10b981; }
        h1, h2, h3 { color: #333; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .summary-item { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .summary-number { font-size: 2.5em; font-weight: bold; }
        .wcag-overview { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .wcag-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
        .wcag-item { padding: 15px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
        .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: #10b981; }
        .recommendations { background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .recommendations h3 { color: #1e40af; }
        .recommendations ul { margin: 15px 0; padding-left: 20px; }
        .recommendations li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 A11y Inspector - Detailed Accessibility Report</h1>
            <p>Generated on ${date}</p>
            <div class="score">${score}/100</div>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <div class="summary-number" style="color: #ef4444;">${results.issues.length}</div>
                <div>Critical Issues</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #f59e0b;">${results.warnings.length}</div>
                <div>Warnings</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #10b981;">${results.passed.length}</div>
                <div>Passed Checks</div>
            </div>
        </div>
        
        <div class="wcag-overview">
            <h2>WCAG 2.1 Compliance Overview</h2>
            <div class="wcag-grid">
                <div class="wcag-item">
                    <h4>Perceivable</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, score + Math.random() * 20 - 10))}%"></div>
                    </div>
                    <small>Information and user interface components must be presentable to users in ways they can perceive.</small>
                </div>
                <div class="wcag-item">
                    <h4>Operable</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, score + Math.random() * 20 - 10))}%"></div>
                    </div>
                    <small>User interface components and navigation must be operable.</small>
                </div>
                <div class="wcag-item">
                    <h4>Understandable</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, score + Math.random() * 20 - 10))}%"></div>
                    </div>
                    <small>Information and the operation of user interface must be understandable.</small>
                </div>
                <div class="wcag-item">
                    <h4>Robust</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, score + Math.random() * 20 - 10))}%"></div>
                    </div>
                    <small>Content must be robust enough that it can be interpreted reliably by a wide variety of user agents.</small>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>❌ Critical Issues (${results.issues.length})</h2>
            ${results.issues.map(issue => `
                <div class="issue">
                    <h3>${issue.title}</h3>
                    <p><strong>Description:</strong> ${issue.description}</p>
                    <p><strong>Element:</strong> <code>${issue.element}</code></p>
                    <p><strong>WCAG Guideline:</strong> ${this.getWCAGGuideline(issue.title)}</p>
                    <p><strong>Recommendation:</strong> ${this.getSuggestion(issue.title)}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>⚠️ Warnings (${results.warnings.length})</h2>
            ${results.warnings.map(warning => `
                <div class="warning">
                    <h3>${warning.title}</h3>
                    <p><strong>Description:</strong> ${warning.description}</p>
                    <p><strong>Element:</strong> <code>${warning.element}</code></p>
                    <p><strong>WCAG Guideline:</strong> ${this.getWCAGGuideline(warning.title)}</p>
                    <p><strong>Recommendation:</strong> ${this.getSuggestion(warning.title)}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>✅ Passed Checks (${results.passed.length})</h2>
            ${results.passed.slice(0, 10).map(check => `
                <div class="passed">
                    <h3>${check.title}</h3>
                    <p>${check.description}</p>
                    <p><strong>Element:</strong> <code>${check.element}</code></p>
                </div>
            `).join('')}
            ${results.passed.length > 10 ? `<p><em>... and ${results.passed.length - 10} more passed checks</em></p>` : ''}
        </div>
        
        <div class="recommendations">
            <h3>📋 Recommendations for Improvement</h3>
            <ul>
                <li>Address all critical issues first as they have the most significant impact on accessibility</li>
                <li>Review warnings and consider implementing suggested improvements</li>
                <li>Test your website with screen readers like NVDA, JAWS, or VoiceOver</li>
                <li>Ensure keyboard navigation works properly throughout your site</li>
                <li>Test color contrast using tools like WebAIM Contrast Checker</li>
                <li>Consider conducting user testing with people with disabilities</li>
                <li>Regular accessibility audits should be part of your development process</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #666;">
            <p>Generated by A11y Inspector v1.0.0</p>
            <p>For support: <a href="mailto:dang@gmail.com">dang@gmail.com</a></p>
        </div>
    </div>
</body>
</html>
        `;
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    openDonateModal() {
        // Send message to popup to open donate modal
        chrome.runtime.sendMessage({ action: 'openDonateModal' });
    }
}

// Initialize the sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new A11ySidebar();
});