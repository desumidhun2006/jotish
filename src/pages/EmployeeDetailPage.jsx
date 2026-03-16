import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ==========================================
// INTENTIONAL BUG: STALE CLOSURE
// ==========================================
// This component tracks how long the HR rep spends on this verification page.
// The bug: The setInterval closure only captures the initial state (0) of secondsViewed.
// Because the dependency array is empty, it never gets the updated state,
// causing the timer to perpetually display "1" (0 + 1) and never increment further.
const EmployeeEngagementTracker = () => {
  const [secondsViewed, setSecondsViewed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsViewed(secondsViewed + 1); 
    }, 1000);

    return () => clearInterval(timer);
  }, []); // <-- Intentional missing dependency: secondsViewed

  return (
    <div className="p-3 mb-6 text-sm text-blue-800 bg-blue-100 rounded-md shadow-sm">
      <span className="font-semibold">Engagement Tracking:</span> Time spent reviewing profile: {secondsViewed} seconds
    </div>
  );
};

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mergedImage, setMergedImage] = useState(null);

  // Initialize Camera Lifecycle
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied or unavailable:", err);
      }
    };

    startCamera();

    // Crucial: Cleanup camera stream on unmount to prevent memory leaks/hardware lock
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      // Set canvas dimensions to match the actual underlying video stream resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      // Draw the current video frame onto the canvas (Layer 1: Photo)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setHasCaptured(true);
    }
  };

  // Math: Calculate correct drawing coordinates relative to the canvas scale
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Support both Touch (mobile/tablet) and Mouse (desktop) events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (!hasCaptured) return;
    e.preventDefault(); // Prevent scrolling on touch devices while signing
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !hasCaptured) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#FF0000'; // High contrast red for the signature
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const finishCapture = () => {
    // The "Blob" Merge: Exporting the canvas combines the photo and drawn strokes into one Base64 string natively
    const finalImage = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setMergedImage(finalImage);
  };

  const proceedToAnalytics = () => {
    // Pass the merged image to the analytics page via the router's state object
    navigate('/analytics', { state: { auditImage: mergedImage } });
  };

  return (
    <div className="max-w-3xl px-4 py-12 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
        <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded-full">
          Employee ID: {id}
        </span>
      </div>

      <EmployeeEngagementTracker />

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="mb-4 text-gray-700">
          {!hasCaptured 
            ? "Please capture a photo of the employee for verification." 
            : "Please sign directly over the captured photo using your mouse or touch screen."}
        </p>

        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full max-w-lg overflow-hidden bg-black rounded-lg shadow-md aspect-video">
            {/* Live Camera Feed */}
            <video ref={videoRef} autoPlay playsInline muted className={`absolute top-0 left-0 w-full h-full object-cover ${hasCaptured ? 'hidden' : 'block'}`} />
            
            {/* Capture/Signature Canvas */}
            <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className={`absolute top-0 left-0 w-full h-full object-cover touch-none ${hasCaptured ? 'block cursor-crosshair' : 'hidden'}`} />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {!hasCaptured ? (<button onClick={capturePhoto} className="px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Capture Photo</button>) 
            : (<><button onClick={() => { setHasCaptured(false); setMergedImage(null); }} className="px-6 py-2 font-medium text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">Retake Photo</button>
                {!mergedImage ? (<button onClick={finishCapture} className="px-6 py-2 font-medium text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Merge & Save Signature</button>) 
                : (<button onClick={proceedToAnalytics} className="px-6 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Proceed to Analytics</button>)}</>)}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmployeeDetailPage;