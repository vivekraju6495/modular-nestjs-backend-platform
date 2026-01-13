import { Schema } from 'mongoose';

export const LogSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  method: String,
  url: String,
  statusCode: Number,
  request: Object,
  response: Object,
  error: {
    message: Schema.Types.Mixed,  // can be string or array
    error: String,                // error type ("Bad Request")
    statusCode: Number,           // HTTP status
  },
});
