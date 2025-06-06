const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // 메모리 저장
const amqp = require('amqplib');
const queueName = 'image_upload';
const imageController = require('../controllers/imageController');

let channel;

// MQ 연결 준비
(async () => {
const connection = await amqp.connect('amqp://rabbitmq:5672');
  channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });
  console.log('[라우터] MQ 연결 완료');
})();

router.post('/uploadPostImage', upload.single('file'), async (req, res) => {
  const file = req.file;
  const postId = parseInt(req.body.postId, 10);

  if (!file || !postId) {
    return res.status(400).json({ message: 'postId와 이미지 파일이 필요합니다.' });
  }

  const msg = {
    buffer: file.buffer.toString('base64'),
    originalname: file.originalname,
    mimetype: file.mimetype,
    postId,
    sourceService: 'community'
  };

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), { persistent: true });
  res.status(200).json({ message: '이미지 업로드 요청 수신', filename: file.originalname });
});

router.post('/upload/profile', upload.single('file'), async (req, res) => {
  const file = req.file;
  const userId = req.body.userId;

  if (!file || !userId) {
    return res.status(400).json({ message: 'file과 userId는 필수입니다.' });
  }

  const msg = {
    buffer: file.buffer.toString('base64'),
    originalname: file.originalname,
    mimetype: file.mimetype,
    userId,
    sourceService: 'profile'
  };

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), { persistent: true });
  res.status(200).json({ message: '프로필 이미지 업로드 요청 수신', filename: file.originalname });
});

router.get('/:id', imageController.getImage);

module.exports = router;
