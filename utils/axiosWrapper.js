// A wrapper for out Axios calls
const axios = require('axios');
const object = require('lodash/fp/object');

const defaultOptions = {
    headers: {
        'User-Agent': 'personal-website-dev by felixsalyr'
    }
}

module.exports = async function makeRequest(url, options){
    if (!options.hasOwnProperty('method'))
        throw new Error(500)

    return await axios(url, object.merge(defaultOptions, options))
        .then(response => {
            return response.data;
        })
        .catch(error =>{
            if (error.response) {
                /*
                 * The request was made and the server responded with a
                 * status code that falls out of the range of 2xx
                 */
                console.log(error.response.status);
                throw new Error(error.response.status)
            } else if (error.request) {
                /*
                 * The request was made but no response was received, `error.request`
                 * is an instance of XMLHttpRequest in the browser and an instance
                 * of http.ClientRequest in Node.js
                 */
                console.log(error.request);
            } else {
                // Something happened in setting up the request and triggered an Error
                console.log('Error', error.message);
            }
            throw new Error(500)
        })
    


}

