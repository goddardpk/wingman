// Database operations module
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('wingman.db');

// Debug logging helper
const logDbOperation = (operation, query, params = []) => {
    const timestamp = new Date().toISOString();
    console.log('\n[DB Operation]', timestamp);
    console.log('Operation:', operation);
    console.log('Query:', query);
    console.log('Parameters:', params);
};

const dbOperations = {
    // Vehicle type operations
    getVehicleTypes: () => {
        const query = 'SELECT * FROM vehicle_types ORDER BY base_fare';
        logDbOperation('getVehicleTypes', query);
        
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                console.log('Result: Found', rows?.length || 0, 'vehicle types');
                resolve(rows);
            });
        });
    },

    // Account operations
    createAccount: (data) => {
        const query = `INSERT INTO accounts (email, full_name, phone, created_at, updated_at) 
                      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        logDbOperation('createAccount', query, [data.email, data.fullName, data.phone]);

        return new Promise((resolve, reject) => {
            db.run(query, [data.email, data.fullName, data.phone],
                function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            reject(new Error('Email already exists'));
                        } else {
                            reject(err);
                        }
                        return;
                    }
                    
                    const selectQuery = `SELECT a.*, ap.notifications_enabled, ap.preferred_language 
                                       FROM accounts a 
                                       LEFT JOIN account_preferences ap ON a.id = ap.account_id 
                                       WHERE a.id = ?`;
                    logDbOperation('getCreatedAccount', selectQuery, [this.lastID]);
                    
                    db.get(selectQuery, [this.lastID], (err, row) => {
                        if (err) reject(err);
                        console.log('Result: Created account with ID', this.lastID);
                        resolve(row);
                    });
                }
            );
        });
    },

    getAccount: (email) => {
        const query = `SELECT a.*, ap.notifications_enabled, ap.preferred_language 
                      FROM accounts a 
                      LEFT JOIN account_preferences ap ON a.id = ap.account_id 
                      WHERE a.email = ?`;
        logDbOperation('getAccount', query, [email]);

        return new Promise((resolve, reject) => {
            db.get(query, [email], (err, row) => {
                if (err) reject(err);
                if (!row) reject(new Error('Account not found'));
                console.log('Result:', row ? 'Account found' : 'Account not found');
                resolve(row);
            });
        });
    },

    updateAccount: (email, data) => {
        const query = `UPDATE accounts 
                      SET full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP 
                      WHERE email = ?`;
        logDbOperation('updateAccount', query, [data.fullName, data.phone, email]);

        return new Promise((resolve, reject) => {
            db.run(query, [data.fullName, data.phone, email],
                function(err) {
                    if (err) reject(err);
                    if (this.changes === 0) {
                        reject(new Error('Account not found'));
                        return;
                    }

                    const selectQuery = `SELECT a.*, ap.notifications_enabled, ap.preferred_language 
                                       FROM accounts a 
                                       LEFT JOIN account_preferences ap ON a.id = ap.account_id 
                                       WHERE a.email = ?`;
                    logDbOperation('getUpdatedAccount', selectQuery, [email]);

                    db.get(selectQuery, [email], (err, row) => {
                        if (err) reject(err);
                        console.log('Result: Updated account for email', email);
                        resolve(row);
                    });
                }
            );
        });
    },

    deleteAccount: (email) => {
        const query = 'DELETE FROM accounts WHERE email = ?';
        logDbOperation('deleteAccount', query, [email]);

        return new Promise((resolve, reject) => {
            db.run(query, [email], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                if (this.changes === 0) {
                    reject(new Error('Account not found'));
                    return;
                }
                console.log('Result: Deleted account with email', email);
                resolve({ deleted: true });
            });
        });
    },

    getPaymentMethods: (accountId) => {
        const query = 'SELECT * FROM payment_methods WHERE account_id = ?';
        logDbOperation('getPaymentMethods', query, [accountId]);

        return new Promise((resolve, reject) => {
            db.all(query, [accountId], (err, rows) => {
                if (err) reject(err);
                console.log('Result: Found', rows?.length || 0, 'payment methods');
                resolve(rows);
            });
        });
    },

    // Driver operations
    getAllDrivers: () => {
        const query = 'SELECT * FROM drivers ORDER BY status, full_name';
        logDbOperation('getAllDrivers', query);

        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                console.log('Result: Found', rows?.length || 0, 'drivers');
                resolve(rows);
            });
        });
    },

    searchDrivers: (searchTerm) => {
        const query = `SELECT * FROM drivers 
                      WHERE full_name LIKE ? OR driver_id LIKE ?
                      ORDER BY status, full_name`;
        logDbOperation('searchDrivers', query, [`%${searchTerm}%`, `%${searchTerm}%`]);

        return new Promise((resolve, reject) => {
            db.all(query, [`%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
                if (err) reject(err);
                console.log('Result: Found', rows?.length || 0, 'drivers matching search');
                resolve(rows);
            });
        });
    },

    filterDriversByStatus: (status) => {
        const query = 'SELECT * FROM drivers WHERE status = ? ORDER BY full_name';
        logDbOperation('filterDriversByStatus', query, [status]);

        return new Promise((resolve, reject) => {
            db.all(query, [status], (err, rows) => {
                if (err) reject(err);
                console.log('Result: Found', rows?.length || 0, 'drivers with status', status);
                resolve(rows);
            });
        });
    },

    // Ride Request operations
    createRideRequest: (data) => {
        return new Promise((resolve, reject) => {
            const vehicleTypeQuery = 'SELECT * FROM vehicle_types WHERE name = ?';
            logDbOperation('getVehicleType', vehicleTypeQuery, [data.vehicle_type]);

            db.get(vehicleTypeQuery, [data.vehicle_type], (err, vehicleType) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!vehicleType) {
                    reject(new Error('Invalid vehicle type'));
                    return;
                }

                // Calculate estimated fare (simplified for testing)
                const estimatedFare = vehicleType.base_fare + 10 * vehicleType.per_mile_rate;

                const insertQuery = `INSERT INTO ride_requests 
                                   (rider_id, pickup_location, destination, vehicle_type, estimated_fare)
                                   VALUES (?, ?, ?, ?, ?)`;
                const params = [data.rider_id, data.pickup_location, data.destination, data.vehicle_type, estimatedFare];
                logDbOperation('createRideRequest', insertQuery, params);

                db.run(insertQuery, params, function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const selectQuery = 'SELECT * FROM ride_requests WHERE id = ?';
                    logDbOperation('getCreatedRideRequest', selectQuery, [this.lastID]);

                    db.get(selectQuery, [this.lastID], (err, row) => {
                        if (err) reject(err);
                        console.log('Result: Created ride request with ID', this.lastID);
                        resolve(row);
                    });
                });
            });
        });
    },

    getRideRequest: (id) => {
        const query = 'SELECT * FROM ride_requests WHERE id = ?';
        logDbOperation('getRideRequest', query, [id]);

        return new Promise((resolve, reject) => {
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                if (!row) reject(new Error('Ride request not found'));
                console.log('Result:', row ? 'Ride request found' : 'Ride request not found');
                resolve(row);
            });
        });
    },

    updateRideRequest: (id, data) => {
        return new Promise((resolve, reject) => {
            const updates = [];
            const values = [];
            
            if (data.status !== undefined) {
                updates.push('status = ?');
                values.push(data.status);
            }
            if (data.pickup_location !== undefined) {
                updates.push('pickup_location = ?');
                values.push(data.pickup_location);
            }
            if (data.destination !== undefined) {
                updates.push('destination = ?');
                values.push(data.destination);
            }
            
            updates.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const query = `UPDATE ride_requests 
                          SET ${updates.join(', ')}
                          WHERE id = ?`;
            logDbOperation('updateRideRequest', query, values);

            db.run(query, values, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                if (this.changes === 0) {
                    reject(new Error('Ride request not found'));
                    return;
                }

                const selectQuery = 'SELECT * FROM ride_requests WHERE id = ?';
                logDbOperation('getUpdatedRideRequest', selectQuery, [id]);

                db.get(selectQuery, [id], (err, row) => {
                    if (err) reject(err);
                    console.log('Result: Updated ride request with ID', id);
                    resolve(row);
                });
            });
        });
    },

    deleteRideRequest: (id) => {
        const query = 'DELETE FROM ride_requests WHERE id = ?';
        logDbOperation('deleteRideRequest', query, [id]);

        return new Promise((resolve, reject) => {
            db.run(query, [id], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                if (this.changes === 0) {
                    reject(new Error('Ride request not found'));
                    return;
                }
                console.log('Result: Deleted ride request with ID', id);
                resolve({ deleted: true });
            });
        });
    }
};

module.exports = dbOperations;
