const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Image = require('../models/image')(sequelize, Sequelize);

exports.getImage = async (req, res) => {
  try {
    const postId = req.params.postId;

    // postId를 기준으로 이미지 조회
    const image = await Image.findOne({ where: { postId } });

    if (!image) {
      return res.status(404).send('해당 postId의 이미지가 없습니다');
    }

    res.redirect(image.url);
  } catch (error) {
    console.error('이미지 조회 실패:', error);
    res.status(500).send('서버 오류');
  }
};