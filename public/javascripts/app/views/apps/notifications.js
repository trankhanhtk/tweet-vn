define([
  'jquery', 'backbone', 'collections/notifications', 'text!templates/error.html'
], function ($, Backbone, notifications, errorTpl) {
  var View = Backbone.View.extend({
    el: '#notifications',

    template: _.template(notificationTpl),

    initialize: function () {
      notifications.fetch({
        error: function () {
          $('.spinner-large').empty().html(errorTpl);
        },
        success: function () {
          $('.spinner-large').empty();
        }
      });

      this.listenTo(notifications, 'add', this.addNotification);
    },

    addNotification: function (notification) {
      this.$el.append();
    }
  });

  return new View();
});
