const express = require('express');
const app = express();
const imageRouter = require('./routers/imageRouter');
const path = require('path');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const Image = require('./models/image')(sequelize, Sequelize);

const amqp = require('amqplib');
const { Storage } = require('@google-cloud/storage');
const crypto = require('crypto');

const queueName = 'image_upload';
const bucketName = 'cc-yorijori';
const storage = new Storage({
  keyFilename: '/app/gcp-key.json',
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploadprofile')));
app.use('/image', imageRouter);

sequelize.sync().then(() => console.log('✅ DB synced')).catch(console.error);

async function uploadToGCS(file) {
  const buffer = Buffer.from(file.buffer, 'base64');
  const ext = path.extname(file.originalname);
  const filename = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
  const blob = storage.bucket(bucketName).file(filename);

  return new Promise((resolve, reject) => {
    const stream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
      pubilc: true
    });

    stream.on('finish', async () => {
      // try {
      //   await blob.makePublic(); // 퍼블릭 설정
      // } catch (e) {
      //   console.error('⚠️ 퍼블릭 설정 실패:', e.message); // 서비스 안 죽게 예외 처리
      // }
    
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
      resolve(publicUrl);
    });
    

    stream.on('error', reject);
    stream.end(buffer);
  });
}

(async () => {
  try {
    const connection = await amqp.connect('amqp://rabbitmq:5672');
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });

    console.log(`🟡 MQ 연결됨, 큐 수신 대기 중 (${queueName})...`);

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      let fileData;
      try {
        fileData = JSON.parse(msg.content.toString());
        console.log('📩 MQ 메시지 수신:', fileData);
      } catch (err) {
        console.error('❌ JSON 파싱 실패:', err);
        return;
      }

      try {
        const gcsUrl = await uploadToGCS(fileData);

        const saved = await Image.create({
          filename: fileData.originalname,
          url: gcsUrl,
          contentType: fileData.mimetype,
          postId: fileData.postId || null,
          userId: fileData.userId || null,
          sourceService: fileData.sourceService || 'unknown',
        });

        console.log('✅ 이미지 저장 성공:', saved.toJSON());
        channel.ack(msg);
      } catch (err) {
        console.error('❌ 이미지 저장 실패:', err);
      }
    }, { noAck: false });

  } catch (err) {
    console.error('❌ MQ 연결 실패:', err);
  }
})();

app.listen(3000, () => {
  console.log('🚀 Image service running on port 3000');
});
