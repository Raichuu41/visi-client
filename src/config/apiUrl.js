export const apiUrl = (process.env.NODE_ENV === 'production'
    ? 'http://129.206.106.202:3000' : 'http://localhost:3000');

export default apiUrl;
