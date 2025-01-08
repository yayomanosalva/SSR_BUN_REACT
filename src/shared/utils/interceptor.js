export class HttpClient {
     constructor(baseURL) {
          this.baseURL = baseURL;
     }

     async request(endpoint, options = {}) {
          const response = await fetch(`${this.baseURL}${endpoint}`, options);

          if (!response.ok) {
               const error = await response.json();
               throw new Error(error.message || "Error en la API");
          }

          return response.json();
     }
}