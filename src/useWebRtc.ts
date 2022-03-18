import React, { useEffect, useRef, useState } from "react";

const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: ["turn:54.254.167.113:3478"],
      username: "citron",
      credential: "citronxxx",
    },
    {
      urls: ["stun:54.254.167.113:3478"]
    }
  ]
}

function useWebRtc() {
  const peerConnectionRef = useRef<RTCPeerConnection>(
    new RTCPeerConnection(rtcConfig)
  );
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localStreamRef = useRef<MediaStream>();

  const [sdpObject, setSdpObject] = useState<RTCSessionDescription | null>(null);
  const [iceCandidate, setIceCandidate] = useState<Array<RTCIceCandidate> | null>(null);

  const createOffer = async () => {
    if (!peerConnectionRef.current) return;
    const sdpObject = await peerConnectionRef.current.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });

    console.log("sdp", sdpObject)

    if (!sdpObject || !(sdpObject instanceof RTCSessionDescription))
      throw new Error("Can not create sdp");

    await peerConnectionRef.current.setLocalDescription(sdpObject);

    setSdpObject(sdpObject);
  }

  const receiveAnswer = async (sdp: RTCSessionDescription) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(sdp)
    );
  }

  const getLocalStream = async () => {
    try {
      if (!peerConnectionRef.current || !localVideoRef.current) return;

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 390,
          height: 600,
        },
      });

      if (!localStream) return;

      localStreamRef.current = localStream;
      localVideoRef.current.srcObject = localStream;

      localStream.getTracks().forEach((track) => {
        if (!peerConnectionRef.current) return;
        peerConnectionRef.current.addTrack(track, localStream);
      });

    } catch (error: any) {
      console.log(`getUserMedia error: ${error}`);
    }
  }

  const handleEvent = () => {
    if (!peerConnectionRef.current) return;
    peerConnectionRef.current.onicecandidate = ({ candidate }) => {
      console.log("==== GOT iceCandidate:", candidate);
      if (candidate) {
        setIceCandidate((prevIceCandidate) => {
          if (!prevIceCandidate) return [candidate];
          return [...prevIceCandidate, candidate];
        });
      }
    }

    peerConnectionRef.current.ontrack = event => {
      console.log("GOT TRACK:", event);
      if (!remoteAudioRef.current || !remoteVideoRef.current) return;
      const kindOfStream = event.track.kind;

      if (kindOfStream === 'video')
        remoteVideoRef.current.srcObject = event.streams[0];

      if (kindOfStream === 'audio') {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.volume = 1;
        remoteAudioRef.current.play();
      }
    }

  }

  const handleIceCandidate = async (iceCandidates: Array<RTCIceCandidate>) => {
    console.log("remote iceCandidate", iceCandidate);
    try {
      for (const candidate of iceCandidates) {
        console.log("each:", candidate);
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (error: any) {
      console.error(error);
    }
  }


  useEffect(() => {
    (async () => {
      handleEvent();
      await getLocalStream();
    })()
  }, [localStreamRef, remoteVideoRef, remoteAudioRef, peerConnectionRef])



  const createAnswer = async (remoteSdpString: string) => {
    if (!peerConnectionRef.current) return;
    // setRemoteDescription(remoteSdp);
    const remoteSdp = new RTCSessionDescription(JSON.parse(remoteSdpString));
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(remoteSdp));
    const mySdp = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(mySdp);
    setSdpObject(mySdp);
  }

  return {
    createOffer,
    sdpObject,
    iceCandidate,
    remoteVideoRef,
    localVideoRef,
    remoteAudioRef,
    getLocalStream,
    createAnswer,
    handleIceCandidate,
    receiveAnswer
  }
}

export default useWebRtc;
