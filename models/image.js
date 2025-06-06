module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Image', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.STRING,
    },
    postId: {
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    sourceService: {
      type: DataTypes.STRING,
    }
  });
};
