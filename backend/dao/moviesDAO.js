import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let movies;

export default class moviesDAO {
  static async injectDB(conn) {
    if (movies) {
      return;
    }
    //access the sample_mflix movies collection
    try {
      movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movies");
    } catch (e) {
      console.error(`unable to connect in MoviesDAO: ${e}`);
    }
  }

  static async getMovies({
    // default filter
    filters = null,
    page = 0,
    moviesPerPage = 20, // will only get 20 movies at once
  } = {}) {
    let query;
    //can filter title or rating
    if (filters) {
      if ("title" in filters) {
        query = { $text: { $search: filters["title"] } };
      } else if ("rated" in filters) {
        query = { rated: { $eq: filters["rated"] } };
      }
    }
    let cursor;
    try {
      cursor = await movies
        .find(query)
        .limit(moviesPerPage)
        .skip(moviesPerPage * page);
      const moviesList = await cursor.toArray();
      const totalNumMovies = await movies.countDocuments(query);
      return { moviesList, totalNumMovies };
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      //return an array of movies which match the filer criteria
      return { moviesList: [], totalNumMovies: 0 };
    }
  }

  static async getMovieById(id) {
    try {
      return await movies
        .aggregate([
          {
            //checking to see if req.param.id mathces one of the ids in the movies collection
            $match: {
              _id: new ObjectId(id),
            },
          },
          {
            //getting the specific movies reviews
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "movie_id",
              as: "reviews",
            },
          },
        ])
        .next();
    } catch (e) {
      console.error(`something went wrong in getMovieById: ${e}`);
      throw e;
    }
  }

  static async getRatings() {
    let ratings = [];
    try {
      //distinct method gets all distinct rated movies from movies collection
      ratings = await movies.distinct("rated");
      return ratings;
    } catch (e) {
      console.error(`unable to get ratings, ${e}`);
      return ratings;
    }
  }
}
