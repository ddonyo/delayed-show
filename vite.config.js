export default {
  server: {
    proxy: {
      '/v1': 'http://localhost:8000'
    }
  }
}
