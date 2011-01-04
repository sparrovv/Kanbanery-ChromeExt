Application.Flash = {
  init: function() {
    $("#flash").live("click", Application.Flash.close);
    setTimeout(Application.Flash.close, 5000);
  },

  show: function(klass, message) {
    $("#flash").removeClass("error").removeClass("notice").addClass(klass).html(message).slideDown('fast');
    setTimeout(Application.Flash.close, 5000);
  },

  showNotice: function(message) {
    Application.Flash.show('notice', message);
  },

  showError: function(message) {
    Application.Flash.show('error', message);
  },

  showErrors: function(errors) {
    var message = "";
    errors = eval('(' + errors + ')');
    for(var field in errors) {
      for (var key in errors[field]) {
        message +=  errors[field][key] + ", ";
      }
    }
    message = message.substring(0,message.length-2)
    Application.Flash.show('error', message);
  },

  close: function() {
    $("#flash").slideUp('fast',function() {
      $(this).removeClass("notice").removeClass("error").hide();
    });
  }
};

$(Application.Flash.init);
