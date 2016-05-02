define({ "api": [
  {
    "type": "get",
    "url": "schedule/",
    "title": "API Status",
    "name": "APIStatus",
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
      }
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
      }
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
            "description": "<p>Date in ISO8061 Format, UTC time</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Letter Day</p>"
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
            "description": "<p>Day Type</p>"
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
      }
    },
    "version": "0.0.0",
    "filename": "routes/schedule.js",
    "groupTitle": "Schedule"
  }
] });
