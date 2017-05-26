var databaseUrl = process.env.NODE_ENV === 'testing' ?
    'mongodb://127.0.0.1/kentapis' :
    'localhost/kentapis';

module.exports = {
    //currently using 64 bits for testing, likely want to go to at least 256, also need to conceal in production
    'secret': '<FILL_IN_YOUR_SECRET>',
    'database': databaseUrl,
    'google_api_key': 'AIzaSyBT6A97FzdqCw9YwciwmKHzbpwgG9S6BpI',//'<FILL_IN_YOUR_KEY>',
    port: 8080
};
