import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, AlertCircle } from "lucide-react";

const token = localStorage.getItem("authToken");

interface WebcamFeedProps {
  isRecording: boolean;
  facultyId: string;
  facultyName: string;
  subjectId: string;
  subjectName: string;
  division: string;
  department: string;
  semester: number;
  onStudentDetected: (name: string) => void; // 👈 New prop
}

interface AttendanceModalProps {
  isRecording: boolean;
  facultyId: string;
  facultyName: string;
  subjectId: string;
  subjectName: string;
  division: string;
  department: string;
  semester: number;
}

interface DetectionResult {
  name: string;
  datetime: string;
  image?: string; // Only for unknown
}

const WebcamFeed: React.FC<WebcamFeedProps> = ({
  isRecording,
  facultyId,
  facultyName,
  subjectId,
  subjectName,
  division,
  department,
  semester,
  onStudentDetected, // ✅ destructured here
}) => {
  const className = useMemo(() => {
    return { department, division, semester };
  }, [department, division, semester]);

  const staticData = useMemo(() => {
    return [facultyId, subjectId];
  }, [facultyId, subjectId]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detections, setDetections] = useState<DetectionResult[]>([]);

  useEffect(() => {
    if (isRecording) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isRecording]);

  useEffect(() => {
    let timeoutId: number;
    let isMounted = true;

    const pollDetection = async () => {
      if (!isRecording || !canvasRef.current || !videoRef.current) {
        timeoutId = window.setTimeout(pollDetection, 4000);
        return;
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, 1280, 720);

      canvasRef.current.toBlob(async (blob) => {
  if (!blob) {
    timeoutId = window.setTimeout(pollDetection, 4000);
    return;
  }

  const formData = new FormData();
  formData.append("frame", blob);

  try {
    const res = await fetch("http://localhost:5174/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (isMounted && Array.isArray(data.results)) {
      setDetections(data.results);

      // Notify parent modal of newly detected names
      data.results.forEach((det: DetectionResult) => {
        if (det.name) {
          onStudentDetected(det.name);
        }
      });

      const formattedAttendance = data.results.map((det: DetectionResult) => ({
        studentName: det.name,
        subject: subjectId,
        subjectName,
        faculty: facultyId,
        facultyName,
        date: new Date(),
        status: "present",
        division,
        department,
        semester,
      }));

      const attendanceBody = formattedAttendance;

      console.log("Sending attendance payload:", JSON.stringify(attendanceBody, null, 2));

      await fetch("http://localhost:5000/api/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceBody),
      });
    }
  } catch (err) {
    console.error("Error processing detection:", err);
  }

  if (isMounted) {
    timeoutId = window.setTimeout(pollDetection, 4000);
  }
}, "image/jpeg", 0.8); // Added quality parameter (0.8) and fixed syntax
    };

    if (isRecording) pollDetection();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isRecording]);

  const startCamera = async () => {
    try {
      if (stream) return;

      setIsLoading(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  if (error) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Please enable camera permissions and refresh the page
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 font-medium">Starting camera...</p>
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Video Feed */}
      <video
        ref={videoRef}
        className="w-full h-96 bg-black rounded-lg object-cover"
        playsInline
        muted
      />

      {/* Hidden Canvas */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ display: "none" }}
      />

      {/* Detection Results */}
      {detections.length > 0 && (
        <div className="absolute top-0 right-0 bg-white/80 p-2 rounded-bl-lg text-sm shadow max-w-xs">
          <h2 className="font-semibold mb-1">Detections</h2>
          <ul className="space-y-1 max-h-40 overflow-y-auto pr-2">
            {detections.map((det, index) => (
              <li key={index} className="flex items-center gap-2">
                {det.image && (
                  <img
                    src={det.image}
                    alt="Unknown Face"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-800">{det.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(det.datetime).toLocaleTimeString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;
