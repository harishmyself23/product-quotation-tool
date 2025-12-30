/**
 * High-Fidelity Card Generator (2x Retina Quality)
 * Matches exact visual depth with high-DPI rendering.
 */

export async function generateProductCard(product, customPrice = "", customDescription = "") {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Logical size (design size)
    const width = 400;
    const height = 600;

    // 🔥 SCALE FACTOR (2x for high quality)
    const scale = 2;

    // Physical canvas size
    canvas.width = width * scale;
    canvas.height = height * scale;

    // Logical canvas size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale drawing operations
    ctx.scale(scale, scale);

    // Design System Colors
    const colors = {
        background: '#F3F4F6',
        cardBg: '#FFFFFF',
        brandBlue: '#2563EB',
        textDark: '#111827',
        textGray: '#6B7280'
    };

    // 1. Canvas background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    // 2. Floating card
    const cardPadding = 25;
    const cardW = width - cardPadding * 2;
    const cardH = height - cardPadding * 2;
    const cardX = cardPadding;
    const cardY = cardPadding;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = colors.cardBg;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32, true);
    ctx.restore();

    const contentLeft = cardX + 24;
    const contentW = cardW - 48;
    let cursorY = cardY + 40;

    // 3. Header
    const logoSize = 32;
    try {
        const logo = await loadImage('/Logo.png');
        ctx.drawImage(logo, contentLeft, cursorY - 5, logoSize, logoSize);
    } catch {
        ctx.fillStyle = colors.brandBlue;
        roundRect(ctx, contentLeft, cursorY - 5, logoSize, logoSize, 8, true);
    }

    ctx.fillStyle = colors.textDark;
    ctx.font = 'bold 15px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('HI TECH SALES AND SERVICES', contentLeft + 45, cursorY + 16);

    // Separator
    cursorY += 45;
    const sepGrad = ctx.createLinearGradient(contentLeft, cursorY, contentLeft + contentW, cursorY);
    sepGrad.addColorStop(0, '#3B82F6');
    sepGrad.addColorStop(1, '#93C5FD');
    ctx.fillStyle = sepGrad;
    roundRect(ctx, contentLeft, cursorY, contentW, 3, 1.5, true);

    // 4. Image tray
    cursorY += 25;
    const trayH = 260;

    ctx.save();
    const trayGrad = ctx.createLinearGradient(contentLeft, cursorY, contentLeft, cursorY + trayH);
    trayGrad.addColorStop(0, '#EFF6FF');
    trayGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = trayGrad;
    roundRect(ctx, contentLeft, cursorY, contentW, trayH, 24, true);

    ctx.strokeStyle = 'rgba(59,130,246,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.clip();
    ctx.shadowColor = 'rgba(0,0,0,0.05)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.strokeRect(contentLeft - 10, cursorY - 10, contentW + 20, trayH + 20);
    ctx.restore();

    // Product image
    if (product.image_url) {
        try {
            const pad = 20;
            const availW = contentW - pad * 2;
            const availH = trayH - pad * 2;
            const img = await loadImage(product.image_url);

            const scaleImg = Math.min(availW / img.width, availH / img.height);
            const drawW = img.width * scaleImg;
            const drawH = img.height * scaleImg;
            const drawX = contentLeft + (contentW - drawW) / 2;
            const drawY = cursorY + (trayH - drawH) / 2;

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
        } catch {
            ctx.fillStyle = '#E5E7EB';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No Image', contentLeft + contentW / 2, cursorY + trayH / 2);
        }
    }

    // Typography
    cursorY += trayH + 25;

    ctx.fillStyle = '#000';
    ctx.font = '800 22px Inter, sans-serif';
    const title = (product.product_name || 'PRODUCT NAME').toUpperCase();
    const titleLines = wrapText(ctx, title, contentW);
    titleLines.slice(0, 2).forEach((l, i) => {
        ctx.fillText(l, contentLeft, cursorY + i * 26);
    });
    cursorY += titleLines.length * 26 + 10;

    if (product.category) {
        ctx.font = '600 12px Inter, sans-serif';
        const pad = 12;
        const bw = ctx.measureText(product.category).width + pad * 2;
        ctx.fillStyle = '#3B82F6';
        roundRect(ctx, contentLeft, cursorY - 10, bw, 24, 12, true);
        ctx.fillStyle = '#FFF';
        ctx.fillText(product.category, contentLeft + pad, cursorY + 6);
        cursorY += 30;
    }

    const desc = customDescription || product.description || '';
    if (desc) {
        ctx.fillStyle = colors.textGray;
        ctx.font = '14px Inter, sans-serif';
        const lines = wrapText(ctx, desc, contentW);
        lines.slice(0, 2).forEach((l, i) => {
            ctx.fillText(l, contentLeft, cursorY + i * 20);
        });
    }

    // Price Button
    if (customPrice) {
        const btnH = 60;
        const btnY = cardY + cardH - btnH - 24;

        ctx.save();
        ctx.shadowColor = 'rgba(37,99,235,0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 8;

        const btnGrad = ctx.createLinearGradient(contentLeft, btnY, contentLeft, btnY + btnH);
        btnGrad.addColorStop(0, '#60A5FA');
        btnGrad.addColorStop(1, '#2563EB');
        ctx.fillStyle = btnGrad;
        roundRect(ctx, contentLeft, btnY, contentW, btnH, 16, true);
        ctx.restore();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`₹${customPrice}`, contentLeft + contentW / 2, btnY + 40);
    }

    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
    });
}

/* ---------------- Utilities ---------------- */

function roundRect(ctx, x, y, w, h, r, fill = false, stroke = false) {
    if (typeof r === 'number') r = [r, r, r, r];
    ctx.beginPath();
    ctx.moveTo(x + r[0], y);
    ctx.lineTo(x + w - r[1], y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r[1]);
    ctx.lineTo(x + w, y + h - r[2]);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
    ctx.lineTo(x + r[3], y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r[3]);
    ctx.lineTo(x, y + r[0]);
    ctx.quadraticCurveTo(x, y, x + r[0], y);
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

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
        const test = line + ' ' + words[i];
        if (ctx.measureText(test).width < maxWidth) line = test;
        else {
            lines.push(line);
            line = words[i];
        }
    }
    lines.push(line);
    return lines;
}

/* ---------- EXPORT HELPERS ---------- */

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
        try {
            await navigator.share({
                files: [file],
                title: productName
            });
            return true;
        } catch (err) {
            console.error('Share failed', err);
            return false;
        }
    }
    return false;
}
