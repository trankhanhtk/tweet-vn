var QuestionSchema,
  Schema      = require('mongoose').Schema,
  async       = require('async'),
  escape      = require('escape-html');

// ------------- BEGIN TOdO 28-13-2013 trankhanh - String length validation disabled ---------------
// function minLength(length) {
//   return function(handle, done) {
//     if(handle.length < length) {
//       return done(false);
//     }
//     return done(true);
//   }
// }
// ------------- END TODO 28-13-2013 trankhanh - String length validation disabled ---------------

QuestionSchema = new Schema({
  logs              : [{ type: Schema.Types.ObjectId, ref: 'Log' }],
  topics            : [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  follower_list     : [{ type: Schema.Types.ObjectId, ref: 'User' }],

  title             : { type: String,                 required: true },
  author            : { type: Schema.Types.ObjectId,  required: true, ref: 'User' },
  detail            : { type: String,                 sparse  : true },

  is_open           : { type: Boolean,  default : 0 },
  created_at        : { type: Date,     required: true, default: Date.now },
  updated_at        : { type: Date,     required: true, default: Date.now }
});

QuestionSchema.static('filterInputs', function (reqBody) {
  delete reqBody.logs;
  delete reqBody.author;
  delete reqBody.status;
  delete reqBody.created_at;
  delete reqBody.updated_at;
});

QuestionSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

module.exports = QuestionSchema;
