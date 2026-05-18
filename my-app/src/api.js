import axios from "axios";

const api = axios.create({
  baseURL: "https://slack-application.onrender.com",
});

export default api;
