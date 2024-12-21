// Function to navigate to test pages
function goToTest(type, feature) {
    const baseUrl = type === 'unit' ? 'unit-tests' : 'integration-tests';
    window.location.href = `${baseUrl}/${feature}/index.html`;
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
        
        // Load unit test status
        const unitStatus = localStorage.getItem(`unit-test-${featureName}`);
        if (unitStatus) {
            const unitButton = feature.querySelector('.unit-test');
            unitButton.classList.add(unitStatus);
            if (unitStatus === 'test-failed') {
                unitButton.style.backgroundColor = '#ffcdd2';
                unitButton.style.color = '#c62828';
            } else if (unitStatus === 'test-passed') {
                unitButton.style.backgroundColor = '#c8e6c9';
                unitButton.style.color = '#2e7d32';
            }
        }

        // Load integration test status
        const integrationStatus = localStorage.getItem(`integration-test-${featureName}`);
        if (integrationStatus) {
            const integrationButton = feature.querySelector('.integration-test');
            integrationButton.classList.add(integrationStatus);
            if (integrationStatus === 'test-failed') {
                integrationButton.style.backgroundColor = '#ffcdd2';
                integrationButton.style.color = '#c62828';
            } else if (integrationStatus === 'test-passed') {
                integrationButton.style.backgroundColor = '#c8e6c9';
                integrationButton.style.color = '#2e7d32';
            }
        }

        // Update overall feature status
        const storedStatus = localStorage.getItem(`test-status-${featureName}`);
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
    localStorage.setItem(`test-status-${featureName}`, status);
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

// Function to update specific test type status
window.updateTestTypeStatus = function(featureName, testType, status) {
    const storageKey = `${testType}-test-${featureName}`;
    localStorage.setItem(storageKey, status);
    
    const features = document.querySelectorAll('.feature-item');
    features.forEach(feature => {
        const name = feature.querySelector('.feature-name').textContent;
        if (name === featureName) {
            const button = feature.querySelector(`.${testType}-test`);
            if (button) {
                button.classList.remove('test-passed', 'test-failed');
                button.classList.add(status);
                
                if (status === 'test-failed') {
                    button.style.backgroundColor = '#ffcdd2';
                    button.style.color = '#c62828';
                } else if (status === 'test-passed') {
                    button.style.backgroundColor = '#c8e6c9';
                    button.style.color = '#2e7d32';
                }
            }
        }
    });
};
