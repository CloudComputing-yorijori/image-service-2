const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Image = require('../models/image')(sequelize, Sequelize);

exports.getImage = async (req, res) => {
  try {
    const id = req.params.id;
    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).send('Image not found');
    }

    res.redirect(image.url);
  } catch (error) {
    console.error('이미지 조회 실패:', error);
    res.status(500).send('서버 오류');
  }
};
