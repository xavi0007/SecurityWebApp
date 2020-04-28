//All rights reserved.

var supportsRecording = easyrtc.supportsRecording();

var selfRecorder = null;
var callerRecorder = null;
var connectList = {};
var channelIsActive = {}; // tracks which channels are active

function init() {
  if(!supportsRecording) {
    window.alert("This browser does not support recording.");
  }
  easyrtc.enableDataChannels(true);
  easyrtc.enableDebug(false);
  easyrtc.setDataChannelOpenListener(openListener);
  easyrtc.setDataChannelCloseListener(closeListener);
  easyrtc.setPeerListener(addToConversation);
  easyrtc.setRoomOccupantListener(loggedInListener);
  // easyrtc.easyApp("Company_Chat_Line", "self", ["caller"],
  //   function(myId) {
  //     console.log("My RTC id is " + myId);
  //   }
  // );
  easyrtc.easyApp("easyrtc.demo4", "selfVideo",
     ["callerVideo", "callerVideo2", "callerVideo3"], loginSuccess, loginFailure);
}

function addToConversation(who, msgType, content) {
  // Escape html special characters, then add linefeeds.
  // /g = global match \n newline &nbsp: allows you to create multiple spaces on a page
  content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  content = content.replace(/\n/g, '<br />');
  document.getElementById('conversation').innerHTML +=
    "<b>" + who + ":</b>&nbsp;" + content + "<br />";
}

//clear the list so that the next time it would be empty
function clearConnectList() {
    otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}

function loggedInListener(roomName, otherPeers) {
  connectList = otherPeers;

  var otherClientDiv = document.getElementById('otherClients');
  clearConnectList();

  var label, button;
  //Create a button for each connected user
  for (var id in connectList) {
      var rowGroup = document.createElement("span");
      //Create button for Calling
      button = document.createElement('button');
      button.id = "connect_" + id;
      button.onclick = function(id) {
          return function() {
              performCall(id);
          };
      }(id);
      label = document.createTextNode("Call " + easyrtc.idToName(id));
      button.appendChild(label);
      rowGroup.appendChild(button);

      //Create button to send message
      button = document.createElement('button');
      button.id = "send_" + id;
      button.onclick = function(id) {
          return function() {
              sendStuffP2P(id);
          };
      }(id);

      label = document.createTextNode("Send Message");
      button.appendChild(label);
      rowGroup.appendChild(button);
      otherClientDiv.appendChild(rowGroup);
      updateButtonState(id);
  }
  if (!otherClientDiv.hasChildNodes()) {
      otherClientDiv.innerHTML = "<em>No one is available</em>";
  }
}

//Listners for data datachannel
function openListener(otherParty) {
  channelIsActive[otherParty] = true;
  updateButtonState(otherParty);
}

function closeListener(otherParty) {
  channelIsActive[otherParty] = false;
  updateButtonState(otherParty);
}

//mute functions
var micDisabled = false;
function muteMic(){
  micDisabled = !micDisabled;
  if(micDisabled == true){
    easyrtc.enableMicrophone(false);
  }
  else{
    easyrtc.enableMicrophone(true);
  }
}



//Video recording functions
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

//send message function
function sendStuffP2P(otherID) {
    var text = document.getElementById('sendMessageText').value;
    // Don't send only whitespace
    if (text.replace(/\s/g, "").length === 0) {
        return;
    }
    if (easyrtc.getConnectStatus(otherID) === easyrtc.IS_CONNECTED) {
        easyrtc.sendDataP2P(otherID, 'msg', text);
    }
    else {
        easyrtc.showError("NOT-CONNECTED", "not connected to " + easyrtc.idToName(otherID) + " yet.");
    }

    addToConversation("Me", "msgtype", text);
    document.getElementById('sendMessageText').value = "";
}

//Calling function
function performCall(otherID) {
  if (easyrtc.getConnectStatus(otherID) === easyrtc.NOT_CONNECTED) {
    try {
      easyrtc.call(otherID,
      //success callback
      function(caller, media) {
        if (media === 'datachannel') {
        // console.log("made call succesfully");
        connectList[otherID] = true;
        }
      },
      //failure call back
      function(errorCode, errorText) {
        connectList[otherID] = false;
        easyrtc.showError(errorCode, errorText);
      },
      //Accepted calll back
      function(wasAccepted) {
        console.log("was accepted=" + wasAccepted);
        }
      );
    }catch(callerror) {
      console.log("call error ", callerror);
    }
  }
  else {
    easyrtc.showError("ALREADY-CONNECTED", "already connected to " + easyrtc.idToName(otherID));
  }
}

//Mostly for debugging purpose
function loginSuccess(ID) {
    selfID = ID;
    document.getElementById("iam").innerHTML = "I am " + ID;
}
//Mostly for debugging purpose
function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, "failure to login");
}

// Sets calls so they are automatically accepted (this is default behaviour)
easyrtc.setAcceptChecker(function(easyrtcid, callback) {
    callback(true);
} );

//GUI functions
function updateButtonState(otherID) {
    var isConnected = channelIsActive[otherID];
    if(document.getElementById('connect_' + otherID)) {
      console.log("the other id is " + otherID);
        document.getElementById('connect_' + otherID).disabled = isConnected;
    }
    if( document.getElementById('send_' + otherID)) {
        document.getElementById('send_' + otherID).disabled = !isConnected;
    }
}
