// Mock API for prescription versions (replace with real API calls later)
const mockVersions = [
	{
		id: 1,
		version: 'v1.0',
		modifiedDate: '2025-11-01',
		notes: 'Initial version',
		printedCopies: 2,
		content: 'Prescription content for v1.0',
	},
	{
		id: 2,
		version: 'v1.1',
		modifiedDate: '2025-11-15',
		notes: 'Minor update',
		printedCopies: 1,
		content: 'Prescription content for v1.1',
	},
	// Add more versions as needed
];

const isMobile = () => screen.width <= 768

// Utility to fetch versions (mocked)
function fetchVersions() {
	// Simulate async fetch
	return Promise.resolve(mockVersions);
}

// Utility to fetch a specific version by id (mocked)
function fetchVersionById(id) {
	return Promise.resolve(mockVersions.find(v => v.id === id));
}

// Render versions list in sidebar
function renderVersionsList(versions) {

    let sidebar = document.getElementById('versions-sidebar');
    if (isMobile()){
        
    }
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

// Render prescription details for a version
function renderPrescription(version) {
	// Main prescription container (assume exists)
	let main = document.getElementById('prescription-main');
	if (!main) {
		main = document.createElement('div');
		main.id = 'prescription-main';
		main.style = 'margin:20px;';
		document.body.appendChild(main);
	}
	main.innerHTML = `
		<h2>Prescription - ${version.version}</h2>
		<div><strong>Modified:</strong> ${version.modifiedDate}</div>
		<div><strong>Notes:</strong> ${version.notes}</div>
		<div><strong>Printed Copies:</strong> ${version.printedCopies}</div>
		<hr>
		<div id="prescription-content">${version.content}</div>
	`;
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
