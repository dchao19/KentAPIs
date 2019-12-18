var databaseUrl = process.env.NODE_ENV === 'testing' ?
    'mongodb://127.0.0.1:27019/kentapis' :
    'localhost:27019/kentapis';

module.exports = {
    //currently using 64 bits for testing, likely want to go to at least 256, also need to conceal in production
    'secret': 'VZEazMDOUm26IuVGuYUleTDRCVrkXaBU',
    'database': databaseUrl,
    'google_api_key': 'AIzaSyAJrZu_rDC4skdxOyeoCiK7YoOEz_4uNzk', //<FILL_IN_YOUR_KEY>',
    port: 3002
};
