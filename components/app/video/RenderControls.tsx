import { z } from "zod";
import { CompositionProps, COMP_NAME } from "@/types/constants";
import { useRendering } from "@/helpers/use-rendering";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver"
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";


export const RenderControls: React.FC<{
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ inputProps }) => {

  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const { renderMedia, state, } = useRendering(COMP_NAME, inputProps, {
    onComplete: (url) => {
      saveAs(url);
      setShowDownloadSuccess(true);
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowDownloadSuccess(false);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [showDownloadSuccess])

  const renderProgress = state.status === "rendering" ? Math.floor(state.progress * 100) : 100

  return (
    <div className=" w-full flex justify-start items-center">
      {state.status === "init" ||
        state.status === "invoking" ||
        state.status === "error" ||
        state.status === "done" ? (
        <>
          <div className="flex">
            <Button
              disabled={state.status === "invoking"}
              onClick={renderMedia}
            >
              {
                state.status === "invoking" && (
                  <LoaderCircleIcon size={20} className="animate-spin" color="white" />
                )
              }
              Download video
            </Button>
            {
              showDownloadSuccess ? (
                <div>
                  <span className=" text-green-700 text-lg">Video downloaded!!</span>
                </div>
              ) : null
            }
          </div>
        </>
      ) : null}
      {state.status === "rendering" ? (
        <div className=" flex flex-col w-full gap-6 ">
          <div className="flex justify-start items-center">
            <span className=" mr-4">Rendering video</span>
            <LoaderCircleIcon size={20} className="animate-spin" color="black" />
          </div>
          <div className=" rounded-full bg-slate-300 h-1 w-full grow shrink-0 relative">
            <span style={{ left: `${renderProgress}%` }} className=" text-sm  absolute bottom-2 -translate-x-1/2">{renderProgress}%</span>
            <div style={{ width: `${renderProgress}%` }} className=" bg-slate-900 rounded-full h-full"></div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
