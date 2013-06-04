
/*
// TEMPORARY register used while refactoring.
window.R = {}
R.pc1 = pc1
R.pc2 = pc2
R.localstream = localstream
R.sdpConstraints = sdpConstraints
*/

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

    ,gotDescription1: function(desc, pc1, pc2)
    {
      pc1.setLocalDescription(desc);
      trace("Offer from pc1 \n" + desc.sdp,pc1, pc2);
      pc2.setRemoteDescription(desc);
      // Since the "remote" side has no media stream we need
      // to pass in the right constraints in order for it to
      // accept the incoming offer of audio and video.
      pc2.createAnswer(function(desc2){RTC.gotDescription2(desc2, pc1, pc2)}, null, R.sdpConstraints);
    }

    ,gotDescription2: function(desc, pc1, pc2)
    {
      pc2.setLocalDescription(desc);
      trace("Answer from pc2 \n" + desc.sdp);
      pc1.setRemoteDescription(desc);
    }

    ,gotRemoteStream: function(e)
    {
      // Call the polyfill wrapper to attach the media stream to this element.
      attachMediaStream(vid2, e.stream);
      trace("Received remote stream");
    }

    ,iceCallback1: function(event, pc2)
    {
      if (event.candidate) {
        pc2.addIceCandidate(new RTCIceCandidate(event.candidate));
        trace("Local ICE candidate: \n" + event.candidate.candidate);
      }
    }
          
    ,iceCallback2: function(event, pc1)
    {
      if (event.candidate) {
        pc1.addIceCandidate(new RTCIceCandidate(event.candidate));
        trace("Remote ICE candidate: \n " + event.candidate.candidate);
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

    ,call: function() {
      btn2.disabled = true;
      btn3.disabled = false;
      trace("Starting call");
      videoTracks = R.localstream.getVideoTracks();
      audioTracks = R.localstream.getAudioTracks();
      if (videoTracks.length > 0)
        trace('Using Video device: ' + videoTracks[0].label);  
      if (audioTracks.length > 0)
        trace('Using Audio device: ' + audioTracks[0].label);
      var servers = null;

      R.pc1 = new RTCPeerConnection(servers);
      R.pc2 = new RTCPeerConnection(servers);
      var pc1 = R.pc1
      var pc2 = R.pc2

      trace("Created local peer connection object pc1");
      R.pc1.onicecandidate = function(e){ RTC.iceCallback1(e, pc2)}; 
      trace("Created remote peer connection object pc2");
      R.pc2.onicecandidate = function(e){ RTC.iceCallback2(e, pc1)};

      R.pc2.onaddstream = function(e){ RTC.gotRemoteStream(e) }; 

      R.pc1.addStream(R.localstream);
      trace("Adding Local Stream to peer connection");
      
      R.pc1.createOffer(function(desc){ RTC.gotDescription1(desc, pc1, pc2) });
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
        R.pc1 = pc1
        R.pc2 = pc2
        R.localstream = localstream
        R.sdpConstraints = sdpConstraints
        
    }
}
})();
