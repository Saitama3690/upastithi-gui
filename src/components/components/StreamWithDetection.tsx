import { useEffect, useRef, useState } from "react";

interface Detection {
  name: string;
  score?: number;
  image: string;
  image_url?: string;
  datetime?: string;
}

export default function StreamWithDetection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [liveDetections, setLiveDetections] = useState<Detection[]>([]);
  const [historyDetections, setHistoryDetections] = useState<Detection[]>([]);

  // Start camera on mount
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Failed to access webcam:", error);
      }
    }
    startCamera();
  }, []);

  // Poll for live detections
  useEffect(() => {
    let isMounted = true;
    let timeoutId: number; // 👈 FIXED here

  //   const pollDetection = async () => {
  //     if (!canvasRef.current || !videoRef.current) {
  //       timeoutId = setTimeout(pollDetection, 4000);
  //       return;
  //     }

  //     const ctx = canvasRef.current.getContext("2d");
  //     if (!ctx) return;

  //     ctx.drawImage(videoRef.current, 0, 0, 1280, 720);
  //     canvasRef.current.toBlob(async (blob) => {
  //       if (!blob) {
  //         if (isMounted) timeoutId = setTimeout(pollDetection, 4000);
  //         return;
  //       }

  //       const formData = new FormData();
  //       formData.append("frame", blob);

  //       try {
  //         const res = await fetch("http://localhost:5174/api/analyze", {
  //           method: "POST",
  //           body: formData,
  //         });
  //         const data = await res.json();
  //         if (isMounted) setLiveDetections(data.results || []);
  //       } catch (err) {
  //         console.error("Error sending frame:", err);
  //       }

  //       if (isMounted) timeoutId = setTimeout(pollDetection, 4000);
  //     }, "image/jpeg");
  //   };

  //   pollDetection();

  //   return () => {
  //     isMounted = false;
  //     clearTimeout(timeoutId);
  //   };
  // }, []);

  // Poll for history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5174/face_records");
        const data = await res.json();
        setHistoryDetections(data.reverse());
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 flex items-center justify-center">
      <div className="relative w-full h-full rounded-[30px] border-[10px] border-green-600 overflow-hidden shadow-[0_15px_60px_rgba(0,255,80,0.2)]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width={1280}
          height={720}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] h-[94vh] max-w-7xl max-h-[94vh] object-cover rounded-[48px] border-[14px] border-green-500 shadow-[0_8px_40px_4px_rgba(16,255,80,0.15)] transition-all duration-700 ease-in-out bg-black"
        />

        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{ display: "none" }}
        />

        <div className="absolute right-0 top-0 w-full md:w-[60%] lg:w-[30%] h-full overflow-y-auto bg-black/40 backdrop-blur-xl p-4 shadow-inner">
          {/* Live Detections */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4 tracking-wide">
              🔍 Live Detections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {liveDetections.map((detection, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-green-800/80 to-green-900/90 rounded-2xl overflow-hidden shadow-xl text-white flex flex-col transform transition duration-300 hover:scale-105"
                >
                  <div className="h-32 bg-green-700 overflow-hidden">
                    <img
                      src={detection.image}
                      alt={detection.name}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h2 className="text-lg font-bold truncate">
                      {detection.name}
                    </h2>
                    {detection.score !== undefined && (
                      <p className="text-sm text-green-300 mt-1">
                        Score: {detection.score}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="mt-10">
            <h2 className="text-white text-xl font-semibold mb-4 tracking-wide">
              📜 History
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyDetections.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl text-white flex flex-col min-h-[220px] transform transition duration-300 hover:scale-105"
                >
                  <div className="h-32 bg-gray-700 overflow-hidden">
                    <img
                      src={
                        item.image ||
                        (item.image_url &&
                          `http://localhost:5174${item.image_url}`) ||
                        ""
                      }
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h2 className="text-lg font-bold truncate">{item.name}</h2>
                    <p className="text-xs text-gray-300 mt-1">
                      {item.datetime
                        ? `🕒 ${new Date(item.datetime).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
