import React, { useEffect, useRef, useState } from "react";

// 파일 업로드 컴포넌트
function FileUploadInput({ onUpload, uploadedFile }) {
  const inputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          flex: 1,
          border: '2px dashed #cbd5e1',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: '#f8fafc',
          transition: 'all 0.2s'
        }}
      >
        {uploadedFile ? (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative'
          }}>
            <img
              src={URL.createObjectURL(uploadedFile)}
              alt="Uploaded person"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: '0.5rem',
              right: '0.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              fontSize: '0.875rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              {uploadedFile.name}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
            <div style={{ marginBottom: '0.25rem' }}>Click to upload or drag & drop</div>
            <div style={{ fontSize: '0.875rem' }}>JPG, PNG files</div>
          </div>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {uploadedFile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpload(null);
          }}
          style={{
            padding: '0.5rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Remove Image
        </button>
      )}
    </div>
  );
}

// 카메라 컴포넌트
function CameraInput() {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

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
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    setIsCapturing(true);
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        console.log('Captured photo:', file);
        alert('사진이 캡처되었습니다!');
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.8);
  };

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
        color: 'white',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>📷</div>
          <div>Camera permission required</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
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
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      
      <button
        onClick={capturePhoto}
        disabled={isCapturing}
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: isCapturing ? '#6b7280' : '#ef4444',
          border: '3px solid white',
          cursor: isCapturing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem'
        }}
      >
        {isCapturing ? '⏳' : '📸'}
      </button>
    </div>
  );
}

// 옷 선택 컴포넌트
function GarmentPicker({ onSelect, selectedId, disabled }) {
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
            onClick={() => onSelect(item)}
            disabled={disabled}
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: selectedId === item.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              transition: 'all 0.2s',
              transform: selectedId === item.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedId === item.id ? '0 10px 25px -3px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: 'transparent',
              opacity: disabled ? 0.5 : 1
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
          objectFit: 'contain'
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
  const [inputMode, setInputMode] = useState('file');
  const [uploadedPerson, setUploadedPerson] = useState(null);
  
  // Vite 프록시를 통한 요청 (CORS 우회)
  const apiUrl = '/v1/vton/idm';

  const handleGarmentSelect = (garment) => {
    setSelectedGarment(garment);
    setVtonResult(null);
    setVideoUrl(null);
  };

  const handlePersonUpload = (file) => {
    setUploadedPerson(file);
    setVtonResult(null);
    setVideoUrl(null);
  };

  const handleRunVton = async () => {
    console.log('=== VTON 실행 시작 ===');
    console.log('Input Mode:', inputMode);
    console.log('Uploaded Person:', uploadedPerson);
    console.log('Selected Garment:', selectedGarment);
    console.log('API URL:', apiUrl);
    
    if (inputMode === 'file' && !uploadedPerson) {
      alert('인물 이미지를 업로드해주세요.');
      return;
    }
    
    if (!selectedGarment) {
      alert('의상을 선택해주세요.');
      return;
    }
    
    setIsVtonLoading(true);
    setVtonResult(null);
    
    try {
      const formData = new FormData();
      
      if (inputMode === 'file' && uploadedPerson) {
        formData.append('person', uploadedPerson);
        console.log('✅ Added person file:', {
          name: uploadedPerson.name,
          size: uploadedPerson.size,
          type: uploadedPerson.type
        });
      } else if (inputMode === 'camera') {
        setIsVtonLoading(false);
        alert('카메라 캡처 기능은 아직 구현되지 않았습니다. 파일 업로드를 사용해주세요.');
        return;
      }
      
      formData.append('garment_url', selectedGarment.url);
      console.log('✅ Added garment_url:', selectedGarment.url);
      
      // FormData 내용 확인
      console.log('=== FormData 내용 ===');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type
          });
        } else {
          console.log(`${key}:`, value);
        }
      }
      
      console.log('🚀 Sending VTON request to:', apiUrl);
      console.log('Request method: POST');
      console.log('Request body: FormData (see above)');
      
      // CORS preflight 요청을 위한 추가 설정
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors', // CORS 모드 명시적 설정
        // Content-Type은 FormData 사용시 자동 설정됨
      });
      
      console.log('📡 Response received');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response URL:', response.url);
      console.log('Response OK:', response.ok);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        let errorDetails = '';
        
        try {
          const errorText = await response.text();
          console.log('❌ Error response body:', errorText);
          
          // JSON 파싱 시도
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorDetails = errorData.error;
            }
          } catch (jsonError) {
            // JSON이 아닌 경우 텍스트 그대로 사용
            errorDetails = errorText;
          }
        } catch (textError) {
          console.log('❌ Failed to read error response:', textError);
        }
        
        const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
        
        // 405 에러에 대한 특별 처리
        if (response.status === 405) {
          console.log('🔍 405 Method Not Allowed - 서버가 POST 메서드를 허용하지 않음');
          console.log('디버깅 단계:');
          console.log('1. 서버 엔드포인트 확인 중...');
          
          // 서버 기본 엔드포인트들 확인
          try {
            const healthCheck = await fetch('http://localhost:8000/health');
            console.log('Health check:', healthCheck.status, healthCheck.statusText);
            
            const rootCheck = await fetch('http://localhost:8000/');
            console.log('Root endpoint:', rootCheck.status, rootCheck.statusText);
            
            // 서버 정보 확인
            if (rootCheck.ok) {
              const rootData = await rootCheck.json();
              console.log('Server info:', rootData);
            }
          } catch (checkError) {
            console.log('Server check failed:', checkError);
          }
        }
        
        // 404 에러에 대한 특별 처리
        if (response.status === 404) {
          console.log('🔍 404 Error - API endpoint not found');
          console.log('Possible solutions:');
          console.log('1. Check if the server is running on http://localhost:8000');
          console.log('2. Verify the endpoint path is correct: /v1/vton/idm');
          console.log('3. Make sure CORS is enabled on the server');
        }
        
        throw new Error(fullError);
      }
      
      const result = await response.json();
      console.log('✅ VTON result received:', result);
      
      let resultUrl = '';
      if (result.image_url) {
        resultUrl = result.image_url;
        console.log('✅ Using image_url:', resultUrl);
      } else if (result.image_base64) {
        resultUrl = `data:image/png;base64,${result.image_base64}`;
        console.log('✅ Using image_base64, length:', result.image_base64.length);
      } else {
        console.log('❌ No image found in response');
        throw new Error('결과 이미지를 받을 수 없습니다. 응답에 image_url 또는 image_base64가 없습니다.');
      }
      
      setVtonResult(resultUrl);
      console.log('✅ VTON result set successfully');
      
      if (autoGenerate3D) {
        console.log('🎬 Auto-generating 3D video...');
        await handleGenerateVideo(resultUrl);
      }
      
    } catch (error) {
      console.error('❌ VTON error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let userMessage = `VTON 처리 중 오류가 발생했습니다:\n\n${error.message}`;
      
      if (error.message.includes('404')) {
        userMessage += '\n\n디버깅 정보:\n- 서버가 http://localhost:8000 에서 실행 중인지 확인하세요\n- 엔드포인트 /v1/vton/idm 이 올바른지 확인하세요';
      } else if (error.message.includes('fetch')) {
        userMessage += '\n\n네트워크 오류가 발생했습니다. 서버 연결을 확인하세요.';
      }
      
      alert(userMessage);
    } finally {
      setIsVtonLoading(false);
      console.log('=== VTON 실행 완료 ===');
    }
  };

  const handleGenerateVideo = async (imageUrl) => {
    const targetImage = imageUrl || vtonResult;
    if (!targetImage) return;

    setIsVideoLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const dummyVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      setVideoUrl(dummyVideoUrl);
    } catch (error) {
      console.error('Video generation failed:', error);
    } finally {
      setIsVideoLoading(false);
    }
  };

  const canRun = selectedGarment && ((inputMode === 'file' && uploadedPerson) || inputMode === 'camera') && !isVtonLoading;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      
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
            disabled={!canRun}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: !canRun ? '#9ca3af' : '#2563eb',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: !canRun ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isVtonLoading ? 'Processing...' : 'Run VTON'}
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: '1rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '1rem',
        height: 'calc(100vh - 80px)'
      }}>
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
              Person Input
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setInputMode('file')}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: inputMode === 'file' ? '#2563eb' : '#e5e7eb',
                  color: inputMode === 'file' ? 'white' : '#374151',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                File Upload
              </button>
              <button
                onClick={() => setInputMode('camera')}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: inputMode === 'camera' ? '#2563eb' : '#e5e7eb',
                  color: inputMode === 'camera' ? 'white' : '#374151',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Camera
              </button>
            </div>
          </div>
          <div style={{ padding: '1rem', flex: 1 }}>
            {inputMode === 'file' ? (
              <FileUploadInput onUpload={handlePersonUpload} uploadedFile={uploadedPerson} />
            ) : (
              <CameraInput />
            )}
          </div>
        </div>

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
              selectedId={selectedGarment?.id}
              disabled={isVtonLoading}
            />
          </div>
        </div>

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
