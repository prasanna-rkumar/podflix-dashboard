import { Button } from "@/components/ui/button";
import PodFlixVideo from "@/remotion/PodFlixVideo";
import { trpc } from "@/trpc/client";
import { Player } from "@remotion/player";

export default function VideoEditor() {

  const { mutate: generateCaptions, data } = trpc.generateCaptions.useMutation();

  if (!data) {
    return (
      <Button onClick={() => {
        console.log("generating captions");
        generateCaptions({
          s3_audio_url: "https://local-infra-api-publicbucket5c3dbab0-xqcrptaee34n.s3.us-east-1.amazonaws.com/test/minute.mp3?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQC5AARl4TRqcOAQ5hclZN0Vr2tOEknhP99QnZTMB6JbVgIgNuSlG4V9%2BFQ7rzSG7JfyRiPnWDmOssvb1wYyQnhtKn4q5AIIXBAAGgw2Mzc0MjMxOTE5NTciDJjtC0RcRLpFcAJ5eSrBAgLADVZM3wRZp3KehgLscgvvFO%2Bl0Ta%2B3fi5iJ0E1nyqko%2FUftPrIioLq7FEHYXqk67F3a8QBzliqplJu7nEchrnPiMadYDi%2FauTZZK0bl5%2BLOorlhSpAP3R9BT5%2F15WNFDSq%2B8E3x1hK%2B%2BX464Jf%2Bn6g8oBfM4PBlwXOxy9Dm01kUhlwnsBAxMIYBT4FK7ptcFzQUNEVHRMjIkHzuoy79qPVAAVMkbJv10xwIm7GSZRWQ72jCRGyVA4BLPHEtEeiKHiIeraT4N2Y2EmZgziaQmQ%2FkK1sAvGqwUEs7%2FaEXmoWbhQ10b5AEj5O293LcvbCsSL8ffnnSFqVGs5hlJeqhwTPmrV0523lsnRi19xqxK4rrPwzOZ4x8MBiMcVwZgItDO5XbIE452RwQEnAOJTKcy4OEI46bxEfwRGG3ZF%2FReGaTDj2PO0BjqzAk1XhQVol9ot4iVkEsDrumhBYUuxUo0IjNTrN0Ola5OixvZqKavesEcxkk9V2IBIETZZNBSHFSoQlpwHhpUZEv2jBWtciystga7LsSDHXACSfkkdiB0TrWeB7vueqIaDqH2irDDDYaTGe7T9jP2bOs3X2FF2%2FP812zdklq8NQuEem%2FomlXBCmVGHDipbi3SQbhmbpJk3nP735LlmCqORusIjINK06%2FFEicMzdLi15M%2BYUf4hsvwtVD0quuYTNDpzz1ljL3BjPkC67z2nQ4QACEM4iUfs0MZGfzsejNK2t16UUbe3gk0vI1FlOVWaNjnIPEsj69FgebsP7yrFF5drW5CqKad8UjuaH34ilt%2B0Sf8K9znBGqvCRACeMg6yrK0V11NrGreaTgmv7Al0JfzupbdNhng%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240721T122729Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAZI2LCA6KZRNUCCNT%2F20240721%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7a9c13c879daf5314caeba9cc96890658cf6a76728de2a408934b51d222cb728"
        });
      }}>generate captions</Button>
    )
  }

  return (
    <div className="flex h-full">
      <div>
        <h1>VideoEditor</h1>
      </div>
      <div className="w-full">
        <Player
          className="border-4 border-slate-300 rounded-md"
          style={{ width: "100%" }}
          controls
          component={PodFlixVideo}
          compositionWidth={1920}
          compositionHeight={1080}
          durationInFrames={24 * 60}
          fps={24}
          inputProps={{
            captions: data
          }}
        />
      </div>

    </div>
  );
}