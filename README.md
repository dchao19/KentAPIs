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
In order for the schedule component of the API to work, you'll need to manually execute the following commands.
  1. Start the server normally
  2. Use the `/register` endpoint to create an account
  3. Edit the accounts/user document in the database to read "userType":  "Admin"
  4. `cd inital-configuration`
  5. Edit the config.js file with your username, password, and server address.
  6. In a separate command line window, execute
    1. `node upload_daytypes.js && node upload_periods.js`
