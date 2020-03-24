
var supportsRecording = easyrtc.supportsRecording();

var selfRecorder = null;
var callerRecorder = null;

function init() {
  if( !supportsRecording) {
   window.alert("This browser does not support recording.");
  }
 easyrtc.setRoomOccupantListener( loggedInListener);
 easyrtc.easyApp("Company_Chat_Line", "self", ["caller"],
     function(myId) {
        console.log("My easyrtcid is " + myId);
     }
 );
}


function loggedInListener(roomName, otherPeers) {
  var otherClientDiv = document.getElementById('otherClients');
  while (otherClientDiv.hasChildNodes()) {
      otherClientDiv.removeChild(otherClientDiv.lastChild);
  }
  for(var i in otherPeers) {
      var button = document.createElement('button');
      button.onclick = function(easyrtcid) {
          return function() {
              performCall(easyrtcid);
          }
      }(i);

      label = document.createTextNode(i);
      button.appendChild(label);
      otherClientDiv.appendChild(button);
  }
}

function endRecording() {
    if( selfRecorder ) {
       selfRecorder.stop();
    }
    if( callerRecorder ) {
       callerRecorder.stop();
    }
    document.getElementById("startRecording").disabled = false;
    document.getElementById("stopRecording").disabled = true;
}


function startRecording() {
    var selfLink = document.getElementById("selfDownloadLink");
    selfLink.innerText = "";

    selfRecorder = easyrtc.recordToFile( easyrtc.getLocalStream(),
               selfLink, "selfVideo");
    if( selfRecorder ) {
       document.getElementById("startRecording").disabled = true;
       document.getElementById("stopRecording").disabled = false;
    }
    else {
       window.alert("failed to start recorder for self");
       return;
    }

    var callerLink = document.getElementById("callerDownloadLink");
    callerLink.innerText = "";

    if( easyrtc.getIthCaller(0)) {
       callerRecorder = easyrtc.recordToFile(
           easyrtc.getRemoteStream(easyrtc.getIthCaller(0), null),
             callerLink, "callerVideo");
       if( !callerRecorder ) {
          window.alert("failed to start recorder for caller");
       }
    }
    else {
       callerRecorder = null;
    }
}


function performCall(easyrtcid) {
    easyrtc.call(
       easyrtcid,
       function(easyrtcid) { console.log("completed call to " + easyrtcid);},
       function(errorMessage) { console.log("err:" + errorMessage);},
       function(accepted, bywho) {
          console.log((accepted?"accepted":"rejected")+ " by " + bywho);
       }
   );
}
