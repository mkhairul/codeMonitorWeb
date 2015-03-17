app.factory('SessionService', function(){
  
  var selectedSession = {
    currentChanges: 0,
    select: function(index)
    {
      this.currentChanges = index;
    },
    getId: function()
    {
      return (this.exists("id")) ? this.id:false;
    },
    getContent: function()
    {
      return (this.exists("changes")) ? this.changes[this.currentChanges].content:false;
    },
    getFilename: function()
    {
      return (this.exists("changes")) ? this.changes[this.currentChanges].file:false;
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
  
  return {
    selected: function(session)
    {
        if(session)
        {
          for(var attrname in session){ 
            selectedSession[attrname] = session[attrname];
          }
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
  
});