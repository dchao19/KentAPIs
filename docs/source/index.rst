Kent APIs
========

Kent APIs is a set of RESTful api endpoints useful to making projects that connect with the kent schedule system. It is built using node and NPM.

Features
--------

- User authentication for personalized results.
- Return current period/day_type
- Admin authentication for adding/removing special periods/day_types

Installation
------------
::

    git clone https://github.com/dchao19/KentAPIs.git
    npm install
    npm start

Contribute
----------

- Issue Tracker: https://github.com/dchao19/KentAPIs/issues
- Source Code: https://github.com/dchao19/KentAPIs

Support
-------

If you are having issues, please let us know.
dchao19@kentdenver.org

NPM Documentation
=================
Kent APIS utilizes node package manager for building and depedency management. The manifest.json file is commented in the source code. 

Packages
--------
Kent APIs utilizes the following NPM packages:

- body-parser v1.0.1
- express v4.0.0
- ical >v0.4.0
- JSONWebToken >v5.5.4
- moment v2.10.6
- moment-timezone >v0.5.0
- mongoose v3.6.2
- nodemon >v1.8.1
- passport >v0.3.2
- passport-local >v1.0.0
- passport-local-mongoose >v3.1.0 
- unirest >v0.4.2

Scripts
-------
The only script npm will run is "start"::

	npm start //runs the application


Endpoints
=========
