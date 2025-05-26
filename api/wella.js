import axios from "axios";

export default axios.create({
	baseURL: `https://api.wella.professionalstore.com/rest/v2/wellaUS/products/`,
})