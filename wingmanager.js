// Mock data for testing - will be replaced with actual API calls
const mockRequests = [
    {
        id: 'REQ-001',
        pickup_location: 'Financial District, 101 California St',
        destination: 'SoMa, 123 4th Street',
        status: 'pending',
        timestamp: new Date().toISOString(),
        estimated_fare: '$25.00',
        eta: '15 mins',
        distance: '2.3 miles'
    },
    {
        id: 'REQ-002',
        pickup_location: 'Union Square, 333 Post St',
        destination: 'Marina District, 2100 Chestnut St',
        status: 'pending',
        timestamp: new Date().toISOString(),
        estimated_fare: '$32.50',
        eta: '20 mins',
        distance: '3.1 miles'
    },
    {
        id: 'REQ-003',
        pickup_location: 'Hayes Valley, 450 Hayes St',
        destination: 'Mission District, 2500 Mission St',
        status: 'pending',
        timestamp: new Date().toISOString(),
        estimated_fare: '$28.75',
        eta: '18 mins',
        distance: '2.8 miles'
    }
];

class WingManager {
    constructor() {
        this.requests = [];
        this.selectedRequestId = null;
        this.initializeUI();
        this.loadRequests();
    }

    initializeUI() {
        // Initialize modal
        this.modal = document.getElementById('requestModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.requestList = document.getElementById('requestList');

        // Event listeners
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Action buttons
        document.querySelector('.accept-btn').addEventListener('click', () => this.handleAction('accept'));
        document.querySelector('.decline-btn').addEventListener('click', () => this.handleAction('decline'));
        document.querySelector('.delegate-btn').addEventListener('click', () => this.handleAction('delegate'));

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    async loadRequests() {
        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/ride-requests');
            // this.requests = await response.json();
            this.requests = mockRequests; // Using mock data for now
            this.updateRequestList();
            this.updateStats();
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    }

    updateRequestList() {
        this.requestList.innerHTML = '';
        this.requests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'request-item';
            requestElement.dataset.requestId = request.id;
            
            requestElement.innerHTML = `
                <div class="request-details">
                    <div class="request-id">${request.id}</div>
                    <div class="request-locations">
                        <div>FROM: ${request.pickup_location}</div>
                        <div>TO: ${request.destination}</div>
                    </div>
                    <div class="request-info">
                        <div class="request-time">ETA: ${request.eta}</div>
                        <div class="request-distance">Distance: ${request.distance}</div>
                    </div>
                </div>
                <div class="request-price">${request.estimated_fare}</div>
            `;

            requestElement.addEventListener('click', () => this.openRequestModal(request.id));
            this.requestList.appendChild(requestElement);
        });
    }

    updateStats() {
        const activeRequests = this.requests.filter(r => r.status === 'active').length;
        const pendingRequests = this.requests.filter(r => r.status === 'pending').length;
        
        document.querySelector('.queue-stats').innerHTML = `
            <span>ACTIVE: <span class="stat-value">${activeRequests}</span></span>
            <span>PENDING: <span class="stat-value">${pendingRequests}</span></span>
        `;
    }

    openRequestModal(requestId) {
        this.selectedRequestId = requestId;
        const request = this.requests.find(r => r.id === requestId);
        
        // Update modal content with request details
        const modalContent = document.querySelector('.retro-modal-content');
        const headerText = modalContent.querySelector('h3');
        headerText.textContent = `REQUEST ${requestId}`;
        
        this.modal.classList.add('show');
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.selectedRequestId = null;
    }

    async handleAction(action) {
        if (!this.selectedRequestId) return;

        try {
            const request = this.requests.find(r => r.id === this.selectedRequestId);
            if (!request) return;

            // TODO: Replace with actual API calls
            switch (action) {
                case 'accept':
                    request.status = 'active';
                    // await fetch(`/api/ride-requests/${this.selectedRequestId}`, {
                    //     method: 'PUT',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify({ status: 'active' })
                    // });
                    break;
                case 'decline':
                    request.status = 'declined';
                    // await fetch(`/api/ride-requests/${this.selectedRequestId}`, {
                    //     method: 'PUT',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify({ status: 'declined' })
                    // });
                    break;
                case 'delegate':
                    request.status = 'delegated';
                    // await fetch(`/api/ride-requests/${this.selectedRequestId}/delegate`, {
                    //     method: 'POST'
                    // });
                    break;
            }

            this.updateRequestList();
            this.updateStats();
            this.closeModal();
        } catch (error) {
            console.error('Error handling action:', error);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WingManager();
});
