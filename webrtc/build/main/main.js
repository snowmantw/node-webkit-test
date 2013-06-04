/*
// TEMPORARY registry used while refactoring.
window.R = {}
R.pc1 = pc1
R.localstream = localstream
R.sdpConstraints = sdpConstraints
R.sigurl    = "ws://192.168.1.198:8099"
R.sighost   = {'host': '0.0.0.0', 'port': 8099}
R.sigserver = ws on "192.168.1.198"
R.sigclient = ws client
*/

(function()
{
window.Session = 
{
     genId: function()
    {
        var result = 1
        Session.genId = function(){ return result +1 }
        return result
    }

}
})();

(function()
{
window.Signal = 
{
     init: function()
    {
        trace("Start to connect to the Signal server")
        R.sigclient = new WebSocket(R.sigurl) 
        R.sigclient.onmessage = function(e)
        {
            var s = JSON.parse(e.data)
            switch(s.name)
            {
                case "sendDesc":
                        if     ("offer"  == s.type){ Signal.onOffer(s) }
                        else if("answer" == s.type){ Signal.onAnswer(s)}
                        break;
            }
        }
        R.sigclient.onclose = function(e)
        {
            trace("Connection to Signal server closed - retry")
            Signal.init()
        }
        R.sigclient.onopen = function(e)
        {
            trace("Succefully connected to signal server")
            Signal.register(R.pc1.id)
        }
        R.sigclient.onerror = function(e)
        {
            throw "Error: can't connect to Signal server"
        }
    }

    ,initServer: function()
    {
        var WS = require('ws').Server
        wsrv = new WS(R.sighost)
        wsrv.on('connection', function(ws)
        {
            trace("WebSocket connection")
            ws.on('message', function(encs)
            {
                trace("WebSocket message: "+encs);
                var s = JSON.parse(encs)
                switch(s.name)
                {
                    case "register":
                        global.wsid[s.id] = ws
                        break;
                    case "sendDesc":
                        var to = s.to 
                        global.wsid[s.to].send(JSON.stringify(s))
                        break;
                    case "quit":
                        var from = s.from
                        global.wsid[s.from].close()
                        break;
                }
            })
        })
        R.sigserver = wsrv
        global.wsid = {}
    }

    ,register: function(id)
    {
trace("Client WebSocket register")
        R.sigclient.send(JSON.stringify({'id': id, 'name': 'register'}))
    }

    ,onOffer: function(obj, enc_note)
    {
        var note = JSON.parse(enc_node)
        var desc = note.desc
        obj.setRemoteDescription(desc);
        obj.createAnswer(function(desc_a)
        {   
            RTC.forwardAnswerDescription(desc_a)
        }, null, R.sdpConstraints);
    }

    ,onAnswer: function(obj, enc_note)
    {
        var note = JSON.parse(enc_node)
        var desc = note.desc
        trace("Answer from "+note.from+" \n" + desc.sdp);
        obj.setRemoteDescription(desc);
    }

    ,offer: function(from, to, desc, sigclient)
    {
        var data = 
        { 'from': from
        , 'to'  : to
        , 'desc': desc
        , 'name': 'sendDesc'
        , 'type': 'offer'
        }

        var enc = JSON.stringify(data)
        sigclient.send(enc)
    }

    ,answer: function(from, to, desc, sigclient)
    {
        var data = 
        { 'from': from
        , 'to'  : to
        , 'desc': desc
        , 'name': 'sendDesc'
        , 'type': 'offer'
        }

        var enc = JSON.stringify(data)
        sigclient.send(enc)
    }
}
})();

    (function()
    {
    window.RTC = 
    {
         gotStream: function(stream)
        {
          trace("Received local stream");
          // Call the polyfill wrapper to attach the media stream to this element.
          attachMediaStream(vid1, stream);
          R.localstream = stream;
          btn2.disabled = false;
        }

        ,forwardOfferDescription: function(desc)
        {
          R.pc1.setLocalDescription(desc);
          trace("Offer from "+R.pc1.id+" \n", desc.sdp);
          Signal.offer(R.pc1.id, R.targetId, desc, R.sigclient)
        }

        ,forwardAnswerDescription: function(desc)
        {
          R.pc1.setLocalDescription(desc);
          trace("Answer from "+R.pc1.id+" \n", desc.sdp);
          Signal.answer(R.pc1.id, R.targetId, desc, R.sigclient)
        }

        ,gotRemoteStream: function(e)
        {
          // Call the polyfill wrapper to attach the media stream to this element.
          attachMediaStream(vid2, e.stream);
          trace("Received remote stream");
        }

        ,iceCallback: function(event)
        {
            // Must do this after adding RemoteDescription.
            if( event.candidate )
            {
                R.pc1.addIceCandidate(event.candidate)
            }
        }
    }
    })();

    (function(){
    window.Main = 
    {
         start: function()
        {
          trace("Requesting local stream");
          btn1.disabled = true;
          // Call into getUserMedia via the polyfill (adapter.js).
          getUserMedia({audio:true, video:true},
                        RTC.gotStream, function() {});
        }

        ,call: function() 
        {
          btn2.disabled = true;
          btn3.disabled = false;
          trace("Starting call");

          videoTracks = R.localstream.getVideoTracks();
          audioTracks = R.localstream.getAudioTracks();

          if (videoTracks.length > 0)
            trace('Using Video device: ' + videoTracks[0].label);  
          if (audioTracks.length > 0)
            trace('Using Audio device: ' + audioTracks[0].label);

          // Another client's id.
          R.targetId = to.value
          if("" == R.targetId){ throw "Must give a friend Id"}

          trace("Created local peer connection object");
          R.pc1.onicecandidate = function(e){ RTC.iceCallback(e)}; 
          R.pc1.onaddstream = function(e){ RTC.gotRemoteStream(e) }; 
          R.pc1.addStream(R.localstream);

          trace("Adding Local Stream to peer connection");          
          R.pc1.createOffer(function(desc){ RTC.forwardOfferDescription(desc) });
        }

        ,hangup: function() 
        {
          trace("Ending call");
          R.pc1.close(); 
          R.pc2.close();
          R.pc1 = null;
          R.pc2 = null;
          btn3.disabled = true;
          btn2.disabled = false;
        }


        ,main: function()
        {
            //var vid1 = document.getElementById("vid1");
            //var vid2 = document.getElementById("vid2");
            btn1.disabled = false;
            btn2.disabled = true;
            btn3.disabled = true;
            var pc1,pc2;
            var localstream;
            var sdpConstraints = {'mandatory': {
                                    'OfferToReceiveAudio':true, 
                                    'OfferToReceiveVideo':true }};

            // TEMPORARY register used while refactoring.
            window.R = {}
            var servers = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
            R.pc1 = new RTCPeerConnection(servers);
            var pc1 = R.pc1
            pc1.id = Session.genId()

            pc1id.textContent = pc1.id

            R.localstream = localstream
            R.sdpConstraints = sdpConstraints

            R.sighost = {'host': "0.0.0.0", 'port': 8099}
            R.sigurl  = "ws://192.168.1.198:8099"
            Signal.initServer()
            Signal.init()
        }
    }
})();
