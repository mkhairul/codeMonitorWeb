app.factory('SessionService', function(){
  
  var selectedSession = {
    getId: function()
    {
      return (this.exists("id")) ? this.id:false;
    },
    getContent: function()
    {
      return (this.exists("changes")) ? this.changes.data[0].content:false;
    },
    exists: function(propertyName)
    {
      return (propertyName in this) ? true:false;
    }
  }
  
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
    }
  }
  
});