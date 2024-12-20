// Function to navigate to test scenarios
function goToTest(feature) {
    window.location.href = `scenarios/${feature}/index.html`;
}

// Function to update test status
function updateTestStatus(featureId, status) {
    const featureItem = document.querySelector(`[data-feature-id="${featureId}"]`);
    if (featureItem) {
        const statusElement = featureItem.querySelector('.status');
        statusElement.className = `status ${status}`;
        statusElement.textContent = status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

// Load test statuses from localStorage if available
document.addEventListener('DOMContentLoaded', () => {
    const features = document.querySelectorAll('.feature-item');
    features.forEach(feature => {
        const featureName = feature.querySelector('.feature-name').textContent;
        const storedStatus = localStorage.getItem(`smoke-test-status-${featureName}`);
        if (storedStatus) {
            const statusElement = feature.querySelector('.status');
            statusElement.className = `status ${storedStatus}`;
            statusElement.textContent = storedStatus.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
    });
});

// Function to update test status (can be called from test pages)
window.updateFeatureStatus = function(featureName, status) {
    localStorage.setItem(`smoke-test-status-${featureName}`, status);
    const features = document.querySelectorAll('.feature-item');
    features.forEach(feature => {
        const name = feature.querySelector('.feature-name').textContent;
        if (name === featureName) {
            const statusElement = feature.querySelector('.status');
            statusElement.className = `status ${status}`;
            statusElement.textContent = status.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
    });
};
