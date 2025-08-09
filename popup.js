class A11yInspector {
    constructor() {
        this.isScanning = false;
        this.currentResults = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Quick scan button
        document.getElementById('quickScanBtn').addEventListener('click', () => {
            this.performQuickScan();
        });

        // Detailed analysis button
        document.getElementById('detailedAnalysisBtn').addEventListener('click', () => {
            this.openDetailedAnalysis();
        });

        // Export report button
        document.getElementById('exportReportBtn').addEventListener('click', () => {
            this.exportReport();
        });

        // Donate button
        document.getElementById('donateBtn').addEventListener('click', () => {
            this.openDonateModal();
        });

        // Settings link
        document.getElementById('settingsLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openSettings();
        });

        // Close donate modal
        document.getElementById('closeDonateModal').addEventListener('click', () => {
            this.closeDonateModal();
        });

        // Copy crypto address buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.copyToClipboard(e.target.dataset.address);
            });
        });

        // Close modal when clicking outside
        document.getElementById('donateModal').addEventListener('click', (e) => {
            if (e.target.id === 'donateModal') {
                this.closeDonateModal();
            }
        });
    }

    async performQuickScan() {
        if (this.isScanning) return;

        this.isScanning = true;
        const scanBtn = document.getElementById('quickScanBtn');
        const scanStatus = document.getElementById('scanStatus');
        
        // Update UI to show scanning
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<span class="btn-icon">⏳</span> Scanning...';
        scanStatus.innerHTML = '<span class="status-indicator scanning"></span> Analyzing page...';

        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Execute content script to perform accessibility scan
            const results = await chrome.tabs.sendMessage(tab.id, { action: 'quickScan' });
            
            this.currentResults = results;
            this.displayResults(results);
            
        } catch (error) {
            console.error('Scan failed:', error);
            scanStatus.innerHTML = '<span class="status-indicator error"></span> Scan failed';
        } finally {
            // Reset UI
            this.isScanning = false;
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<span class="btn-icon">🔍</span> Quick Scan';
            
            if (!this.currentResults) {
                scanStatus.innerHTML = '<span class="status-indicator"></span> Ready to scan';
            }
        }
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const scoreNumber = document.getElementById('scoreNumber');
        const scoreCircle = document.getElementById('scoreCircle');
        const issuesCount = document.getElementById('issuesCount');
        const warningsCount = document.getElementById('warningsCount');
        const passedCount = document.getElementById('passedCount');
        const issuesList = document.getElementById('issuesList');

        // Calculate score
        const totalChecks = results.issues.length + results.warnings.length + results.passed.length;
        const score = Math.round((results.passed.length / totalChecks) * 100);
        
        // Update score circle
        scoreNumber.textContent = score;
        scoreCircle.style.setProperty('--score', `${(score / 100) * 360}deg`);
        
        // Update counters
        issuesCount.textContent = results.issues.length;
        warningsCount.textContent = results.warnings.length;
        passedCount.textContent = results.passed.length;
        
        // Update issues list
        issuesList.innerHTML = '';
        const topIssues = results.issues.slice(0, 5);
        
        topIssues.forEach(issue => {
            const issueItem = document.createElement('div');
            issueItem.className = 'issue-item';
            issueItem.innerHTML = `
                <span class="issue-icon">❌</span>
                <span class="issue-text">${issue.description}</span>
            `;
            issuesList.appendChild(issueItem);
        });

        // Show results section
        resultsSection.style.display = 'block';
        
        // Update scan status
        const scanStatus = document.getElementById('scanStatus');
        scanStatus.innerHTML = `<span class="status-indicator success"></span> Scan complete`;
    }

    openDetailedAnalysis() {
        // Open sidebar
        chrome.sidebarAction.open();
    }

    async exportReport() {
        if (!this.currentResults) {
            alert('Please perform a scan first');
            return;
        }

        const report = this.generateReport(this.currentResults);
        const blob = new Blob([report], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.create({ url: url });
    }

    generateReport(results) {
        const date = new Date().toLocaleDateString();
        const score = Math.round((results.passed.length / (results.issues.length + results.warnings.length + results.passed.length)) * 100);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Accessibility Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 3em; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        .section { margin: 20px 0; }
        .issue { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .passed { background: #f0fdf4; border-left: 4px solid #10b981; }
        h1, h2 { color: #333; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .summary-item { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .summary-number { font-size: 2em; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 A11y Inspector Report</h1>
            <p>Generated on ${date}</p>
            <div class="score">${score}/100</div>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <div class="summary-number" style="color: #ef4444;">${results.issues.length}</div>
                <div>Issues</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #f59e0b;">${results.warnings.length}</div>
                <div>Warnings</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #10b981;">${results.passed.length}</div>
                <div>Passed</div>
            </div>
        </div>
        
        <div class="section">
            <h2>❌ Critical Issues</h2>
            ${results.issues.map(issue => `
                <div class="issue">
                    <strong>${issue.title}</strong>
                    <p>${issue.description}</p>
                    <small>Element: ${issue.element}</small>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>⚠️ Warnings</h2>
            ${results.warnings.map(warning => `
                <div class="issue warning">
                    <strong>${warning.title}</strong>
                    <p>${warning.description}</p>
                    <small>Element: ${warning.element}</small>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>✅ Passed Checks</h2>
            ${results.passed.map(check => `
                <div class="issue passed">
                    <strong>${check.title}</strong>
                    <p>${check.description}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
        `;
    }

    openDonateModal() {
        document.getElementById('donateModal').style.display = 'block';
    }

    closeDonateModal() {
        document.getElementById('donateModal').style.display = 'none';
    }

    openSettings() {
        chrome.runtime.openOptionsPage();
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.background = '#10b981';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '#667eea';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new A11yInspector();
});