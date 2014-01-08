var loggedIn  = require('./middleware/logged_in.js'),
  Topic       = require('../data/models/topic.js'),
  User        = require('../data/models/user.js'),
  async       = require('async');

module.exports = function (app) {
  var sub_topics, loadSubTopics;

  loadSubTopics = function (req, res, next) {
    Topic.find({ is_primary: false }, '_id name').exec(function (err, returned_topics) {
      sub_topics = returned_topics;
      next();
    });
  };

  app.get('/topics/list', loggedIn, function (req, res, next) {
    Topic.find({}, '-related_words -created_at -updated_at').exec(function (err, topics) {
      var i, topic_obj, topic_obj_list;
      topic_obj_list = [];

      if (err) { return next(err); }

      for (i = 0; i < topics.length; i++) {
        topic_obj = topics[i].toObject();
        if (req.session.user.following_list.topic.indexOf(topic_obj._id.toString()) !== -1) {
          topic_obj.is_following = true;
        } else {
          topic_obj.is_following = false;
        }

        topic_obj_list.push(topic_obj);
      }

      return res.json(200, topic_obj_list);
    });
  });

  app.get('/topics/index', loggedIn, function (req, res, next) {
    return res.render('topics/index');
  });

  app.get('/topics/search', loggedIn, function (req, res, next) {
    Topic.find({name: {$regex: req.query.name, $options: 'i'}}, '_id name picture follower_count').exec(function (err, topics) {
      if (err) { return next(err); }
      res.json(200, topics);
    });
  });

  app.get('/topics/new', [loggedIn, loadSubTopics], function (req, res, next) {
    return res.render('topics/new', { sub_topics : sub_topics });
  });

  app.post('/topics', [loggedIn, loadSubTopics], function (req, res, next) {
    var i,
      topic_id_list = [];

    Topic.filterInputs(req.body);

    // ** Begin validate sub-topics
    for (i = 0; i < sub_topics; i++) {
      topic_id_list.push(sub_topics[i]._id);
    }

    for (i = 0; i < req.body.sub_topics; i++) {
      if (topic_id_list.indexOf(req.body.sub_topics[i]) !== -1) {
        req.session.message.error.push('Invalid sub-topic.');
        return res.redirect('back');
      }
    }
    // ** End of validate sub-topics

    Topic.create(req.body, function (err, topic) {
      if (err) {
        if (err.code === 11000) {
          req.session.message.info.push('Name was already taken :(. Please, take a new one :D!');
          return res.redirect('back');
        }
        return next(err);
      }

      req.session.message.info.push('Good job! :D.<span class="pull-right">Hate to see me? Why not ;-) <strong>-----></strong><span>');
      return res.redirect('/topics/index');
    });
  });

  app.get('/topics/:id/edit', [loggedIn, loadSubTopics], function (req, res, next) {
    Topic.findById(req.params.id, function (err, topic) {
      return res.render('topics/edit', { topic: topic, sub_topics : sub_topics });
    });
  });

  app.put('/topics/:id', [loggedIn], function (req, res, next) {
    Topic.filterInputs(req.body);

    Topic.update({ _id: req.params.id }, req.body, function (err, topic) {
      if (err) { return next(err); }

      req.session.message.info.push('Good job! :D.<span class="pull-right">Hate to see me? Why not ;-) <strong>-----></strong><span>');
      return res.redirect('/topics/index');
    });
  });

  app.put('/topics/:id/follow', loggedIn, function (req, res, next) {
    var validate_topic, update_user;

    validate_topic = function (next) {
      Topic.findById(req.body._id, function (err, topic) {
        if (err) { return next(err); }

        if (!topic) { return res.json(400, { msg: 'invalid topic' }); }

        next();
      });
    };

    update_user = function (next) {
      var topic_list, index;

      topic_list  = req.session.user.following_list.topic;
      topic_list  = topic_list.slice(0, topic_list.length);
      index       = topic_list.indexOf(req.body._id);

      if (req.body.is_following === false) {
        if (index === -1) {
          topic_list.push(req.body._id);
        }
        req.body.is_following = true;
      } else {
        if (index !== -1) {
          topic_list.splice(index, 1);
        }
        req.body.is_following = false;
      }

      User.update({ _id: req.session.user._id }, { 'following_list.topic': topic_list }, function (err, number_affected, raw) {
        if (err) { return next(err); }
        req.session.user.following_list.topic = topic_list;
        next();
      });
    };

    async.series([ validate_topic, update_user ], function (err, results) {
      if (err) { return next(err); }

      return res.json(200, req.body);
    });
  });
};