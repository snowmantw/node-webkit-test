
var os = require('os')

window.onload = function()
{
    global.$ = $
    $("#dump-os-info").click(function() 
    {
        $('#os-info').append("<li> Platform: "+os.platform()+"</li>")
        $('#os-info').append("<li> Arch: "+os.arch()+"</li>")
        $('#os-info').append("<li> Type: "+os.type()+"</li>")
        $('#os-info').append("<li> Release: "+os.release()+"</li>")
        $('#os-info').append("<li> Free Memory: "+os.freemem()+"</li>")
        $('#os-info').append("<li> CPUs: "+JSON.stringify(os.cpus())+"</li>")
        $('#os-info').append("<li> NICs: "+JSON.stringify(os.networkInterfaces())+"</li>")
    })
}

