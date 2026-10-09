import axios from "axios";

export const searchSongs = (query) => {
  return axios.get(`https://saavn.sumit.co/api/search/songs?query=${query}`);
};

export const getSongDetails = (id) => {
  return axios.get(`https://saavn.sumit.co/api/songs?id=${id}`);
};