/**
 * Card Generator Utility - Exact Reference Design Match
 * Generates product cards matching the uploaded reference image (400x600px)
 */

export async function generateProductCard(product, customPrice = "", customDescription = "") {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 400;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    const brandBlue = '#2B7FED';
    const lightBlueBg = '#E8F1FC';
    const darkText = '#1A1A1A';
    const grayText = '#6B7280';

    // White card background
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 0, 0, width, height, 24, true);

    // Top section: Logo + Company Name
    const headerY = 30;
    try {
        const logo = await loadImage('/Logo.png');
        ctx.drawImage(logo, 30, headerY, 40, 40);
    } catch (e) { }
    ctx.fillStyle = darkText;
    ctx.font = 'bold 16px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('HI TECH SALES AND SERVICES', 85, headerY + 25);

    // Separator line (blue gradient)
    const lineY = headerY + 55;
    const lineGradient = ctx.createLinearGradient(0, lineY, width, lineY);
    lineGradient.addColorStop(0, '#2B7FED');
    lineGradient.addColorStop(1, '#60A5FA');
    ctx.fillStyle = lineGradient;
    ctx.fillRect(30, lineY, width - 60, 3);

    // Image section background
    const imgSectionY = lineY + 20;
    const imgSectionHeight = 280;
    ctx.fillStyle = lightBlueBg;
    roundRect(ctx, 25, imgSectionY, width - 50, imgSectionHeight, 20, true);

    // Product image
    const imgSize = 240;
    const imgX = (width - imgSize) / 2;
    const imgY = imgSectionY + 20;

    if (product.image_url) {
        try {
            const productImg = await loadImage(product.image_url);
            ctx.save();
            roundRect(ctx, imgX, imgY, imgSize, imgSize, 16, false);
            ctx.clip();
            const scale = Math.max(imgSize / productImg.width, imgSize / productImg.height);
            const scaledWidth = productImg.width * scale;
            const scaledHeight = productImg.height * scale;
            const offsetX = imgX + (imgSize - scaledWidth) / 2;
            const offsetY = imgY + (imgSize - scaledHeight) / 2;
            ctx.drawImage(productImg, offsetX, offsetY, scaledWidth, scaledHeight);
            ctx.restore();
        } catch (e) {
            drawPlaceholder(ctx, imgX, imgY, imgSize, imgSize, grayText, width);
        }
    } else {
        drawPlaceholder(ctx, imgX, imgY, imgSize, imgSize, grayText, width);
    }

    // Product details
    let currentY = imgSectionY + imgSectionHeight + 25;

    // Product name
    ctx.fillStyle = darkText;
    ctx.font = 'bold 20px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    const nameLines = wrapText(ctx, product.product_name.toUpperCase(), width - 60, 20);
    nameLines.slice(0, 2).forEach((line, i) => ctx.fillText(line, 30, currentY + (i * 26)));
    currentY += nameLines.slice(0, 2).length * 26 + 12;

    // Category badge
    if (product.category) {
        ctx.fillStyle = brandBlue;
        const categoryText = product.category;
        ctx.font = '600 13px Inter, sans-serif';
        const categoryWidth = ctx.measureText(categoryText).width + 24;
        roundRect(ctx, 30, currentY, categoryWidth, 28, 14, true);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText(categoryText, 42, currentY + 18);
        currentY += 40;
    }

    // Description
    const description = customDescription || product.description || '';
    if (description) {
        ctx.fillStyle = grayText;
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';
        const descLines = wrapText(ctx, description, width - 60, 14);
        descLines.slice(0, 2).forEach((line, i) => ctx.fillText(line, 30, currentY + (i * 20)));
        currentY += Math.min(descLines.length, 2) * 20 + 20;
    }

    // Price button
    if (customPrice) {
        const buttonY = height - 80;
        const buttonHeight = 60;
        const btnGradient = ctx.createLinearGradient(0, buttonY, 0, buttonY + buttonHeight);
        btnGradient.addColorStop(0, '#3B82F6');
        btnGradient.addColorStop(1, '#2563EB');
        ctx.fillStyle = btnGradient;
        roundRect(ctx, 30, buttonY, width - 60, buttonHeight, 16, true);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`₹${customPrice}`, width / 2, buttonY + 40);
    }

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
    });
}

function drawPlaceholder(ctx, x, y, size, color, canvasWidth) {
    ctx.fillStyle = '#D1D5DB';
    roundRect(ctx, x, y, size, size, 16, true);
    ctx.fillStyle = color;
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No Image', canvasWidth / 2, y + size / 2);
}

function roundRect(ctx, x, y, width, height, radius, fill = false, stroke = false) {
    if (typeof radius === 'number') radius = [radius, radius, radius, radius];
    ctx.beginPath();
    ctx.moveTo(x + radius[0], y);
    ctx.lineTo(x + width - radius[1], y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius[1]);
    ctx.lineTo(x + width, y + height - radius[2]);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius[2], y + height);
    ctx.lineTo(x + radius[3], y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius[3]);
    ctx.lineTo(x, y + radius[0]);
    ctx.quadraticCurveTo(x, y, x + radius[0], y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function wrapText(ctx, text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        if (ctx.measureText(currentLine + " " + word).width < maxWidth) currentLine += " " + word;
        else { lines.push(currentLine); currentLine = word; }
    }
    lines.push(currentLine);
    return lines;
}

export function downloadImage(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function shareToWhatsApp(blob, productName) {
    if (navigator.share && navigator.canShare) {
        const file = new File([blob], `${productName}.png`, { type: 'image/png' });
        try { await navigator.share({ files: [file], title: productName }); return true; }
        catch (err) { console.error(err); return false; }
    }
    return false;
}
