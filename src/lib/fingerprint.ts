/**
 * 生成浏览器指纹
 * 用于识别用户设备，实现防刷机制
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];
  
  // 用户代理
  components.push(navigator.userAgent);
  
  // 屏幕分辨率
  components.push(`${screen.width}x${screen.height}`);
  
  // 时区
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // 语言
  components.push(navigator.language);
  
  // 平台
  components.push(navigator.platform);
  
  // 硬件并发数
  components.push(navigator.hardwareConcurrency?.toString() || '0');
  
  // 内存信息（如果可用）
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    components.push(memory.jsHeapSizeLimit?.toString() || '0');
  }
  
  // Canvas指纹
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Brain Mark 🧠', 2, 2);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    // Canvas可能被禁用
    components.push('canvas-disabled');
  }
  
  // WebGL指纹
  const getWebGLFingerprint = (): string => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (!gl) return 'no-webgl';
      
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      return `${vendor}-${renderer}`;
    } catch {
      return 'webgl-error';
    }
  };
  components.push(getWebGLFingerprint());
  
  // 音频指纹
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    
    gainNode.gain.value = 0;
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(0);
    
    const audioFingerprint = analyser.frequencyBinCount.toString();
    components.push(audioFingerprint);
    
    oscillator.stop();
    audioContext.close();
  } catch (e) {
    components.push('audio-disabled');
  }
  
  // 组合所有组件并生成哈希
  const fingerprint = components.join('|');
  return await hashString(fingerprint);
}

/**
 * 生成匿名用户ID
 * 用于在本地存储中标识用户
 */
export function generateAnonymousId(): string {
  const storageKey = 'hb_anonymous_id';
  
  // 尝试从localStorage获取现有ID
  if (typeof window !== 'undefined') {
    const existingId = localStorage.getItem(storageKey);
    if (existingId) {
      return existingId;
    }
  }
  
  // 生成新的匿名ID
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const anonymousId = `anon_${timestamp}_${randomPart}`;
  
  // 保存到localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, anonymousId);
    } catch (e) {
      // localStorage可能被禁用
      console.warn('无法保存匿名ID到localStorage');
    }
  }
  
  return anonymousId;
}

/**
 * 使用Web Crypto API生成字符串哈希
 * @param str 要哈希的字符串
 */
async function hashString(str: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // 服务端或不支持Web Crypto API时的fallback
    return simpleHash(str);
  }
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (e) {
    // Web Crypto API失败时的fallback
    return simpleHash(str);
  }
}

/**
 * 简单哈希函数（fallback）
 * @param str 要哈希的字符串
 */
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * 检查是否为同一设备
 * @param fingerprint1 指纹1
 * @param fingerprint2 指纹2
 */
export function isSameDevice(fingerprint1: string, fingerprint2: string): boolean {
  return fingerprint1 === fingerprint2;
}

/**
 * 获取设备信息摘要（用于显示）
 */
export function getDeviceInfo(): {
  browser: string;
  os: string;
  device: string;
} {
  const userAgent = navigator.userAgent;
  
  // 检测浏览器
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // 检测操作系统
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  // 检测设备类型
  let device = 'Desktop';
  if (/Mobi|Android/i.test(userAgent)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(userAgent)) device = 'Tablet';
  
  return { browser, os, device };
}