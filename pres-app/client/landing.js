// Landing page JavaScript - displays latest version PDF
const API_BASE = (() => {
    if (window.API_BASE) return window.API_BASE.replace(/\/$/, '');
    if (window.API_BASE_URL) {
        const url = window.API_BASE_URL.replace(/\/$/, '');
        if (url !== '{{API_BASE_URL}}') {
            return url;
        }
    }
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080';
    }
    return 'https://prescriptioninc-production.up.railway.app';
})();

// Fetch latest version and display PDF
async function loadLatestVersion() {
    try {
        const res = await fetch(API_BASE + '/api/versions');
        if (!res.ok) throw new Error('Failed to fetch versions');
        
        const versions = await res.json();
        if (versions.length === 0) {
            document.getElementById('pdf-container').innerHTML =
                '<p style="text-align:center;padding:40px;color:#666;">No prescription versions available yet.</p>';
            return;
        }

        const latestVersion = versions[versions.length - 1];
        const blobUrl = latestVersion.filename;

        let pdfUrl;
        if (blobUrl && blobUrl.startsWith('http')) {
            pdfUrl = blobUrl;
        } else {
            pdfUrl = API_BASE + '/api/version/' + latestVersion.id + '/pdf';
        }

        // Fetch the PDF binary
        const pdfResponse = await fetch(pdfUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf'
            }
        });
        if (!pdfResponse.ok) throw new Error('Failed to load PDF');
        const pdfData = await pdfResponse.arrayBuffer();

        // Load PDF using pdf.js
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1 });
    
        // Viewport of the browser
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
    
        // Compute max scale to:
        // 1) Fit width with side margins
        // 2) Fit height inside the screen
        const horizontalScale = (screenWidth * 0.9) / viewport.width;   // 5% margin each side
        const verticalScale = (screenHeight * 0.9) / viewport.height;  // 5% top/bottom margin
    
        const scale = Math.min(horizontalScale, verticalScale);
    
        const scaledViewport = page.getViewport({ scale });
    
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
    
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
    
        // Style: center and add left/right margin
        canvas.style.display = "block";
        canvas.style.margin = "5vh auto";       // vertical margin + auto-center
        canvas.style.maxWidth = "90vw";         // ensure never overflows width
        canvas.style.height = "auto";           // proportional scaling
    
        const renderTask = page.render({
            canvasContext: ctx,
            viewport: scaledViewport
        });
    
        await renderTask.promise;
    
        const container = document.getElementById("pdf-container");
        container.innerHTML = "";
        container.appendChild(canvas);
    }
     catch (err) {
        console.error('Failed to load latest version:', err);
        document.getElementById('pdf-container').innerHTML =
            '<p style="text-align:center;padding:40px;color:#d32f2f;">Error loading prescription. Please try again later.</p>';
    }
}


// Load latest version on page load
window.addEventListener('DOMContentLoaded', loadLatestVersion);

