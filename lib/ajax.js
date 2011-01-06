Application.Ajax = {
  init: function() {
    $.ajaxSetup({
      cache: false,
      beforeSend: function(xhr) {
        //xhr.setRequestHeader("X-Kanbanery-ApiToken", localStorage['userToken']);
      },
      error: Application.Ajax.defaultErrorHandler
    });
  },

  defaultErrorHandler: function(xhr) {
    if (xhr.status == 404) {
      Application.Flash.showError('Sorry, requested resource could not be found.');
    } else if (xhr.status == 403) {
      Application.Flash.showError('Sorry, you\'re not allowed to access this resource.');
    } else if (xhr.status >= 500) {
      Application.Flash.showError('Sorry, we\'ve encountered a problem while serving your request. Try again later.');
    }
  },

  request: function(url, data, options) {
    options = options || {};
    options.url = url;
    options.type = options.type || 'GET';
    options.data = data;
    options.complete = function(xhr, textStatus) {
      if (options['on' + xhr.status]) {
        options['on' + xhr.status](xhr.responseText);
      }
    };
    $.ajax(options);
  },

  _get: function(url, options) {
    options = options || {};
    options.type = 'GET';
    Application.Ajax.request(url, null, options);
  },

  _post: function(url, data, options) {
    options = options || {};
    options.type = 'POST';
    Application.Ajax.request(url, data, options);
  },

  _put: function(url, data, options) {
    options = options || {};
    options.type = 'PUT';
    Application.Ajax.request(url, data, options);
  },

  _delete: function(url, data, options) {
    options = options || {};
    options.type = 'DELETE';
    Application.Ajax.request(url, data, options);
  },

  submitForm: function(form, options) {
    Application.Ajax._post($(form).attr('action'), $(form).serialize(), options);
  }
};

$(Application.Ajax.init);
