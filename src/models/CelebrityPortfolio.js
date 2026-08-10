const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CelebrityPortfolio = sequelize.define('CelebrityPortfolio', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    celebrityId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'celebrity_id'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    mediaType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'media_type',
      validate: {
        isIn: [['image', 'video', 'audio', 'document', 'link']]
      }
    },
    mediaUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'media_url'
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      field: 'thumbnail_url'
    },
    category: {
      type: DataTypes.STRING(50)
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'published',
      validate: {
        isIn: [['draft', 'published', 'archived']]
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'celebrity_portfolio',
    underscored: true
  });

  return CelebrityPortfolio;
};
