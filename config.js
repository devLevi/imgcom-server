'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  DATABASE_URL:
    process.env.DATABASE_URL || 'mongodb://localhost:27017/imgcom-db',
  TESTDATABASE_URL:
    process.env.TESTDATABASE_URL || 'mongodb://localhost:27017/test-imgcom-db',
  HTTP_STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },
  JWT_SECRET: process.env.JWT_SECRET || 'Levi',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30d'
};
