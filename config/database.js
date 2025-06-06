const { Sequelize } = require('sequelize');

// Kubernetes 내부 DNS 이름 사용
const sequelize = new Sequelize('image', 'root', 'yorijori', {
  host: 'mysql-image',     // Kubernetes 서비스 이름
  dialect: 'mysql',
  port: 3306,
  logging: false           // 로그 끄고 싶으면 false
});

module.exports = sequelize;
