const API_CONSTANT = {
  get MONGO_URI() {
    return process.env.MONGO_URI || 'mongodb://localhost:27017/assignment4';
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET || 'your_jwt_secret';
  }
}

export default API_CONSTANT;