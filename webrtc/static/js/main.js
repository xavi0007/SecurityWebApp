
const startBtn = document.getElementById("startServer").addEventListener("click", linkUpdate);

function linkUpdate(){
  document.getElementById("link").innerHTML = "<a href='https:192.168.1.134:8080'>Open this link in a new tab</a> ";
}
