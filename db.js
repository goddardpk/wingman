// Database operations module
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('wingman.db');

const dbOperations = {
    // Account operations
    createAccount: (data) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO accounts (email, full_name, phone, created_at, updated_at) 
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [data.email, data.fullName, data.phone],
                function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            reject(new Error('Email already exists'));
                        } else {
                            reject(err);
                        }
                        return;
                    }
                    // Return the created account
                    db.get(
                        `SELECT a.*, ap.notifications_enabled, ap.preferred_language 
                         FROM accounts a 
                         LEFT JOIN account_preferences ap ON a.id = ap.account_id 
                         WHERE a.id = ?`,
                        [this.lastID],
                        (err, row) => {
                            if (err) reject(err);
                            resolve(row);
                        }
                    );
                }
            );
        });
    },

    getAccount: (email) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT a.*, ap.notifications_enabled, ap.preferred_language 
                 FROM accounts a 
                 LEFT JOIN account_preferences ap ON a.id = ap.account_id 
                 WHERE a.email = ?`, 
                [email], 
                (err, row) => {
                    if (err) reject(err);
                    if (!row) reject(new Error('Account not found'));
                    resolve(row);
                }
            );
        });
    },

    updateAccount: (email, data) => {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE accounts 
                 SET full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE email = ?`,
                [data.fullName, data.phone, email],
                function(err) {
                    if (err) reject(err);
                    if (this.changes === 0) {
                        reject(new Error('Account not found'));
                        return;
                    }
                    // Return updated account
                    db.get(
                        `SELECT a.*, ap.notifications_enabled, ap.preferred_language 
                         FROM accounts a 
                         LEFT JOIN account_preferences ap ON a.id = ap.account_id 
                         WHERE a.email = ?`,
                        [email],
                        (err, row) => {
                            if (err) reject(err);
                            resolve(row);
                        }
                    );
                }
            );
        });
    },

    deleteAccount: (email) => {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM accounts WHERE email = ?',
                [email],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (this.changes === 0) {
                        reject(new Error('Account not found'));
                        return;
                    }
                    resolve({ deleted: true });
                }
            );
        });
    },

    getPaymentMethods: (accountId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM payment_methods WHERE account_id = ?`,
                [accountId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Driver operations
    getAllDrivers: () => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM drivers ORDER BY status, full_name',
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    searchDrivers: (searchTerm) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM drivers 
                 WHERE full_name LIKE ? OR driver_id LIKE ?
                 ORDER BY status, full_name`,
                [`%${searchTerm}%`, `%${searchTerm}%`],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    filterDriversByStatus: (status) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM drivers WHERE status = ? ORDER BY full_name',
                [status],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    },

    // Ride Request operations
    createRideRequest: (data) => {
        return new Promise((resolve, reject) => {
            // First get the vehicle type rates
            db.get(
                'SELECT * FROM vehicle_types WHERE name = ?',
                [data.vehicle_type],
                (err, vehicleType) => {
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

                    // Create the ride request
                    db.run(
                        `INSERT INTO ride_requests 
                         (rider_id, pickup_location, destination, vehicle_type, estimated_fare)
                         VALUES (?, ?, ?, ?, ?)`,
                        [data.rider_id, data.pickup_location, data.destination, data.vehicle_type, estimatedFare],
                        function(err) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            // Return the created request
                            db.get(
                                'SELECT * FROM ride_requests WHERE id = ?',
                                [this.lastID],
                                (err, row) => {
                                    if (err) reject(err);
                                    resolve(row);
                                }
                            );
                        }
                    );
                }
            );
        });
    },

    getRideRequest: (id) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM ride_requests WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err);
                    if (!row) reject(new Error('Ride request not found'));
                    resolve(row);
                }
            );
        });
    },

    updateRideRequest: (id, data) => {
        return new Promise((resolve, reject) => {
            const updates = [];
            const values = [];
            
            // Build dynamic update query based on provided fields
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

            db.run(
                `UPDATE ride_requests 
                 SET ${updates.join(', ')}
                 WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (this.changes === 0) {
                        reject(new Error('Ride request not found'));
                        return;
                    }
                    // Return updated request
                    db.get(
                        'SELECT * FROM ride_requests WHERE id = ?',
                        [id],
                        (err, row) => {
                            if (err) reject(err);
                            resolve(row);
                        }
                    );
                }
            );
        });
    },

    deleteRideRequest: (id) => {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM ride_requests WHERE id = ?',
                [id],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (this.changes === 0) {
                        reject(new Error('Ride request not found'));
                        return;
                    }
                    resolve({ deleted: true });
                }
            );
        });
    }
};

module.exports = dbOperations;
