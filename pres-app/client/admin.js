// Admin page JavaScript
// API base configuration (same as index.js)
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

// Admin upload function
async function uploadVersion() {
    const adminStatus = document.getElementById('admin-status');
    adminStatus.textContent = 'Generating PDF...';

    const container = document.querySelector('.container');
    if (!container) {
        adminStatus.textContent = 'No container found to capture.';
        return;
    }

    try {
        const version = document.getElementById('admin-version').value || 'v1.0';
        const notes = document.getElementById('admin-notes').value || '';
        const printed = parseInt(document.getElementById('admin-printed').value || '1', 10);
        const file_input = document.getElementById('admin-file');
        const file = file_input && file_input.files && file_input.files[0];

        if (!file) {
            adminStatus.textContent = 'No file selected to upload.';
            return;
        }

        // Build multipart form data and append the actual File object
        const fd = new FormData();
        fd.append('file', file, file.name);
        fd.append('version', version);
        fd.append('notes', notes);
        fd.append('printedCopies', String(printed));
        
        const res = await fetch(API_BASE + '/api/admin/uploadVersion', {
            method: 'POST',
            body: fd 
        });

        if (!res.ok) throw new Error('Server render upload failed: ' + res.status);
        const json = await res.json();
        adminStatus.textContent = 'Uploaded version ' + json.version + ' (id:' + json.id + ')';
        
        // Clear form
        document.getElementById('admin-version').value = '';
        document.getElementById('admin-notes').value = '';
        document.getElementById('admin-printed').value = '1';
        document.getElementById('admin-file').value = '';
        
        return;
    } catch (err) {
        console.error(err);
        adminStatus.textContent = 'Error: ' + (err.message || err);
    }
}

// Hook admin save button on load
window.addEventListener('load', () => {
    const adminBtn = document.getElementById('admin-save-btn');
    if (adminBtn) adminBtn.addEventListener('click', uploadVersion);
});


// Render prescription details for a version
function renderPrescription(version) {
	console.log("Rendering prescription for version: ", version);
}


// Utility to fetch versions from server, fallback to empty list if endpoint not available
async function fetchVersions() {
	try {
		const res = await fetch(API_BASE + '/api/versions');
		if (!res.ok) throw new Error('no versions endpoint');
		return await res.json();
	} catch (err) {
		console.warn('fetchVersions failed, returning empty list', err);
		return [];
	}
}

async function fetchVersionById(id) {
	try {
		const res = await fetch(API_BASE + '/api/versions');
		if (!res.ok) throw new Error('no versions endpoint');
		const list = await res.json();
		return list.find(v => v.id === id);
	} catch (err) {
		console.warn('fetchVersionById failed', err);
		return null;
	}
}

// Render versions list in sidebar
function renderVersionsList(versions) {

    let sidebar = document.getElementById('versions-sidebar');
   
	if (!sidebar) {
		sidebar = document.createElement('div');
		sidebar.id = 'versions-sidebar';
		sidebar.style = 'position:fixed;left:0;top:0;height:100vh;background:#f8f8f8;border-right:1px solid #ddd;overflow-y:auto;z-index:1000;padding:10px;';
		document.body.appendChild(sidebar);
		document.body.style.marginLeft = '190px';
	}
	sidebar.innerHTML = '<h4>Versions</h4>';
	versions.forEach(v => {
		const btn = document.createElement('button');
		btn.textContent = v.version;
		btn.style = 'display:block;width:100%;margin:4px 0;padding:6px;border-radius:4px;border:1px solid #ccc;background:rgb(46 159 189 / 79%);cursor:pointer;text-align:left;';
		btn.onclick = () => selectVersion(v.id);
		sidebar.appendChild(btn);
	});
}

// Handle version selection
function selectVersion(id) {
	fetchVersionById(id).then(version => {
		if (version) {
			renderPrescription(version);
		}
	});
}

// On page load, fetch and render versions
window.addEventListener('DOMContentLoaded', () => {
	fetchVersions().then(versions => {
		renderVersionsList(versions);
		// Show latest version by default
		if (versions.length > 0) {
			selectVersion(versions[versions.length - 1].id);
		}
	});
});

