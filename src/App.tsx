import { Button } from '@chakra-ui/button';
import { HStack, VStack } from '@chakra-ui/layout'
import { Textarea } from '@chakra-ui/textarea';
import { useEffect, useState } from 'react'
import useWebRtc from './useWebRtc'

function App() {
  const {
    createOffer,
    sdpObject,
    iceCandidate,
    remoteAudioRef,
    remoteVideoRef,
    localVideoRef,
    getLocalStream,
    createAnswer,
    handleIceCandidate,
    receiveAnswer
  } = useWebRtc();


  const [sdpInput, setSdpInput] = useState<string>("");
  const [iceCandidatesInput, setIceCandidatesInput] = useState<string>("");

  const sdpAsStr = JSON.stringify(sdpObject) || "";

  return (
    <VStack w="100vw" h="100vh" p={4} spacing={8}>
      <HStack spacing={4}>
        <Button
          onClick={createOffer}
        >
          Create Offer
        </Button>
        <Button
          onClick={() => createAnswer(sdpInput)}
        >
          Create Answer
        </Button>

        <Button
          onClick={() => receiveAnswer(JSON.parse(sdpInput))}
        >
          Accept Answer
        </Button>
        <Button
          onClick={() => handleIceCandidate(JSON.parse(iceCandidatesInput))}
        >
          Handle Icecandidate
        </Button>
      </HStack>

      <HStack spacing={8} w="full" justify="center">
        <VStack>
          <h3>Local Video</h3>
          <video
            style={{
              width: "300px",
              height: "500px",
              objectFit: "cover",
            }}
            ref={localVideoRef}
            muted
            autoPlay
            playsInline
          />
        </VStack>

        <VStack spacing={4}>
          <h3>Local Sdp</h3>
          <Textarea w="500px"
            value={!!sdpAsStr ? sdpAsStr : ""}
            readOnly
          />

          <h3>Remote Sdp</h3>
          <Textarea w="500px"
            value={sdpInput}
            onChange={e => setSdpInput(e.target.value)}
          />


          <h3> Local IceCandidate </h3>
          <Textarea w="500px"
            value={!!iceCandidate ? JSON.stringify(iceCandidate) : ""}
            readOnly
          />

          <h3> Remote IceCandidate </h3>
          <Textarea w="500px"
            value={iceCandidatesInput}
            onChange={e => setIceCandidatesInput(e.target.value)}
          />
        </VStack>

        <VStack>
          <h3>Remote Video</h3>
          <video
            ref={remoteVideoRef}
            style={{
              width: "300px",
              height: "500px",
              objectFit: "cover",
              background: "black"
            }}

            muted
            autoPlay
            playsInline
          />
        </VStack>
      </HStack>
      <audio ref={remoteAudioRef} autoPlay playsInline controls={false} />
    </VStack>
  )
}

export default App

