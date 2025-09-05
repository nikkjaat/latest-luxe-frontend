import React, { useState, useRef, useEffect } from "react";
import { Camera, RotateCcw, Download, Share2, Sparkles, X } from "lucide-react";
import { useAR } from "../context/ARContext";

const ARTryOn = ({ product }) => {
  const { startARSession, endARSession, captureARPhoto, arSupported } = useAR();
  const [isARActive, setIsARActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartAR = async () => {
    setLoading(true);
    setError("");

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported on this device");
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }

      await startARSession(product.id, "try-on");
      setIsARActive(true);
    } catch (error) {
      console.error("Failed to start AR session:", error);
      if (error.name === "NotAllowedError") {
        setError(
          "Camera access denied. Please allow camera access to use AR try-on."
        );
      } else if (error.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (error.name === "NotSupportedError") {
        setError("Camera is not supported on this device.");
      } else {
        setError("Failed to access camera. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEndAR = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    endARSession();
    setIsARActive(false);
    setCapturedPhoto(null);
    setError("");
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the image data URL
      const imageDataUrl = canvas.toDataURL("image/png");

      // Create a photo object
      const photo = {
        image: imageDataUrl,
        timestamp: new Date().toISOString(),
        productId: product.id,
      };

      // Use the context function if available, otherwise set directly
      if (captureARPhoto) {
        captureARPhoto(photo);
      }

      setCapturedPhoto(photo);
    }
  };

  const handleDownload = () => {
    if (capturedPhoto) {
      const link = document.createElement("a");
      link.href = capturedPhoto.image;
      link.download = `ar-tryOn-${product.name.replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (navigator.share && capturedPhoto) {
      navigator
        .share({
          title: `Check out how I look in ${product.name}!`,
          text: "Tried on using AR technology",
          url: window.location.href,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          // Fallback to copy link
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        });
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">AR Try-On</h3>
          </div>
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
            Beta
          </span>
        </div>
        <p className="text-sm opacity-90 mt-1">
          See how {product.name} looks on you
        </p>
      </div>

      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {!isARActive ? (
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-16 w-16 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Try Before You Buy
            </h4>
            <p className="text-gray-600 mb-6">
              Use your camera to see how this product looks on you in real-time
            </p>

            {/* Browser compatibility check */}
            {!navigator.mediaDevices && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  AR try-on requires a secure connection (HTTPS) and camera
                  access.
                </p>
              </div>
            )}

            <button
              onClick={handleStartAR}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center mx-auto"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Camera className="h-5 w-5 mr-2" />
              )}
              {loading ? "Starting AR..." : "Start AR Try-On"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AR Camera View */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />

              {/* Hidden canvas for capturing images */}
              <canvas ref={canvasRef} className="hidden" />

              {/* AR Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-purple-600 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border-2 border-white border-dashed">
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 text-white mx-auto mb-2" />
                    <p className="text-white font-semibold">{product.name}</p>
                    <p className="text-white text-sm opacity-90">
                      AR Try-On Active
                    </p>
                  </div>
                </div>
              </div>

              {/* AR Frame Overlay */}
              <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-50"></div>

              {/* Instructions */}
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-black bg-opacity-50 text-white text-xs p-2 rounded">
                  Position yourself in the frame and tap capture when ready
                </div>
              </div>

              {/* Product Info Overlay */}
              <div className="absolute bottom-16 left-4 right-4">
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {product.name}
                      </p>
                      <p className="text-purple-600 font-bold">
                        ${product.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">AR Preview</p>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-xs text-green-600">Live</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording indicator */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  <span className="text-xs">REC</span>
                </div>
              </div>

              {/* AR Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                  onClick={handleCapture}
                  className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <Camera className="h-6 w-6" />
                </button>
                <button
                  onClick={handleEndAR}
                  className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Captured Photo */}
            {capturedPhoto && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Captured Photo
                </h4>
                <div className="relative">
                  <img
                    src={capturedPhoto.image}
                    alt="AR Capture"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={handleDownload}
                      className="bg-white text-gray-900 p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="bg-white text-gray-900 p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 text-sm mb-1">
                AR Tips:
              </h5>
              <ul className="text-blue-800 text-xs space-y-1">
                <li>• Ensure good lighting for best results</li>
                <li>• Keep your device steady while trying on</li>
                <li>• Position yourself centered in the frame</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARTryOn;
