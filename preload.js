const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wingmanDB', {
    getAccount: (email) => 
        ipcRenderer.invoke('db-operation', { operation: 'getAccount', params: email }),
    
    updateAccount: (email, data) => 
        ipcRenderer.invoke('db-operation', { operation: 'updateAccount', params: { email, data } }),
    
    getPaymentMethods: (accountId) => 
        ipcRenderer.invoke('db-operation', { operation: 'getPaymentMethods', params: accountId }),
    
    getAllDrivers: () => 
        ipcRenderer.invoke('db-operation', { operation: 'getAllDrivers' }),
    
    searchDrivers: (searchTerm) => 
        ipcRenderer.invoke('db-operation', { operation: 'searchDrivers', params: searchTerm }),
    
    filterDriversByStatus: (status) => 
        ipcRenderer.invoke('db-operation', { operation: 'filterDriversByStatus', params: status })
});