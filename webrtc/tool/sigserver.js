
R = 
{

}

Signal = 
{
    killServer: function()
    {
        R.sigserver.close()
    }

    ,initServer: function()
    {
        var WS = require('ws').Server
        wsrv = new WS(R.sighost)
        wsrv.on('connection', function(ws)
        {
            console.log("WebSocket connection")
            ws.on('message', function(encs)
            {
                console.log("WebSocket message: "+encs);
                var s = JSON.parse(encs)
                switch(s.name)
                {
                    case "register":
                        R.wsid[s.id] = ws
                        break;
                    case "sendDesc":
                    case "sendCandidate":
                        var to = s.to 
                        if('undefined' != typeof R.wsid[s.to])
                        {
                            R.wsid[s.to].send(JSON.stringify(s))
                        }
                        else
                        {
                            console.log("Can't find target: "+s.to)
                        }
                        break;
                    case "quit":
                        var from = s.from
                        R.wsid[s.from].close()
                        break;
                }
            })
        })
        R.sigserver = wsrv
        R.wsid = {}
    }
}

if("kill" == process.argv[2])
{
    Signal.killServer()
}

R.sighost = {'host': process.argv[2], 'port': process.argv[3]}
Signal.initServer()
