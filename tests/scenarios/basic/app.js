document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('testButton');
    const result = document.getElementById('result');
    
    button.addEventListener('click', () => {
        result.textContent = 'Button clicked at: ' + new Date().toLocaleTimeString();
    });
});
