
function prepareDB()
{
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(':memory:');
    global.db = db

    db.serialize(function() {
      db.run("CREATE TABLE lorem (info TEXT)");

      var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
      for (var i = 0; i < 10; i++) {
          stmt.run("Ipsum " + i);
      }
      stmt.finalize();

    });
}

function appendInfo(info)
{
    $('#db-data').append('<li>'+info+'</li>')
}

function dbStatus(msg)
{
    $('#db-status').text(msg)
}

window.onload = function()
{
    global.$ = $
    prepareDB()
    dbStatus("Prepare data")
    $("#dump-db-data").click(function() 
    {
        global.db.each("SELECT rowid AS id, info FROM lorem", function(err, row) 
        {
          appendInfo(row.id + ": " + row.info);
        })
    })
}

window.onclose = function()
{
    global.db.close()
}
