const express = require('express');
const cors = require('cors');
const dbOperations = require('./db.js');

const app = express();
app.use(cors());
app.use(express.json());

// Create ride request
app.post('/api/ride-requests', async (req, res) => {
    try {
        const rideRequest = await dbOperations.createRideRequest(req.body);
        res.status(201).json(rideRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get ride request
app.get('/api/ride-requests/:id', async (req, res) => {
    try {
        const rideRequest = await dbOperations.getRideRequest(req.params.id);
        res.json(rideRequest);
    } catch (error) {
        if (error.message === 'Ride request not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Update ride request
app.put('/api/ride-requests/:id', async (req, res) => {
    try {
        const rideRequest = await dbOperations.updateRideRequest(req.params.id, req.body);
        res.json(rideRequest);
    } catch (error) {
        if (error.message === 'Ride request not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});

// Delete ride request
app.delete('/api/ride-requests/:id', async (req, res) => {
    try {
        await dbOperations.deleteRideRequest(req.params.id);
        res.status(204).send();
    } catch (error) {
        if (error.message === 'Ride request not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
