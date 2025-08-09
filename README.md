# A11y Inspector - Web Accessibility Testing Tool

A comprehensive Firefox extension that helps developers and testers create inclusive digital experiences through real time accessibility analysis and detailed reporting.
an open source accessibility inspector i'm building from the ground up. this project is my deep dive into the world of wcag and inclusive design, created between my a level studies. it's a work in progress, and i'm documenting my journey and learning as i go.



## 🌟 Features

### Core Functionality
- **Real-time Accessibility Scanning**: Instant analysis of web pages against WCAG 2.1 guidelines
- **Comprehensive Testing**: Checks for alt text, form labels, color contrast, keyboard accessibility, and more
- **Visual Highlighting**: Highlights accessibility issues directly on the page with color-coded indicators
- **Detailed Sidebar**: In-depth analysis panel with categorized issues and suggestions
- **Export Reports**: Generate detailed accessibility reports in multiple formats (HTML, JSON, CSV)

### Advanced Features
- **WCAG Compliance**: Full compliance checking against WCAG 2.1/2.2 guidelines
- **Color Blindness Simulation**: Test how your site appears to users with different types of color blindness
- **Mobile Accessibility**: Checks for touch target sizes and mobile-specific accessibility issues
- **Custom Rules**: Define custom accessibility rules for specific project requirements
- **Scan History**: Track accessibility improvements over time
- **Context Menu Integration**: Right-click scanning for quick accessibility checks

### Accessibility Filters
- **Protanopia Simulation**: Red-blind color vision simulation
- **Deuteranopia Simulation**: Green-blind color vision simulation  
- **Tritanopia Simulation**: Blue-blind color vision simulation
- **High Contrast Mode**: Test content with increased contrast
- **Large Text Mode**: Simulate larger text sizes
- **Reduced Motion**: Test with animations disabled

## 🚀 Installation


### Firefox Add-ons Store
Coming soon! The extension will be available on the Firefox Add-ons store for easy installation.

## 📖 Usage

### Quick Scan
1. Click the A11y Inspector icon in your browser toolbar
2. Click "Quick Scan" to analyze the current page
3. View results in the popup with accessibility score and issue summary

### Detailed Analysis
1. Open the extension popup
2. Click "Detailed Analysis" or use the sidebar action
3. Explore comprehensive results with categorized issues
4. Use filters and highlighting options for deeper analysis

### Context Menu Scanning
1. Right-click on any page element
2. Select "Scan page for accessibility issues" or "Scan element for accessibility"
3. View results in the sidebar

### Exporting Reports
1. Perform a scan (quick or detailed)
2. Click "Export Report" in the popup or sidebar
3. Choose your preferred format (HTML, JSON, CSV)
4. Save the report for documentation or sharing

## 🛠️ Development

### Project Structure
```
extension/
├── manifest.json          # Extension manifest
├── popup/                 # Popup interface
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── sidebar/              # Detailed analysis sidebar
│   ├── sidebar.html
│   ├── sidebar.css
│   └── sidebar.js
├── content/              # Content script for page analysis
│   ├── content.js
│   └── content.css
├── background/           # Background service worker
│   └── background.js
├── options/              # Settings page
│   ├── options.html
│   ├── options.css
│   └── options.js
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   ├── icon-64.png
│   ├── icon-128.png
│   └── icon-1024.png
└── README.md
```

### Building the Extension

#### Prerequisites
- Firefox browser
- Basic knowledge of web development (HTML, CSS, JavaScript)
- Node.js (for development tools)

#### my Development Setup 
1. Install dependencies:
   ```bash
   # No external dependencies required - uses vanilla JavaScript
   ```

2. Generate required icons:
   ```bash
   cd icons
   ./generate-icons.sh  # Requires ImageMagick
   ```

3. Load the extension in Firefox:
   - Open `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on"
   - Select `manifest.json`

#### Testing
- Test on various websites with different accessibility features
- Verify all WCAG checks are working correctly
- Test the extension on different screen sizes and resolutions
- Ensure all UI elements are accessible

## 📊 Accessibility Checks Included

### Image Accessibility
- Missing alt text detection
- Empty alt text validation
- Decorative image identification

### Form Accessibility
- Missing form labels
- Proper label associations
- Input field descriptions

### Color and Contrast
- Color contrast ratio calculations
- Text readability checks
- Link color distinguishability

### Keyboard Accessibility
- Focus management validation
- Keyboard navigation testing
- Skip link implementation

### Semantic HTML
- Proper heading structure
- Landmark identification
- ARIA attribute validation

### Screen Reader Compatibility
- Screen reader announcements
- Document language specification
- Table header relationships

### Mobile Accessibility
- Touch target size validation
- Viewport configuration
- Responsive design checks

### Multimedia Accessibility
- Video caption requirements
- Audio description needs
- Media alternative text

## ⚙️ Configuration

### Settings Options
- **General**: Auto-scan, notifications, highlighting preferences
- **Scanning**: WCAG version, compliance level, scan frequency
- **Appearance**: Theme selection, color customization
- **Advanced**: Custom rules, data management, privacy settings

### Custom Rules
Define custom accessibility rules using JSON format:
```json
[
  {
    "name": "Custom Button Check",
    "selector": "button",
    "check": "has-aria-label",
    "severity": "warning"
  }
]
```

### Exclusions
Exclude specific elements from scanning using CSS selectors:
```css
.advertisement
#sidebar
.widget
```

## 🔧 Troubleshooting

### Common Issues

#### Extension doesn't load
- Check that all files are in the correct directory structure
- Verify `manifest.json` is valid JSON
- Ensure all required permissions are set

#### Scanning doesn't work
- Make sure the page has fully loaded
- Check that the content script has proper permissions
- Verify JavaScript is enabled on the target page

#### Icons don't display
- Generate all required icon sizes using the provided script
- Ensure icons are in PNG format with transparent backgrounds
- Check file paths in `manifest.json`

### Debug Mode
Enable debug logging by:
1. Open browser console (Ctrl+Shift+J or Cmd+Opt+J)
2. Look for "A11y Inspector" log messages
3. Check for errors in the console

## 🤝 Contributing

We welcome contributions to make A11y Inspector better! Please follow these guidelines:


### Code Standards
- Use modern JavaScript (ES6+)
- Follow accessibility best practices
- Include comments for complex logic
- Maintain consistent coding style

### Reporting Issues
- Use the issue tracker for bug reports
- Include steps to reproduce
- Provide browser and extension version information
- Include screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WCAG Guidelines**: Web Content Accessibility Guidelines Working Group
- **Firefox Extension API**: Mozilla Developer Network
- **Accessibility Community**: All contributors making the web more accessible
- **Open Source Tools**: Various tools and libraries that made this extension possible

## 📞 Support

### Getting Help
- **Email**: [kratoszesap21@gmail.com
](mailto:kratoszesap21@gmail.com
)
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs or request features through the issue tracker

### Donations
Support the continued development of A11y Inspector with cryptocurrency donations:
- **Bitcoin (BTC)**: `1NuAoERV35Qb2T5WWTH9GbEsQj9q3nSry9`
- **Ethereum (ETH)**: `0x7101349da3b604aaa9dd3b286c218b79cf735ad2`
- **solena (sol)**: `ADf9rAbntbBc7nuqNdyVhFkinEpAqodwvrNgZnrtBZzE`

## 🌍 Making the Web More Accessible

A11y Inspector is committed to creating a more inclusive web by:
- Providing free accessibility testing tools
- Educating developers about accessibility best practices
- Supporting WCAG compliance initiatives
- Promoting inclusive design principles
- doing my best

Every website tested with A11y Inspector contributes to a more accessible internet for everyone, regardless of ability.

---

**Built with good heart for a more accessible web**
