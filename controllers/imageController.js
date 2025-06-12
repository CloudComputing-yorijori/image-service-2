const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Image = require('../models/image')(sequelize, Sequelize);

exports.getPostImage = async (req, res) => {
  try {
    const postId = req.params.postId;

    // postId를 기준으로 이미지 조회
    const image = await Image.findOne({ where: { postId } });

    if (!image) {
      return res.status(404).send('해당 postId의 이미지가 없습니다');
    }

    res.json({ imageUrl: image.url });
  } catch (error) {
    console.error('이미지 조회 실패:', error);
    res.status(500).send('서버 오류');
  }
};

exports.getUserImage = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(` [GET] /image/user/${userId} 요청 들어옴`);

    const image = await Image.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']] // 최신 이미지 우선
    });

    if (!image) {
      console.warn(`userId=${userId}의 이미지 없음`);
      return res.status(404).send('해당 userId의 이미지가 없습니다');
    }

    res.json({ imageUrl: image.url });
  } catch (error) {
    console.error('유저 이미지 조회 실패:', error);
    res.status(500).send('서버 오류');
  }
};
