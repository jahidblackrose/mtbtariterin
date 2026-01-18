import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Camera, CheckCircle, AlertCircle, RefreshCw, ShieldCheck, Ban } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { toast } from "@/hooks/use-toast";
import { faceVerificationService, ApiError, ERROR_MESSAGES } from "@/services/api";

interface FaceVerificationStepProps {
  onNext: () => void;
  data: any;
}

type VerificationStatus = "idle" | "requesting-camera" | "camera-ready" | "capturing" | "analyzing" | "success" | "failed";

export const FaceVerificationStep = ({ onNext, data }: FaceVerificationStepProps) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Face detection based on skin tone presence
  const detectFace = useCallback((imageData: ImageData): boolean => {
    const data = imageData.data;
    let totalBrightness = 0;
    let pixelCount = 0;
    let skinTonePixels = 0;
    
    // Sample pixels for efficiency
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      pixelCount++;
      
      // Simple skin tone detection
      if (r > 95 && g > 40 && b > 20 && 
          r > g && r > b && 
          Math.abs(r - g) > 15 && 
          r - g < 100 && r - b < 100) {
        skinTonePixels++;
      }
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    const skinToneRatio = skinTonePixels / pixelCount;
    
    // Reject if too bright or too dark
    if (avgBrightness > 240 || avgBrightness < 30) {
      return false;
    }
    
    // Require minimum skin tone presence
    return skinToneRatio > 0.08;
  }, []);

  // Real-time face detection loop
  const startFaceDetection = useCallback(() => {
    const detectLoop = () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }
      
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 640;
      ctx.drawImage(video, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const detected = detectFace(imageData);
      
      setFaceDetected(detected);
      
      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };
    
    detectLoop();
  }, [detectFace]);

  // Start camera
  const startCamera = useCallback(async () => {
    setVerificationStatus("requesting-camera");
    setErrorMessage("");
    setFaceDetected(false);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user",
          width: { ideal: isMobile ? 480 : 640 },
          height: { ideal: isMobile ? 640 : 480 },
          frameRate: { ideal: isMobile ? 15 : 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              setVerificationStatus("camera-ready");
              startFaceDetection();
            })
            .catch((err) => {
              console.error("Video play error:", err);
              setVerificationStatus("failed");
              setErrorMessage("Unable to start video. Please try again.");
            });
        };
      }
    } catch (error: any) {
      console.error("Camera access error:", error);
      setVerificationStatus("failed");
      
      let errorMsg = "Camera access denied. Please allow camera permission and try again.";
      if (error.name === 'NotAllowedError') {
        errorMsg = "Camera permission denied. Please enable camera access in your browser settings.";
      } else if (error.name === 'NotFoundError') {
        errorMsg = "No camera found. Please ensure your device has a working camera.";
      } else if (error.name === 'NotReadableError') {
        errorMsg = "Camera is in use by another app. Please close other apps and try again.";
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Camera Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }, [isMobile, startFaceDetection]);

  // Capture photo when face is detected
  const capturePhoto = useCallback(async () => {
    if (!faceDetected) {
      setErrorMessage("No face detected. Please position your face in the frame.");
      toast({
        title: "No Face Detected",
        description: "Please ensure your face is clearly visible in the camera.",
        variant: "destructive",
      });
      return;
    }

    setVerificationStatus("capturing");
    
    if (!videoRef.current || !canvasRef.current) {
      setVerificationStatus("failed");
      setErrorMessage("Camera not ready. Please try again.");
      return;
    }
    
    // Wait a moment for stable frame
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setVerificationStatus("failed");
      setErrorMessage("Failed to capture image.");
      return;
    }
    
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 640;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(imageData);
    
    // Stop camera after capture
    stopCamera();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Analyze captured image
    setVerificationStatus("analyzing");
    
    try {
      const response = await faceVerificationService.verifyLiveness(imageData);
      
      if (response.success && response.data?.verified) {
        setVerificationStatus("success");
        toast({
          title: "Photo Captured!",
          description: "Face verified successfully.",
        });
      } else {
        throw new Error("Face verification failed");
      }
    } catch (error) {
      setVerificationStatus("failed");
      if (error instanceof ApiError) {
        setErrorMessage(ERROR_MESSAGES[error.code] || error.message);
      } else {
        setErrorMessage("Verification failed. Please try again with good lighting.");
      }
      toast({
        title: "Verification Failed",
        description: "Please try again with proper lighting.",
        variant: "destructive",
      });
    }
  }, [faceDetected, stopCamera]);

  const retryVerification = useCallback(() => {
    setVerificationStatus("idle");
    setErrorMessage("");
    setFaceDetected(false);
    setCapturedImage(null);
    stopCamera();
  }, [stopCamera]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3 bg-muted/30 rounded-lg">
        <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-sm">
            <BilingualText english="Face Capture" bengali="মুখ ক্যাপচার" />
          </h3>
          <p className="text-xs text-muted-foreground">
            <BilingualText 
              english="Position your face and capture photo" 
              bengali="আপনার মুখ অবস্থান করুন এবং ছবি তুলুন" 
            />
          </p>
        </div>
      </div>

      {/* Anti-Fraud Warning */}
      <div className="flex items-start gap-2 p-2.5 bg-warning/10 border border-warning/20 rounded-lg">
        <Ban className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <BilingualText 
            english="Real-time camera only. Photos/screenshots not allowed." 
            bengali="শুধুমাত্র রিয়েল-টাইম ক্যামেরা। ছবি/স্ক্রিনশট অনুমোদিত নয়।" 
          />
        </p>
      </div>

      {/* Camera Preview Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          <div className="max-w-xs mx-auto text-center">
            {/* Camera Preview */}
            <div className="relative mb-3">
              <div className={`w-44 h-56 mx-auto rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                verificationStatus === "success" 
                  ? "border-success bg-success/5" 
                  : verificationStatus === "failed"
                  ? "border-destructive bg-destructive/5"
                  : faceDetected
                  ? "border-success bg-success/5"
                  : "border-border bg-muted/50"
              }`}>
                {/* Video Element */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    ["camera-ready", "capturing"].includes(verificationStatus)
                      ? "block"
                      : "hidden"
                  }`}
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Idle State */}
                {verificationStatus === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-xs text-center">
                      <BilingualText english="Tap to start camera" bengali="ক্যামেরা শুরু করতে ট্যাপ করুন" />
                    </p>
                  </div>
                )}

                {/* Requesting Camera */}
                {verificationStatus === "requesting-camera" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin mb-2" />
                    <p className="text-primary font-medium text-xs">
                      <BilingualText english="Starting camera..." bengali="ক্যামেরা শুরু হচ্ছে..." />
                    </p>
                  </div>
                )}

                {/* Analyzing */}
                {verificationStatus === "analyzing" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    {capturedImage && (
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        style={{ transform: "scaleX(-1)" }}
                      />
                    )}
                    <RefreshCw className="w-8 h-8 text-primary animate-spin mb-2 relative z-10" />
                    <p className="text-primary font-medium text-xs relative z-10">
                      <BilingualText english="Verifying..." bengali="যাচাই করা হচ্ছে..." />
                    </p>
                  </div>
                )}

                {/* Success */}
                {verificationStatus === "success" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    {capturedImage && (
                      <img 
                        src={capturedImage} 
                        alt="Verified" 
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        style={{ transform: "scaleX(-1)" }}
                      />
                    )}
                    <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center mb-2 relative z-10">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-success font-semibold text-sm relative z-10">
                      <BilingualText english="Photo Captured!" bengali="ছবি তোলা হয়েছে!" />
                    </p>
                  </div>
                )}

                {/* Failed */}
                {verificationStatus === "failed" && (
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    <div className="w-14 h-14 bg-destructive rounded-full flex items-center justify-center mb-2">
                      <AlertCircle className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-destructive font-semibold text-sm mb-1">
                      <BilingualText english="Failed" bengali="ব্যর্থ" />
                    </p>
                    {errorMessage && (
                      <p className="text-destructive/80 text-xs px-2 text-center">{errorMessage}</p>
                    )}
                  </div>
                )}

                {/* Face Detection Indicator */}
                {verificationStatus === "camera-ready" && (
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      faceDetected 
                        ? "bg-success/90 text-white" 
                        : "bg-destructive/90 text-white"
                    }`}>
                      {faceDetected ? "✓ Face Detected" : "✗ No Face"}
                    </div>
                  </div>
                )}

                {/* Face guide overlay */}
                {["camera-ready", "capturing"].includes(verificationStatus) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-28 h-36 border-2 rounded-full transition-colors duration-300 ${
                      faceDetected 
                        ? "border-success/60" 
                        : "border-white/40"
                    }`} />
                  </div>
                )}
              </div>
            </div>

            {/* Validation Message */}
            {verificationStatus === "camera-ready" && !faceDetected && (
              <div className="mb-3 p-2 bg-destructive/10 rounded-lg">
                <p className="text-xs text-destructive">
                  <BilingualText 
                    english="Please position your face within the frame to continue" 
                    bengali="অনুগ্রহ করে এগিয়ে যেতে ফ্রেমের মধ্যে আপনার মুখ অবস্থান করুন" 
                  />
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {verificationStatus === "idle" && (
                <Button 
                  onClick={startCamera}
                  className="w-full gradient-primary" 
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  <BilingualText english="Start Camera" bengali="ক্যামেরা শুরু করুন" />
                </Button>
              )}

              {verificationStatus === "camera-ready" && (
                <Button 
                  onClick={capturePhoto}
                  className="w-full gradient-primary" 
                  size="lg"
                  disabled={!faceDetected}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  <BilingualText 
                    english={faceDetected ? "Capture Photo" : "Position Your Face"} 
                    bengali={faceDetected ? "ছবি তুলুন" : "মুখ অবস্থান করুন"} 
                  />
                </Button>
              )}

              {["capturing", "analyzing"].includes(verificationStatus) && (
                <Button disabled className="w-full bg-muted" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <BilingualText 
                    english={verificationStatus === "analyzing" ? "Verifying..." : "Capturing..."}
                    bengali={verificationStatus === "analyzing" ? "যাচাই করা হচ্ছে..." : "ক্যাপচার করা হচ্ছে..."} 
                  />
                </Button>
              )}

              {verificationStatus === "failed" && (
                <Button 
                  onClick={retryVerification}
                  variant="outline" 
                  size="lg"
                  className="w-full"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  <BilingualText english="Try Again" bengali="আবার চেষ্টা করুন" />
                </Button>
              )}

              {verificationStatus === "success" && (
                <Button 
                  onClick={onNext}
                  className="w-full gradient-primary" 
                  size="lg"
                >
                  <BilingualText english="Continue" bengali="এগিয়ে যান" />
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          <BilingualText 
            english="Ensure good lighting and hold device at eye level" 
            bengali="ভাল আলো নিশ্চিত করুন এবং ডিভাইস চোখের লেভেলে ধরুন" 
          />
        </p>
      </div>
    </div>
  );
};
