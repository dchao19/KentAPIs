define({ "api": [
  {
    "type": "post",
    "url": "schedule/get_token",
    "title": "Get Token",
    "name": "_Get_Token_",
    "description": "<p>This endpoint returns a user's token after authentication.</p>",
    "group": "Authentication",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Account Username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Account Password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Token retrieval status</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>User token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"message\": \"Here is your token\",\n    \"token\": \"<USER_TOKEN>\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>The user with the given username/password does not exist.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/schedule.js",
    "groupTitle": "Authentication"
  },
  {
    "type": "post",
    "url": "schedule/register",
    "title": "Register Account",
    "name": "_Register_Account_",
    "description": "<p>This endpoint creates a user account in the database and returns a token.</p>",
    "group": "Authentication",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Account Username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Account Password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Creation status</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>User token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"message\": \"Account created\",\n    \"token\": \"<USER_TOKEN>\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/schedule.js",
    "groupTitle": "Authentication"
  },
  {
    "type": "get",
    "url": "schedule/",
    "title": "Schedule API Status",
    "name": "Schedule_API_Status",
    "group": "Schedule",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>API OK</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "API OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/schedule.js",
    "groupTitle": "Schedule"
  },
  {
    "type": "get",
    "url": "schedule/all_periods",
    "title": "All Periods",
    "name": "_All_Periods_",
    "description": "<p>This endpoint returns an array of all of the periods in a date, or today if none is specified.</p>",
    "group": "Schedule",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": true,
            "field": "X-Access-Token",
            "description": "<p>User's unique access token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "date",
            "defaultValue": "now",
            "description": "<p>an ISO 8061 date string</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "periods",
            "description": "<p>List of periods in a day.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "periods.title",
            "description": "<p>The period number or the user's name for the period provided X-Access-Token was set and the period has been named.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "periods.start_time",
            "description": "<p>Start time of period in UTC timezone</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "periods.end_time",
            "description": "<p>End time of period in UTC timezone</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "periods.day",
            "description": "<p>The period's associated day</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n    {\n        \"title\": \"English\",\n        \"start_time\" : \"\",\n        \"end_time\": \"\",\n        \"day\": \"\"\n    },\n    {\n        \"title\": \"Period 3\",\n        \"start_time\" : \"\",\n        \"end_time\": \"\",\n        \"day\": \"\"\n    }\n    ...\n]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>The date query was formatted incorrectly or is an invalid range.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"error\": \"Invalid date format\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/schedule.js",
    "groupTitle": "Schedule"
  },
  {
    "type": "get",
    "url": "schedule/day_type",
    "title": "Day Type (Letterday)",
    "name": "_DayType_",
    "description": "<p>This endpoint returns the letter day of a given date, or now if none specified.</p>",
    "group": "Schedule",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "date",
            "defaultValue": "now",
            "description": "<p>an ISO 8061 date string</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "date",
            "description": "<p>Date in ISO8061 Format, UTC time or &quot;No school&quot;</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Letter Day, &quot;X&quot; if no school</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"date\": \"2016-02-26T13:00:00.000Z\",\n    \"type\": \"A\"\n}",
          "type": "json"
        },
        {
          "title": "Success-Response:",
          "content": "{\n    \"date\": \"No school\",\n    \"type\": \"X\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>The date query was formatted incorrectly or is an invalid range.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 400 Bad Request\n{\n    \"error\": \"Invalid date format\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/schedule.js",
    "groupTitle": "Schedule"
  },
  {
    "type": "get",
    "url": "schedule/name_period",
    "title": "Name Period",
    "name": "_Name_Period_",
    "description": "<p>This endpoint associates a period number with a user-specifice dname.</p>",
    "group": "Schedule",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "period",
            "description": "<p>Period number to replace (ex. &quot;Period 1&quot;)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "periodName",
            "description": "<p>Name for the period.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Success message</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"message\": \"success\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>The user with the given username does not exist.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "500",
            "description": "<p>An internal server error has occured</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/schedule.js",
    "groupTitle": "Schedule"
  },
  {
    "type": "get",
    "url": "schedule/period",
    "title": "Period",
    "name": "_Period_",
    "description": "<p>This endpoint returns the current period if no date is specified, or the current period in the specified day</p>",
    "group": "Schedule",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": true,
            "field": "X-Access-Token",
            "description": "<p>User's unique access token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "date",
            "defaultValue": "now",
            "description": "<p>an ISO 8061 date string</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>The period number or the user's name for the period provided X-Access-Token was set and the period has been named.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "start_time",
            "description": "<p>Start time of period in UTC timezone</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "end_time",
            "description": "<p>End time of period in UTC timezone</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "day",
            "description": "<p>The period's associated day</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Example:",
          "content": "{\n    \"title\": \"Period 1\",\n    \"start_time\": \"\",\n    \"end_time\": \"\",\n    \"day\": \"\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>The date query was formatted incorrectly or is an invalid range.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/schedule.js",
    "groupTitle": "Schedule"
  }
] });
