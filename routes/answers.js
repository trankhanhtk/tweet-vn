var loggedIn  = require('./middleware/logged_in'),
  async       = require('async'),
  Question    = require('../data/models/question'),
  Answer      = require('../data/models/answer'),
  Log         = require('../data/models/log'),
  User        = require('../data/models/user');

module.exports = function (app) {
  app.post('/answers', [loggedIn], function (req, res, next) {
    var create_answer,    create_log,
      add_log_to_answer,  validate_question,  update_question_log_and_answer,
      question,           answer,             log;

    log = {};

    validate_question = function (next) {
      Question.findById(req.body.question, function (err, returned_question) {
        if (err) { return next(err); }
        if (!returned_question) { return res.json(400, { msg: 'Invalid question' }); }
        question = returned_question;
        next();
      });
    };

    create_answer = function (next) {
      Answer.filterInputs(req.body);
      req.body.author = req.session.user._id;
      Answer.create(req.body, function (err, returned_answer) {
        if (err) { return next(err); }
        answer = returned_answer;
        next();
      });
    };

    create_log = function (next) {
      log.user = req.session.user._id;
      log.answer = answer;
      log.content = req.body.content;
      log.status = 1;

      Log.create(log, function (err, returned_log) {
        if (err) { return next(err); }
        log = returned_log;
        next();
      });
    };

    add_log_to_answer = function (next) {
      answer.logs = [log];
      answer.save(function (err, answer, number_affected) {
        if (err) { return next(err); }
        next();
      });
    };

    update_question_log_and_answer = function (next) {
      question.logs.push(log);
      question.answers.push(answer);
      question.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([
      validate_question, create_answer, create_log, add_log_to_answer, update_question_log_and_answer
    ], function (err, results) {
      if (err) { return next(err); }
      res.json(200, answer);
    });
  });
};