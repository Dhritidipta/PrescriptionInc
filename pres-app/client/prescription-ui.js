// Prescription UI: mobile preview and export helpers (moved from inline script)

function initializeMobilePreview() {
    const mobilePreview = document.querySelector('.mobile-preview');
    const previewArea = document.querySelector('.preview-area');
    const container = document.querySelector('.container');
    const buttonGroup = document.querySelector('.button-group');

    // Function to generate preview
    function generatePreview() {
        // Ensure all elements are properly displayed for capture
        document.body.style.opacity = '0';
        previewArea.style.display = 'flex';
        previewArea.style.opacity = '1';
        if (window.innerWidth <= 768) {
            buttonGroup.style.display = 'none';
        }
        container.style.transform = 'none';
        // Force layout recalculation
        container.offsetHeight;

        // Capture the prescription
        html2canvas(container, {
            scale: window.innerWidth <= 768 ? 0.8 : 2,
            width: 793,
            height: 1122,
            useCORS: true,
            logging: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            onclone: function(clonedDoc) {
                const clonedContainer = clonedDoc.querySelector('.container');
                clonedContainer.style.transform = 'none';
                clonedContainer.style.padding = '1cm 0.026458333cm'; // Match the print padding
            }
        }).then(canvas => {
            const dataUrl = canvas.toDataURL('image/png');
            mobilePreview.style.backgroundImage = `url(${dataUrl})`;
            document.body.style.opacity = '1';

            // Reset display states after capture
            if (window.innerWidth <= 768) {
                previewArea.style.display = 'none';
                mobilePreview.style.display = 'flex';
                buttonGroup.style.display = 'none';
            } else {
                buttonGroup.style.display = 'flex';
            }
        }).catch(error => {
            console.error('Preview generation failed:', error);
            document.body.style.opacity = '1';
        });
    }

    // Generate preview when images are loaded
    if (document.readyState === 'complete') {
        generatePreview();
    } else {
        window.addEventListener('load', generatePreview);
    }

    // Handle preview click
    if (mobilePreview) {
        mobilePreview.addEventListener('click', () => {
            const mobilePreviewContainer = document.querySelector('.mobile-preview-container');
            if (mobilePreviewContainer) mobilePreviewContainer.style.display = 'none';
            if (previewArea) previewArea.style.display = 'flex';
        });
    }

    // Handle preview area click to return to mobile preview
    if (previewArea) {
        previewArea.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                const mobilePreviewContainer = document.querySelector('.mobile-preview-container');
                if (mobilePreviewContainer) mobilePreviewContainer.style.display = 'flex';
                previewArea.style.display = 'none';
            }
        });
    }

    // Check if mobile view
    function checkMobileView() {
        const mobilePreviewContainer = document.querySelector('.mobile-preview-container');
        if (window.innerWidth <= 768) {
            if (mobilePreviewContainer) mobilePreviewContainer.style.display = 'flex';
            if (previewArea) previewArea.style.display = 'none';
        } else {
            if (mobilePreviewContainer) mobilePreviewContainer.style.display = 'none';
            if (previewArea) previewArea.style.display = 'flex';
        }
    }

    // Check on load and resize
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
}

// Initialize after page load
window.addEventListener('load', initializeMobilePreview);

function savePDF() {
    // Hide all buttons and UI elements before printing
    const mobilePreviewContainer = document.querySelector('.mobile-preview-container');
    const buttonGroup = document.querySelector('.button-group');
    const previewArea = document.querySelector('.preview-area');
    const container = document.querySelector('.container');
    
    // Store original display values
    const mobilePreviewDisplay = mobilePreviewContainer ? mobilePreviewContainer.style.display : '';
    const buttonGroupDisplay = buttonGroup ? buttonGroup.style.display : '';
    const previewAreaDisplay = previewArea ? previewArea.style.display : '';
    
    // Hide UI elements
    if (mobilePreviewContainer) mobilePreviewContainer.style.display = 'none';
    if (buttonGroup) buttonGroup.style.display = 'none';
    if (previewArea) previewArea.style.display = 'flex';
    if (container) container.style.transform = 'none';
    
    // Print
    window.print();
    
    // Restore original display values
    setTimeout(() => {
        if (mobilePreviewContainer) mobilePreviewContainer.style.display = mobilePreviewDisplay;
        if (buttonGroup) buttonGroup.style.display = buttonGroupDisplay;
        if (previewArea) previewArea.style.display = previewAreaDisplay;
        if (window.innerWidth <= 768 && container) {
            container.style.transform = 'scale(0.4) translateX(-50%)';
        }
    }, 100);
}


function saveImage() {
    // Hide all UI elements before capturing
    const mobilePreviewContainer = document.querySelector('.mobile-preview-container');
    const buttonGroup = document.querySelector('.button-group');
    const previewArea = document.querySelector('.preview-area');
    const container = document.querySelector('.container');
    
    // Store original display values
    const mobilePreviewDisplay = mobilePreviewContainer ? mobilePreviewContainer.style.display : '';
    const buttonGroupDisplay = buttonGroup ? buttonGroup.style.display : '';
    const previewAreaDisplay = previewArea ? previewArea.style.display : '';
    
    // Hide UI elements and prepare container
    if (mobilePreviewContainer) mobilePreviewContainer.style.display = 'none';
    if (buttonGroup) buttonGroup.style.display = 'none';
    if (previewArea) previewArea.style.display = 'flex';
    if (container) container.style.transform = 'none';

    html2canvas(container, {
        scale: 2,
        width: 793,  // A4 width in pixels at 96 DPI
        height: 1122,  // A4 height in pixels at 96 DPI
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: function(clonedDoc) {
            const clonedContainer = clonedDoc.querySelector('.container');
            if (clonedContainer) clonedContainer.style.transform = 'none';
        }
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'prescription.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Restore original display values
        if (mobilePreviewContainer) mobilePreviewContainer.style.display = mobilePreviewDisplay;
        if (buttonGroup) buttonGroup.style.display = buttonGroupDisplay;
        if (previewArea) previewArea.style.display = previewAreaDisplay;
        if (window.innerWidth <= 768 && container) {
            container.style.transform = 'scale(0.4) translateX(-50%)';
        }
    });
}
