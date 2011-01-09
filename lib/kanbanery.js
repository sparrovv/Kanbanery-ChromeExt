
  jQuery.fn.extend({
    initSubmitButtons: function() {
      $(this).submit(function(){
        if ($(this).attr("submitted") == "true") {
          return false;
        }
        $(this).attr("submitted", "true");
        var p = $(this).find(".buttons, .spinner_placeholder");
        p.find("span").remove();
        p.append(Application.spinner_image);

      });
      return $(this);
    }
  });

  function openTab(tabUrl) {
    if(tabUrl.match(/^www/i)) {
      tabUrl = "http://" + tabUrl;
    }
    chrome.tabs.create({
      url: tabUrl,
      selected: true 
    });
    return true;
  };

  function kanbaneryApiUrl(url){
    return 'https://' + WORKSPACE + '.' + KANBANERY_API_URL + '/' + url;
  };

  Kanbanery.navigation = function(){
    $("#options-page-link").click(function(){
      openTab(chrome.extension.getURL('options.html'));
      return false;
    });
  };

  function removeIndicator(form){
    form.find('img').remove(); 
    form.attr("submitted","false");
  };

  function projectId(){
    return PROJECTID;
  };


  Kanbanery.showContainer = function(){
    $('#flash').find('img').remove();
    $('#container').show();
  };

  Kanbanery.isAuthenticated = function(){
    var url = "projects/" + PROJECTID+ "/estimates.json";
    Application.Ajax._get(kanbaneryApiUrl(url),{
      success: function(){
        Kanbanery.showContainer();
      },
      error: function(response){
        if (response.status === 401){
          Kanbanery.startAuthentication();
          window.close();
        }
      }
    });
  };

  Kanbanery.checkSettings = function(){
    var valid = true;
    $.each(RequiredSettings, function(key, value){
      if ( (localStorage[value] === undefined) || (localStorage[value].length < 1 )){
        openTab(chrome.extension.getURL('options.html'));
        window.close();
      }
    });
  };

  Kanbanery.startAuthentication = function(){
    var url = '/login';
    openTab('www.' + KANBANERY_SITE + url);
    window.close();
  };

  Kanbanery.Estimate = Class.$extend({

    getList: function(){
      var that = this;
      var url = 'projects/' + projectId() + '/estimates.json';
      Application.Flash.showNotice("Loading Data");   
      Application.Ajax._get(kanbaneryApiUrl(url), {
        success: function(result){
          that.appendOptions(result);
          Application.Flash.close();
        }
      });
    },

    appendOptions: function(types){
      $.each(types, function(key, type)
      {   
        $('#task_estimates').
        append($("<option></option>").
        attr("value",type.id).
        text(type.label)); 
      });
    }
  });

  Kanbanery.Type = Class.$extend({

    getList: function(){
      var that = this;
      var url = 'projects/' + projectId() + '/task_types.json';
      Application.Flash.showNotice("Loading Data");   
      Application.Ajax._get(kanbaneryApiUrl(url), {
        success: function(result){
          that.appendOptions(result);
          Application.Flash.close();
        }
      });
    },

    appendOptions: function(types){
      $.each(types, function(key, type)
      {   
        $('#task_type').
        append($("<option></option>").
        attr("value",type.id).
        text(type.name)); 
      });
    }
  });

Kanbanery.showProject = function(){
  $("#project-id").text(projectId());
};

  Kanbanery.Task =  Class.$extend({
    __init__: function() {
      this.form = $('#new_task');
    },

    add: function(){
      //POST https://WORKSPACE.kanbanery.com/api/v1/projects/PROJECT_ID/tasks.json
      var that = this;
      that.form.initSubmitButtons().submit(function(event){
        event.preventDefault();
        var url = 'projects/' + projectId() + '/tasks.json';
        var params = $(this).serialize();

        Application.Ajax._post(kanbaneryApiUrl(url), params,{
          success: function(data){
            Application.Flash.showNotice("Saved!");
            that.form[0].reset();
            removeIndicator(that.form);
          },
          error: function(response){
            var jsonResponse = $.parseJSON(response.responseText)
            Application.Flash.showErrors(jsonResponse);
            removeIndicator(that.form);
          }   
        });

        return false;
      });
    }
  });


