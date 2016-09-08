var databaseUrl = process.env.NODE_ENV === 'testing' ?
    '127.0.0.1:27017' :
    "<YOUR_DATABASE_URL>"

module.exports = {
    //currently using 64 bits for testing, likely want to go to at least 256, also need to conceal in production
    'secret': '<FILL_IN_YOUR_SECRET>',
    'database': databaseUrl
}
