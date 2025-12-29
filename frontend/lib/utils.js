import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const formatImageUrl = (url) => {
    if (!url) return null;

    // Handle Google Drive Links
    // Convert https://drive.google.com/file/d/ID/view... to https://drive.google.com/uc?export=view&id=ID
    if (url.includes('drive.google.com') && url.includes('/file/d/')) {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            // Try the thumbnail endpoint which is often more permissive for embedding
            return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
        }
    }

    // Handle standard 'open?id=' links
    if (url.includes('drive.google.com') && url.includes('id=')) {
        return url.replace('open?', 'uc?export=view&');
    }

    return url;
};
