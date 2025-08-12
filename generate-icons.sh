#!/bin/bash

# Icon Generation Script for A11y Inspector
# i made this script so it can generate all required icon sizes from the main 1024x1024 icon

echo "🔧 A11y Inspector Icon Generator"
echo "================================"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   macOS: brew install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/"
    exit 1
fi


if [ ! -f "icon-1024.png" ]; then
    echo "❌ Source icon 'icon-1024.png' not found!"
    exit 1
fi

# Define required sizes
sizes=(16 32 48 64 128)

echo "📐 Generating icon sizes..."

# Generate each size
for size in "${sizes[@]}"; do
    output_file="icon-${size}.png"
    
    echo "  Creating ${size}x${size}..."
    
    # Resize the image
    convert icon-1024.png -resize "${size}x${size}" -unsharp 0x0.5+0.5+0.008 "$output_file"
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Created $output_file"
    else
        echo "  ❌ Failed to create $output_file"
    fi
done

echo ""
echo "🎉 Icon generation complete!"
echo ""
echo "Generated files:"
ls -la icon-*.png | grep -v "icon-1024.png"
echo ""
echo "📋 Next steps:"
echo "1. Verify all icons look good at their respective sizes"
echo "2. Test the extension in Firefox"
echo "3. Submit to Firefox Add-ons store"

# Show file sizes
echo ""
echo "📊 File sizes:"
for size in "${sizes[@]}"; do
    if [ -f "icon-${size}.png" ]; then
        size_bytes=$(stat -c%s "icon-${size}.png" 2>/dev/null || stat -f%z "icon-${size}.png" 2>/dev/null)
        echo "  icon-${size}.png: $((size_bytes / 1024))KB"
    fi
done
