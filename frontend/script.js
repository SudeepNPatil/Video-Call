
const roomId = 'room123'
const videoElement = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const micbtn = document.getElementById('btn1')
const videobtn = document.getElementById('btn2')
const start = document.getElementById('start');

let audioTracks;
let videoTracks
let stream;
let peer;

document.addEventListener('DOMContentLoaded', () => {

const socket = io('http://localhost:5000')
socket.emit('join-room', roomId);

// accessing the video and audiio of the system 
async function startmedia() {
    try{
        stream = await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true,
        })

        console.log("full stream",stream)
        console.log("Stream tracks:", stream.getTracks());

        videoElement.srcObject = stream;

    }catch(err){
        console.log("error in assecing media",err);
          stream = new MediaStream();
    }
}
startmedia();


start.addEventListener('click',async ()=>{

    videoTracks = stream.getVideoTracks();
    audioTracks = stream.getAudioTracks();

    console.log('🎥 Video Tracks:', videoTracks);
    console.log('🎤 Audio Tracks:', audioTracks);

    peer = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
});

    peer.onicecandidate = (event) => {
    if (event.candidate) {
        socket.emit('ice-candidate', {
            roomId,
            candidate: event.candidate
        });
    }
};

    stream.getTracks().forEach(track => {
    peer.addTrack(track, stream);
    });
    console.log(peer.getSenders());

     peer.ontrack = (event) => {
        console.log("🎥 Remote track received");
        remoteVideo.srcObject = event.streams[0];

        console.log(event.streams)
    };

    const offer = await peer.createOffer();
    console.log("OFFER:", offer);
    await peer.setLocalDescription(offer);

  /*   socket.emit('join-room',roomId); */
    socket.emit('offer',{roomId,offer});

})

    socket.on('answer', async ({ answer }) => {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', async ({ candidate }) => {
    if (candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
});
    

socket.on('offer', async ({ offer }) => {
    console.log("📥 Offer received");

    peer = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
});

       // ice-condidates
        peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                roomId,
                candidate: event.candidate
            });
        }
    };

    // Add local tracks (VERY IMPORTANT)
    stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
    });

    // When remote track comes → show video
    peer.ontrack = (event) => {
        console.log("🎥 Remote track received");
        remoteVideo.srcObject = event.streams[0];
        console.log(event.streams)
    };

    // Step 1: set remote description (offer)(accept offer)
    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    // Step 2: create answer
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    // Step 3: send answer back
    socket.emit('answer', { roomId, answer });

});

// mic on off
micbtn.addEventListener('click',()=>{
    
    if(micbtn.textContent === 'turn off mic'){
        audioTracks[0].enabled = false;
        micbtn.textContent = 'turn on mic'
    }else{
        audioTracks[0].enabled = true
        micbtn.textContent = 'turn off mic'
    }
    
})
// video on off 
videobtn.addEventListener('click',()=>{
    
    if(videobtn.textContent === 'turn off video'){
       videoTracks[0].enabled = false;
        videobtn.textContent = 'turn on video'
    }else{
     videoTracks[0].enabled = true;
        videobtn.textContent = 'turn off video'
    }
    
})

})