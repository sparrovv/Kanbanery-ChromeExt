
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
  }

  function workspaceName(){
    return $("#workspaces").val();
  }
  
  function kanbaneryApiUrl(url){
    return 'https://' + workspaceName() + '.' + KANBANERY_API_URL + '/' + url;
  }

  Kanbanery.navigation = function(){
    $("#options-page-link").click(function(){
      openTab(chrome.extension.getURL('options.html'));
      return false;
    });
  };

  function removeIndicator(form){
    form.find('img').remove(); 
    form.attr("submitted","false");
  }

  function projectId(){
    return $("#projects").val();
  }

  Kanbanery.showContainer = function(){
    $('#flash').find('img').remove();
    $('#container').show();
  };

  Kanbanery.resetSelect = function(selectElement, none){
    $(selectElement).find('option').remove();
    if (none){
      Kanbanery.addNoneOption(selectElement);  
    }
  };

  Kanbanery.addNoneOption = function(selectElement){
    $(selectElement).append($("<option></option>").
        attr("value",'').
        text('')); 
  };

  Kanbanery.isAuthenticated = function(){
    var url = "/user";
    var apiUrl = 'https://' + KANBANERY_API_URL + url;
    Application.Ajax._get(apiUrl,{
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
      Kanbanery.resetSelect("#task_estimates", true);
      $.each(types, function(key, type)
      {   
        $('#task_estimates').
        append($("<option></option>").
        attr("value",type.id).
        text(type.label)); 
      });
    }
  });

Kanbanery.Workspaces = Class.$extend({
  __init__: function(){
    this.worskpaces = [];        
    this.workspacesContainer = $("#workspaces");
    this.projectsContainer = $("#projects");
    this.getList();
    this.workspaceChanged();
    this.projectChanged();
  },

  getList: function(){
    var that = this;
    var url = 'user/workspaces.json';
    Application.Ajax._get(kanbaneryApiUrl(url), {
      success: function(result){
        that.workspaces = result;
        that.appendWorkspaces();         
        that.setLastUsed();
      }
    }); 
  },

  appendWorkspaces: function(){
    var that = this;
    $.each(that.workspaces, function(key, work){
      that.workspacesContainer.append($("<option></option>").
        attr("value",work.name).
        text(work.name));
      if (key === 0){
       that.appendProjects(work.name); 
      } 

    });
  },

  setLastUsed: function(){
    var that = this;
    // Check If is the same user
    if ((that.rememberedProject !== undefined ) && (that.rememberedWorkspace !== undefined)){
      var projectId = that.rememberedProject();
      var workspaceName = that.getWorkspaceByProject(projectId).name;
      
      that.workspacesContainer.val(workspaceName);
      that.projectsContainer.val(projectId);

      that.loadExtraData();
    }
  
  },

  loadExtraData: function(){
    if (projectId() !== undefined){
      var e = new Kanbanery.Estimate();
      e.getList();

      var t = new Kanbanery.Type();
      t.getList();
    }
  },

  getWorkspaceByProject: function(projectId){
    var that = this;
    var wrks = '';
    _(that.workspaces).each(function(workspace){
      if (!_.isEmpty(workspace.projects)){

        projectsIds = _(workspace.projects).map(function(proj){
          return proj.id;
        }); 

        if ( _(projectsIds).include(parseInt(projectId)) ){
          wrks = workspace;
        }

      }
    
    });

    return wrks;
  },

  appendProjects: function(workspaceName){
    var that = this;
    that.resetProjects();
    var workspace = _(that.workspaces).select(function(work){
      return work.name == workspaceName;
    });

    $.each(workspace[0].projects, function(key, proj){
      that.projectsContainer.append($("<option></option>").
       attr("value",proj.id).
       text(proj.name));
    });

    that.loadExtraData();

  },

  workspaceChanged: function(){
    var that = this;
    this.workspacesContainer.change(function(){
      name = $(this).val();
      that.appendProjects(name); 
      that.setWrokspaceInStorage(name);
    });
  },

  projectChanged: function(){
    var that = this;
    this.projectsContainer.change(function(){
      that.loadExtraData();
      that.setProjectInStorage($(this).val());
    });
  },

  setProjectInStorage: function(id){
    localStorage['project'] = id;
  },

  setWrokspaceInStorage: function(name){
    localStorage['workspace'] = name;
  },

  rememberedProject: function(){
    return localStorage['project'];
  },

  rememberedWorkspace: function(){
    return localStorage['workspace'];
  },

  resetProjects: function(){
    this.projectsContainer.find('option').remove();
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
      Kanbanery.resetSelect("#task_type");
      $.each(types, function(key, type)
      {   
        $('#task_type').
        append($("<option></option>").
        attr("value",type.id).
        text(type.name)); 
      });
    }
  });

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
            var jsonResponse = $.parseJSON(response.responseText);
            Application.Flash.showErrors(jsonResponse);
            removeIndicator(that.form);
          }   
        });

        return false;
      });
    }
  });


