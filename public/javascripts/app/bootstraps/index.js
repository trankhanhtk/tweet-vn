require.config({
  baseUrl: '/javascripts/app/',
  shim: {
    underscore: { exports: '_' },
    backbone  : {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    bootstrap : {
      deps    : ['jquery'],
      exports : 'bootstrap'
    },
    tinymce   : {
      exports : 'tinymce'
    }
  },
  paths: {
    jquery    : '../libs/jquery/jquery-2.0.3.min',
    underscore: '../libs/underscore/underscore-1.5.2.min',
    backbone  : '../libs/backbone/backbone-1.1.0.min',
    bootstrap : '../vendor/bootstrap.min',
    tinymce   : '../vendor/tinymce/tinymce.min',
    spinner   : '../libs/spinner',
    text      : '../libs/require/text'
  }
});

require(['spinner'], function (spinner) {
  spinner.start({ el: '.feed-spinner', bgColor: '#333', width: '12px', translateX: '7px'});
});

require([
  'bootstrap', 'backbone',
  'share/views/add_question',
  'views/apps/index'
], function (bootstrap, Backbone, AddQuestionView, AppView) {
  new AddQuestionView();
  new AppView();
});
