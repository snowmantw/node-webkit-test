
/*
Note about ws-server:

1. Because nodejs is single thread, so the "client" and "server" will be in the same thread,
   thus we can't expect server keep running while client was stopped. 
   For instance, "client" & "server" will both got stopped when debugging.

*/
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
        var result = Math.ceil(Math.random() / 0.001)
        return result
    }

}
})();

(function()
{
window.Signal = 
{
    // cb: callback for successful openning. 
     init: function(cb)
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
                case "sendCandidate":
                        Signal.onIceCandidate(s)
                        break;
            }
        }
        R.sigclient.onclose = function(e)
        {
            trace("Connection to Signal server closed")
        }
        R.sigclient.onopen = function(e)
        {
            trace("Succefully connected to signal server")
            Signal.register(R.pc1.id)
            cb()
        }
        R.sigclient.onerror = function(e)
        {
            throw "Error: can't connect to Signal server"
        }
    }
    ,register: function(id)
    {
        trace("Client WebSocket register")
        R.sigclient.send(JSON.stringify({'id': id, 'name': 'register'}))
    }

    ,onOffer: function(note)
    {
        var desc = note.desc
        trace("Received an Offer. Set remote description from: "+note.from+" at: "+R.pc1.id)
        R.pc1.setRemoteDescription(new RTCSessionDescription(desc));

        RTC.addRemoteStreams();

        R.pc1.createAnswer(function(desc_a)
        {   
            RTC.forwardAnswerDescription(desc_a)
        }, null, R.sdpConstraints);
    }

    ,onAnswer: function(note)
    {
        var desc = note.desc
        trace("Received an Answer. Set remote description from: "+note.from+" at: "+R.pc1.id)
        R.pc1.setRemoteDescription(new RTCSessionDescription(desc));
    }

    ,onIceCandidate: function(note)
    {
        var candidate = note.candidate
        trace("Receive an ICE candidate from: "+note.from+", add it to: "+R.pc1.id)
        R.pc1.addIceCandidate(new RTCIceCandidate(note.candidate))
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
        R.sigclient.send(enc)
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
        R.sigclient.send(enc)
    }

    ,candidate: function(from, to, candidate, sigclient)
    {
        var data = 
        { 'from': from
        , 'to'  : to
        , 'candidate': candidate
        , 'name': 'sendCandidate'
        }

        var enc = JSON.stringify(data)
        R.sigclient.send(enc)
    }
}
})();

(function()
{
window.RTC = 
{
     gotLocalStream: function(stream)
    {
      trace("Received local stream");
      // Call the polyfill wrapper to attach the media stream to this element.
      attachMediaStream(vid1, stream);
      R.localstream = stream;
      btn2.disabled = false;
    }

    ,forwardOfferDescription: function(desc)
    {
      trace("Forward offer from "+R.pc1.id+" \n", desc.sdp);
      R.pc1.setLocalDescription(desc);
      trace("Set local description at: "+R.pc1.id);
      Signal.offer(R.pc1.id, R.targetId, desc, R.sigclient)
    }

    ,forwardAnswerDescription: function(desc)
    {
      trace("Forward answer from "+R.pc1.id+" \n", desc.sdp);
      R.pc1.setLocalDescription(desc);
      trace("Set local description at: "+R.pc1.id);
      Signal.answer(R.pc1.id, R.targetId, desc, R.sigclient)
    }

    ,addRemoteStreams: function()
    {
        R.pc1.getRemoteStreams().forEach(function(s)
        {
            // If we have lots of streams, we will need more vids.
            attachMediaStream(vid2, s);
            trace("Received remote stream");
        })

    }

    ,iceCallback: function(event)
    {
        trace("Received ICE candidate event from local at: "+R.pc1.id)
        // Must do this after adding RemoteDescription.
        if( event.candidate )
        {
            R.pc1.addIceCandidate(event.candidate)
            
            // candidate will become "available", and need to be sent to another peer.
            Signal.candidate(R.pc1.id, R.targetId, event.candidate, R.sigclient)      
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
                    RTC.gotLocalStream, function() {});
      R.sigurl  = tosrv.value
      // Another client's id.
      R.targetId = to.value
      if("" == R.targetId){ throw "Must give a friend Id"}
      Signal.init(function(){

      })
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
      R.pc1 = null;
      btn3.disabled = true;
      btn2.disabled = false;
      R.sigclient.close();
      R.localstream.stop();
    }

/* NOT SUPPORTED...
 *
    // Send data out.
    ,data: function()
    {
        R.dc.send(dcinput.value)
    }
*/

    ,main: function()
    {
        //var vid1 = document.getElementById("vid1");
        //var vid2 = document.getElementById("vid2");
        btn1.disabled = false;
        btn2.disabled = true;
        btn3.disabled = true;

        /* NOT SUPPORTED */
        btn4.disabled = true;
        var pc1,pc2;
        var localstream;
        var sdpConstraints = {'mandatory': {
                                'OfferToReceiveAudio':true, 
                                'OfferToReceiveVideo':true }};

        // TEMPORARY register used while refactoring.
        window.R = {}
        var servers = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
        R.pc1 = new RTCPeerConnection(servers);
/*
*       NOT SUPPORTED...
*
        R.dcS = R.pc1.createDataChannel('dcS')
        R.dcR = R.pc1.createDataChannel('dcS')
        R.dcR.onmessage = function(event)
        {
            dcarea.textContent = event.data
        }
*/
    
        var pc1 = R.pc1
        pc1.id = Session.genId()

        pc1id.textContent = pc1.id

        R.localstream = localstream
        R.sdpConstraints = sdpConstraints

        R.sighost = {'host': "0.0.0.0", "port": 8099}

        // To prevent block server while client is debugging.

        lsigsrv.textContent = "ws://"+R.sighost.host+":"+R.sighost.port

    }
}
})();
