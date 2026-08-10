const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EventGalleryMedia = sequelize.define('EventGalleryMedia', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    galleryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'gallery_id'
    },
    mediaType: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'media_type',
      validate: {
        isIn: [['image', 'video', 'audio', 'document']]
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
    mediaOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'media_order'
    },
    caption: {
      type: DataTypes.TEXT
    },
    isCover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_cover'
    },
    fileSize: {
      type: DataTypes.BIGINT,
      field: 'file_size'
    },
    duration: {
      type: DataTypes.INTEGER
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'event_gallery_media',
    underscored: true
  });

  return EventGalleryMedia;
};
