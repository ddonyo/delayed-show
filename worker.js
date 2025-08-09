// worker.js - 실제 HF Space 호환 버전 (FileReader 제거)
export default {
  async fetch(request, env) {
    // CORS 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST' || !request.url.endsWith('/v1/vton/idm')) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const formData = await request.formData();
      
      // 실제 작동하는 HF Space URL들
      const hfSpaces = [
        {
          name: 'yisol-idm-vton',
          url: 'https://yisol-idm-vton.hf.space',
          endpoints: ['/api/predict', '/run/predict']
        },
        {
          name: 'alternate-space',
          url: 'https://huggingface.co/spaces/yisol/IDM-VTON',
          endpoints: ['/api/predict']
        }
      ];
      
      // person과 garment 데이터 준비
      let personBlob, garmentBlob;
      
      if (formData.has('person')) {
        personBlob = formData.get('person');
      } else if (formData.has('person_url')) {
        const personUrl = formData.get('person_url');
        console.log(`Fetching person from URL: ${personUrl}`);
        const personResponse = await fetch(personUrl);
        if (!personResponse.ok) throw new Error('Failed to fetch person image');
        personBlob = await personResponse.blob();
      } else {
        throw new Error('person or person_url required');
      }
      
      if (formData.has('garment')) {
        garmentBlob = formData.get('garment');
      } else if (formData.has('garment_url')) {
        const garmentUrl = formData.get('garment_url');
        console.log(`Fetching garment from URL: ${garmentUrl}`);
        const garmentResponse = await fetch(garmentUrl);
        if (!garmentResponse.ok) throw new Error('Failed to fetch garment image');
        garmentBlob = await garmentResponse.blob();
      } else {
        throw new Error('garment or garment_url required');
      }

      console.log(`Person blob size: ${personBlob.size}, type: ${personBlob.type}`);
      console.log(`Garment blob size: ${garmentBlob.size}, type: ${garmentBlob.type}`);

      // 여러 HF Space와 엔드포인트 시도
      for (const space of hfSpaces) {
        for (const endpoint of space.endpoints) {
          try {
            console.log(`Trying ${space.name} with endpoint ${endpoint}`);
            const result = await tryHfEndpoint(space.url + endpoint, personBlob, garmentBlob);
            if (result) {
              console.log(`Success with ${space.name}${endpoint}`);
              return new Response(JSON.stringify(result), {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              });
            }
          } catch (error) {
            console.log(`Failed ${space.name}${endpoint}: ${error.message}`);
            continue;
          }
        }
      }
      
      // 모든 Space 실패 시 상세 디버깅 정보와 함께 더미 응답
      console.log('All HF Spaces failed, checking space availability...');
      
      // Space 상태 체크
      const spaceStatus = await checkSpaceStatus();
      
      const dummyImageUrl = "https://via.placeholder.com/512x768/FF69B4/FFFFFF?text=VTON+Result";
      
      return new Response(JSON.stringify({ 
        image_url: dummyImageUrl,
        warning: "Using dummy result - HF Spaces unavailable",
        debug: {
          spaces_checked: hfSpaces.length,
          space_status: spaceStatus,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          debug: {
            error_type: error.name,
            stack: error.stack?.substring(0, 500)
          }
        }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};

async function tryHfEndpoint(apiUrl, personBlob, garmentBlob) {
  console.log(`Calling: ${apiUrl}`);
  
  // FormData로 직접 전송 (Base64 변환 없음)
  const hfFormData = new FormData();
  hfFormData.append('person', personBlob, 'person.jpg');
  hfFormData.append('garment', garmentBlob, 'garment.jpg');
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: hfFormData,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; VTONProxy/1.0)',
      'Accept': 'application/json',
    },
  });
  
  console.log(`Response status: ${response.status}`);
  console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log(`Error response body: ${errorText.substring(0, 200)}...`);
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
  }
  
  const contentType = response.headers.get('content-type');
  console.log(`Response content-type: ${contentType}`);
  
  if (contentType?.includes('application/json')) {
    const result = await response.json();
    console.log(`JSON result keys: ${Object.keys(result)}`);
    
    // 다양한 응답 형식 처리
    if (result.data) {
      if (Array.isArray(result.data) && result.data[0]) {
        const firstItem = result.data[0];
        
        // URL 형태
        if (typeof firstItem === 'string' && firstItem.startsWith('http')) {
          return { image_url: firstItem };
        }
        
        // Base64 data URL 형태
        if (typeof firstItem === 'string' && firstItem.startsWith('data:image')) {
          const base64Data = firstItem.split(',')[1];
          return { image_base64: base64Data };
        }
        
        // 객체 형태
        if (typeof firstItem === 'object' && firstItem.url) {
          return { image_url: firstItem.url };
        }
      }
    }
    
    // 직접 image 필드
    if (result.image) {
      if (result.image.startsWith('http')) {
        return { image_url: result.image };
      } else if (result.image.startsWith('data:image')) {
        const base64Data = result.image.split(',')[1];
        return { image_base64: base64Data };
      }
    }
    
    // 기타 가능한 필드들
    if (result.output || result.result || result.generated_image) {
      const imageData = result.output || result.result || result.generated_image;
      if (typeof imageData === 'string') {
        if (imageData.startsWith('http')) {
          return { image_url: imageData };
        } else if (imageData.startsWith('data:image')) {
          const base64Data = imageData.split(',')[1];
          return { image_base64: base64Data };
        }
      }
    }
    
    console.log(`Unrecognized response format:`, JSON.stringify(result).substring(0, 200));
    throw new Error('Unrecognized response format');
  }
  
  // 이미지 직접 반환인 경우
  if (contentType?.includes('image/')) {
    console.log('Response is direct image, converting to base64');
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return { image_base64: base64 };
  }
  
  throw new Error(`Unexpected content type: ${contentType}`);
}

async function checkSpaceStatus() {
  const spaces = [
    'https://yisol-idm-vton.hf.space',
    'https://huggingface.co/spaces/yisol/IDM-VTON'
  ];
  
  const status = {};
  
  for (const spaceUrl of spaces) {
    try {
      const response = await fetch(spaceUrl, { method: 'HEAD' });
      status[spaceUrl] = {
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      status[spaceUrl] = {
        error: error.message
      };
    }
  }
  
  return status;
}
