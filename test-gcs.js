const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, 'gcp-key.json'), // 키 경로 확인!
});

async function testGCS() {
  try {
    const [buckets] = await storage.getBuckets();
    console.log('✅ 버킷 목록:');
    buckets.forEach(bucket => console.log(`- ${bucket.name}`));
  } catch (err) {
    console.error('❌ 인증 실패:', err.message);
  }
}

testGCS();
