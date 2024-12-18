const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbOperations = require('./db');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    
    // Open DevTools in development mode
    if (process.argv.includes('--debug')) {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle IPC calls from renderer
ipcMain.handle('db-operation', async (event, { operation, params }) => {
    try {
        return await dbOperations[operation](params);
    } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
    }
});