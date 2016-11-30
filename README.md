# KentScheduleServer
The live version of this server is available at kdsapi.org

Documentation is available at https://kdsapi.org/docs

Contributions are welcome.

# Getting Started
If you wish to build the server yourself, you'll need mongo, node.js, and npm installed. 
  1. First, clone the repository and checkout a branch:
  ```
  git clone https://github.com/dchao19/KentAPIs && cd KentAPIs
  git checkout -b more_functionality
  ```
  2. `npm install`
  3. Fill out the `config.js` file. You'll need the database address.
  4. Run the server using `npm start`

# Inital Configuration
In order for the schedule component of the API to work, you'll need to preload the database using the provided ICS file. A script has been written that does this for you.
  1. Fill in the admin username and password settings in `initial-configuration/config.js`. You can make these up, they'll be used by the server to create an account for authenticated routes.
  2. Fill in the database information in the `config.js` file. You'll need the database address.
  3. `npm install`
  4. Upload the initial configuration data using `npm run initial-config`
  5. Start the server
