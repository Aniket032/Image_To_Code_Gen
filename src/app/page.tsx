"use client";
import { useState, useRef } from "react";
import { experimental_useObject as useObject } from "ai/react";
import { FileUpload } from "@/app/components/FileUpload";
import { StatusBadge } from "@/app/components/StatusBadge";
import { GenerationState } from "@/app/types";
import { generateRequestSchema } from "./api/generate/schema";
import { toPng } from "html-to-image";
import { useEdgeStore } from "@/lib/edgestore";

export default function Page() {
  const ref = useRef<HTMLDivElement>(null);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [isGeneratedHtml, setIsGeneratedHtml] = useState<boolean>(false);
  const [originalURL, setOriginalURL] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [isCodeMinimized, setIsCodeMinimized] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const { edgestore } = useEdgeStore();

  const handleScreenShot = () => {
    if (ref.current === null) {
      setScreenshotError("No content found to capture");
      return;
    }

    setScreenshotError(null);
    setState((prev) => ({ ...prev, status: "Improvments in Progress" }));
    setIsCodeMinimized(true);

    toPng(ref.current, {
      cacheBust: true,
      quality: 1.0,
      pixelRatio: 2, // For better quality screenshots
    })
      .then(async (dataUrl) => {
        try {
          // Convert base64 to blob
          const base64Data = dataUrl.split(",")[1];
          const mimeType = "image/png";

          // Convert base64 to binary
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);

          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Create blob and file
          const blob = new Blob([bytes], { type: mimeType });
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const fileName = `screenshot-${timestamp}.png`;
          const file = new File([blob], fileName, { type: mimeType });

          // upload File to the edgestore
          const res = await edgestore.publicFiles.upload({
            file,
            options: {
              replaceTargetUrl: imageUrl,
            },
          });
          setImageUrl(res.url);
          console.log("Screenshot uploaded", res.url);
          setState((prev) => ({ ...prev, status: "generating" }));
          setIsCodeMinimized(false);
          setIsGeneratedHtml(false);
          submit({
            imageUrl: originalURL,
            version: state.version,
            generatedImageURL: res.url,
            accuracy: state.accuracy,
          });
        } catch (err) {
          setScreenshotError("Failed to process screenshot");
          console.error("Screenshot processing error:", err);
        }
      })
      .catch((err) => {
        setScreenshotError("Failed to capture screenshot");
        console.error("Screenshot capture error:", err);
      });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleUrlSubmit = () => {
    setImageUrl(inputUrl);
  };
  const [state, setState] = useState<GenerationState>({
    status: "idle",
    version: 1,
    accuracy: 0,
  });
  // const [screenshots, setScreenshots] = useState<GenerateRequest[]>([]);

  const handleOnFinish = (event: {
    object:
      | {
          accuracy: number;
          HtmlWithTailwindcss: string;
          imageUrl: string;
          generatedImageURL?: string | undefined;
        }
      | undefined;
    error: Error | undefined;
  }) => {
    setIsGeneratedHtml(true);
    setState((prev) => ({
      ...prev,
      version: prev.version + 1,
      status: "completed",
      accuracy: event.object?.accuracy ?? 0,
    }));
  };

  const { object, submit, isLoading } = useObject({
    api: "/api/generate",
    schema: generateRequestSchema,
    onFinish: handleOnFinish,
  });

  const generateCode = () => {
    setState((prev) => ({ ...prev, status: "generating" }));
    setIsGeneratedHtml(false);
    setIsCodeMinimized(false);

    if (state.version === 1) {
      setOriginalURL(imageUrl);

      submit({
        imageUrl,
        version: state.version,
      });
    } else {
      submit({
        imageUrl: originalURL,
        version: state.version,
        generatedImageURL: imageUrl,
        accuracy: state.accuracy,
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Image to Code Converter</h1>
        <StatusBadge status={state.status} version={state.version} />
      </div>

      <FileUpload
        label="Upload Reference Image"
        className="mb-4"
        setImageUrl={setImageUrl}
        imageUrl={imageUrl}
      />
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Or Enter Image URL
        </label>
        <input
          type="text"
          value={inputUrl}
          onChange={handleUrlChange}
          className="border p-2 w-full text-black"
          placeholder="Enter image URL"
        />
        <button
          onClick={handleUrlSubmit}
          className="mt-2 bg-blue-500 text-white p-2 rounded"
        >
          Submit URL
        </button>
      </div>

      {object && (
        <div className="mb-6 p-3 bg-slate-800">
          <button
            className="text-lg font-medium mb-4 border p-1 rounded-md"
            onClick={() => setIsCodeMinimized((prev) => !prev)}
          >
            Generated Code{" "}
          </button>
          <div
            className={`bg-gray-100 m-2 rounded ${
              isCodeMinimized ? "h-0 " : "h-full"
            } `}
          >
            <pre className="whitespace-pre-wrap p-4 text-sm text-black overflow-hidden">
              {object.HtmlWithTailwindcss}
            </pre>
          </div>
        </div>
      )}

      {imageUrl && (
        <>
          {isGeneratedHtml && object && (
            <>
              <h2 className="text-lg font-medium mb-4">Output</h2>
              <div ref={ref} className="bg-white w-full h-screen">
                <iframe
                  className="w-full h-screen overflow-hidden"
                  srcDoc={object.HtmlWithTailwindcss}
                ></iframe>
              </div>
              <button
                onClick={handleScreenShot}
                className="text-lg font-md my-3 py-2 px-4 bg-blue-500 rounded-md"
              >
                ScreenShot and Generate Version {state.version}
              </button>
            </>
          )}
          <div className="mb-6">
            <img
              src={originalURL === "" ? imageUrl : originalURL}
              alt="Reference"
              className="max-w-md mb-2 rounded shadow"
            />
            <div className="flex items-center gap-4">
              <button
                onClick={generateCode}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 transition-colors"
              >
                {isLoading
                  ? "Generating..."
                  : `Generate Version ${state.version}`}
              </button>
            </div>
          </div>
        </>
      )}

      {/* {completion && (
        <div className="mb-6">
          <FileUpload
            label="Upload Screenshot of Current Version"
            onChange={handleScreenshotUpload}
            className="mb-4"
          />
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap text-sm">{completion}</pre>
          </div>
        </div>
      )} */}

      {/* {screenshots.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Version History</h2>
          <div className="grid grid-cols-2 gap-4">
            {screenshots.map((screenshot, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <div className="p-3 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Version {screenshot.version}
                    </span>
                    <time className="text-xs text-gray-500">
                      {new Date(screenshot.timestamp).toLocaleString()}
                    </time>
                  </div>
                </div>
                <div className="p-2">
                  <img
                    src={screenshot.url}
                    alt={`Version ${screenshot.version}`}
                    className="max-w-full rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
