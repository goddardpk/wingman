// Database operations module
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('wingman.db');

const dbOperations = {
    // Account operations
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
                    resolve({ changes: this.changes });
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
    }
};

module.exports = dbOperations;