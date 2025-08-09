import React, { useEffect, useRef, useState } from "react";

// CSS 애니메이션
const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// 모의 API 함수들
async function apiVtonRun({ personImage, clothUrl }) {
  await new Promise((r) => setTimeout(r, 1200));
  return { 
    result_image_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop", 
    job_id: "job_demo_1" 
  };
}

async function apiVideoRun({ imageUrl, prompt }) {
  await new Promise((r) => setTimeout(r, 2000));
  return { 
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
  };
}

// 카메라 컴포넌트
function CameraInput() {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setHasPermission(false);
      }
    }
    setupCamera();
  }, []);

  if (hasPermission === false) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>📷</div>
          <div>Camera permission required</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

// 옷 선택 컴포넌트
function GarmentPicker({ onSelect, selectedId }) {
  const garments = [
    { id: 'shirt1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=250&fit=crop', name: 'Plaid Shirt' },
    { id: 'shirt2', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=250&fit=crop', name: 'Striped Tee' },
    { id: 'shirt3', url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=200&h=250&fit=crop', name: 'Brown Tee' },
    { id: 'shirt4', url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=200&h=250&fit=crop', name: 'White Sweater' },
    { id: 'shirt5', url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200&h=250&fit=crop', name: 'Hoodie' },
    { id: 'shirt6', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&h=250&fit=crop', name: 'Dress' }
  ];

  return (
    <div style={{ width: '100%', height: '100%', padding: '1rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        height: '100%',
        overflowY: 'auto'
      }}>
        {garments.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: selectedId === item.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              transition: 'all 0.2s',
              transform: selectedId === item.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedId === item.id ? '0 10px 25px -3px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
          >
            <img 
              src={item.url} 
              alt={item.name}
              style={{
                width: '100%',
                height: '8rem',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              fontSize: '0.75rem',
              padding: '0.25rem'
            }}>
              {item.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// VTON 결과 컴포넌트
function VtonResult({ imageUrl, isLoading }) {
  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 0.5rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ color: '#6b7280' }}>Processing VTON...</div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👕</div>
          <div>VTON result will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <img 
        src={imageUrl} 
        alt="VTON Result" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

// 3D 비디오 컴포넌트
function VideoResult({ videoUrl, isLoading, onRegenerate }) {
  const videoRef = useRef(null);

  const handleFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#111827',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            animation: 'pulse 2s infinite'
          }}>🎬</div>
          <div style={{ marginBottom: '0.5rem' }}>Generating 3D video...</div>
          <div style={{
            width: '8rem',
            backgroundColor: '#374151',
            borderRadius: '9999px',
            height: '0.5rem',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              height: '0.5rem',
              borderRadius: '9999px',
              width: '60%',
              animation: 'pulse 1s infinite'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#111827',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎥</div>
          <div>3D video will appear here</div>
          {onRegenerate && (
            <button 
              onClick={onRegenerate}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Generate Video
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay
        loop
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      <button
        onClick={handleFullscreen}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        ⛶
      </button>
    </div>
  );
}

// 메인 앱 컴포넌트
export default function App() {
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [vtonResult, setVtonResult] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVtonLoading, setIsVtonLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [autoGenerate3D, setAutoGenerate3D] = useState(true);

  const handleGarmentSelect = (garmentId) => {
    setSelectedGarment(garmentId);
    setVtonResult(null);
    setVideoUrl(null);
  };

  const handleRunVton = async () => {
    if (!selectedGarment) return;
    
    setIsVtonLoading(true);
    try {
      const result = await apiVtonRun({ 
        personImage: null, 
        clothUrl: selectedGarment 
      });
      setVtonResult(result.result_image_url);
      
      if (autoGenerate3D) {
        await handleGenerateVideo(result.result_image_url);
      }
    } catch (error) {
      console.error('VTON failed:', error);
    } finally {
      setIsVtonLoading(false);
    }
  };

  const handleGenerateVideo = async (imageUrl) => {
    const targetImage = imageUrl || vtonResult;
    if (!targetImage) return;

    setIsVideoLoading(true);
    try {
      const result = await apiVideoRun({ 
        imageUrl: targetImage, 
        prompt: "Generate a 5s 720p@24fps runway walk with a single 360° turn" 
      });
      setVideoUrl(result.video_url);
    } catch (error) {
      console.error('Video generation failed:', error);
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <style>{styles}</style>
      
      {/* 헤더 */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          margin: 0 
        }}>
          Delayed Show
        </h1>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem' 
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.875rem' 
          }}>
            <input 
              type="checkbox" 
              checked={autoGenerate3D}
              onChange={(e) => setAutoGenerate3D(e.target.checked)}
              style={{ borderRadius: '4px' }}
            />
            Auto-generate 3D video
          </label>
          <button
            onClick={handleRunVton}
            disabled={!selectedGarment || isVtonLoading}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: !selectedGarment || isVtonLoading ? '#9ca3af' : '#2563eb',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: !selectedGarment || isVtonLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isVtonLoading ? 'Processing...' : 'Run VTON'}
          </button>
        </div>
      </div>

      {/* 4분할 메인 영역 */}
      <div style={{
        flex: 1,
        padding: '1rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '1rem',
        height: 'calc(100vh - 80px)'
      }}>
        {/* 좌상: 카메라 입력 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: 0 
            }}>
              Camera Input
            </h2>
          </div>
          <div style={{ padding: '1rem', flex: 1 }}>
            <CameraInput />
          </div>
        </div>

        {/* 우상: VTON 결과 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: 0 
            }}>
              VTON Result
            </h2>
          </div>
          <div style={{ padding: '1rem', flex: 1 }}>
            <VtonResult imageUrl={vtonResult} isLoading={isVtonLoading} />
          </div>
        </div>

        {/* 좌하: 옷 선택 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: 0 
            }}>
              Choose a garment
            </h2>
          </div>
          <div style={{ flex: 1 }}>
            <GarmentPicker 
              onSelect={handleGarmentSelect} 
              selectedId={selectedGarment} 
            />
          </div>
        </div>

        {/* 우하: 3D 비디오 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: 0 
            }}>
              3D Video
            </h2>
            <button
              onClick={() => handleGenerateVideo()}
              disabled={!vtonResult || isVideoLoading}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                borderRadius: '4px',
                border: 'none',
                cursor: vtonResult && !isVideoLoading ? 'pointer' : 'not-allowed',
                opacity: vtonResult && !isVideoLoading ? 1 : 0.5
              }}
            >
              Regenerate
            </button>
          </div>
          <div style={{ padding: '1rem', flex: 1 }}>
            <VideoResult 
              videoUrl={videoUrl} 
              isLoading={isVideoLoading}
              onRegenerate={() => handleGenerateVideo()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
