import { RESTDataSource } from "@apollo/datasource-rest";

export default class MoviesAPI extends RESTDataSource {
  baseURL = "https://jsonplaceholder.typicode.com/";

  async getMovie(id) {
    return this.get(`posts/${id}`);
  }
}
