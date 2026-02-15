export const simpleMdToHtml = (md: string) => {
    if (!md) return '';
    let html = md
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Headings
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold/Italic
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim, '<i>$1</i>')
        // Lists
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d\. (.*$)/gim, '<li>$1</li>')
        // Quote
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Image regex tailored for standard MD images
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width:100%; border-radius: 8px; margin: 10px 0;" />')
        // Links - Improved Regex
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color: #818cf8; text-decoration: underline;">$1</a>')
        // Custom Download Button
        .replace(/\[\[DOWNLOAD:(.*?):(.*?)\]\]/gim, '<div data-download-url="$1" data-download-label="$2" style="background:#1e1b4b; border:1px solid #4338ca; padding:10px; border-radius:8px; display:inline-block; margin: 10px 0; font-weight:bold; color:#a5b4fc; cursor:pointer;">⬇️ Download: $2</div>')
        // Newlines
        .replace(/\n/g, '<br>');
    return html;
};

export const simpleHtmlToMd = (html: string) => {
    let text = html;
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<div>/gi, '\n');
    text = text.replace(/<\/div>/gi, '');
    text = text.replace(/<p>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<b>|<strong>/gi, '**');
    text = text.replace(/<\/b>|<\/strong>/gi, '**');
    text = text.replace(/<i>|<em>/gi, '*');
    text = text.replace(/<\/i>|<\/em>/gi, '*');
    text = text.replace(/<h1>/gi, '# ');
    text = text.replace(/<\/h1>/gi, '\n');
    text = text.replace(/<h2>/gi, '## ');
    text = text.replace(/<\/h2>/gi, '\n');
    text = text.replace(/<h3>/gi, '### ');
    text = text.replace(/<\/h3>/gi, '\n');
    text = text.replace(/<ul>|<ol>/gi, '');
    text = text.replace(/<\/ul>|<\/ol>/gi, '');
    text = text.replace(/<li>/gi, '- ');
    text = text.replace(/<\/li>/gi, '\n');
    
    // Blockquote handling
    text = text.replace(/<blockquote[^>]*>/gi, '> ');
    text = text.replace(/<\/blockquote>/gi, '\n');
    
    // Robust Image Regex
    text = text.replace(/<img\s+[^>]*src="([^"]+)"\s+[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
    text = text.replace(/<img\s+[^>]*alt="([^"]*)"\s+[^>]*src="([^"]+)"[^>]*>/gi, '![$1]($2)');
    text = text.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, '![]($1)');

    // Link Handling
    text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Robust Download Regex
    text = text.replace(/<div\s+[^>]*data-download-url="([^"]+)"\s+[^>]*data-download-label="([^"]+)"[^>]*>.*?<\/div>/gi, '[[DOWNLOAD:$1:$2]]');
    text = text.replace(/<div\s+[^>]*data-download-label="([^"]+)"\s+[^>]*data-download-url="([^"]+)"[^>]*>.*?<\/div>/gi, '[[DOWNLOAD:$2:$1]]');

    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return text.trim();
};
