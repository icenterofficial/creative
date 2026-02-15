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
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="editor-image" />')
        // Links - Improved Regex
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="editor-link">$1</a>')
        // Custom Download Button - Professional Card Style
        .replace(/\[\[DOWNLOAD:(.*?):(.*?)\]\]/gim, (match, url, label) => {
            return `
                <div class="download-card-wrapper" contenteditable="false">
                    <div class="download-card" data-download-url="${url}" data-download-label="${label}">
                        <div class="download-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </div>
                        <div class="download-info">
                            <span class="download-label">${label}</span>
                            <span class="download-sub">Click to download resource</span>
                        </div>
                        <div class="download-action">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </div>
                    </div>
                </div><br/>
            `;
        })
        // Newlines
        .replace(/\n/g, '<br>');
    return html;
};

export const simpleHtmlToMd = (html: string) => {
    let text = html;
    
    // Clean up structural HTML for conversion
    text = text.replace(/<div class="download-card-wrapper"[^>]*>([\s\S]*?)<\/div><br>/gi, '$1');
    text = text.replace(/<div class="download-card-wrapper"[^>]*>([\s\S]*?)<\/div>/gi, '$1');

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
    
    // Robust Download Regex - Extracts data from the container div attributes
    text = text.replace(/<div\s+[^>]*class="download-card"[^>]*data-download-url="([^"]+)"\s+[^>]*data-download-label="([^"]+)"[^>]*>[\s\S]*?<\/div>/gi, '[[DOWNLOAD:$1:$2]]');

    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return text.trim();
};
