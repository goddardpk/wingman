document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('fetchData');
    const result = document.getElementById('result');
    
    button.addEventListener('click', async () => {
        try {
            result.textContent = 'Loading...';
            const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
            const data = await response.json();
            result.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.body}</p>
            `;
        } catch (error) {
            result.innerHTML = `
                <div class="error">
                    Error fetching data: ${error.message}
                </div>
            `;
        }
    });
});
