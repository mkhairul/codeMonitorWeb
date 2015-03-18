app.factory('SessionService', ['$compile', function($compile){
  var selectedSession = {
    currentChanges: 0,
    currentFile: 0,
    select: function(index)
    {
      this.currentChanges = index;
    },
    selectFile: function(index)
    {
      this.currentFile = index;
    },
    getId: function()
    {
      return (this.exists("id")) ? this.id:false;
    },
    getContent: function()
    {
      
      return (this.exists('files')) ? this.files[this.currentFile].changes[this.currentChanges].content:false;
      
      return (this.exists("files")) ? 
        ((this.files[this.currentFile].changes[this.currentChanges].diff) ? 
          diffText(this):
          this.files[this.currentFile].changes[this.currentChanges].content)
        :false;
    },
    getDiff: function()
    {
      return (this.exists('files')) ? this.files[this.currentFile].changes[this.currentChanges].diff:false;
    },
    getFilename: function()
    {
      return (this.exists("changes")) ? this.changes[this.currentChanges].file:false;
    },
    getFiles: function()
    {
      return (this.exists("files")) ? this.files:false;
    },
    getChangesInSelectedFile: function()
    {
      return (this.exists("files")) ? this.files[this.currentFile].changes:false;
    },
    getChanges: function()
    {
      return (this.exists("changes")) ? this.changes:false;
    },
    exists: function(propertyName)
    {
      return (propertyName in this) ? true:false;
    }
  }
  
  var sessionList = {};
  
  // Sort all the changes under a filename
  function sortChangesToFiles(session)
  {
    var tmp = {};
    for(var index in session.changes)
    {
      // remove "file" property
      var trim_changes = {};
      var trim_attr = ['file'];
      var file = session.changes[index].file;
      for(var attr in session.changes[index])
      {
        if(trim_attr.indexOf(attr) >= 0)
        {
          continue;
        }
        trim_changes[attr] = session.changes[index][attr]
      }
      
      // If the property is not defined, init it with array
      if(!(file in tmp))
      {
        tmp[session.changes[index].file] = []
      }
      
      // Add changes record
      tmp[session.changes[index].file].push(trim_changes);
    }
    
    var files = [];
    for(var file in tmp)
    {
      files.push({
        name: file,
        changes: tmp[file]
      });
    }
    session.files = files;
  }
  
  return {
    selected: function(session)
    {
        if(session)
        {
          for(var attrname in session){ 
            selectedSession[attrname] = session[attrname];
          }
          sortChangesToFiles(selectedSession)
          console.log(selectedSession);
        }
        return selectedSession;
    },
    sessions: function(objs)
    {
        if(objs)
        {
          sessionList = objs;
        }
        return sessionList;
    }
  }
  
}]);