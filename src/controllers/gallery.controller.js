const { EventGallery, EventGalleryMedia, CelebrityPortfolio, Celebrity } = require('../models');
const { uploadFile } = require('../services/media.service');

const getCelebrityIdOrThrow = async (userId) => {
  const celebrity = await Celebrity.findOne({ where: { userId } });
  if (!celebrity) {
    const err = new Error('Celebrity profile not found');
    err.statusCode = 404;
    throw err;
  }
  return celebrity.id;
};

// === Event Gallery ===
const createGallery = async (req, res, next) => {
  try {
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);
    const { eventName, eventType, eventDate, eventLocation, eventDescription, category, highlights, isFeatured } = req.body;

    const gallery = await EventGallery.create({
      celebrityId,
      eventName,
      eventType,
      eventDate,
      eventLocation,
      eventDescription,
      category,
      highlights,
      isFeatured: isFeatured || false,
      status: 'published'
    });

    return res.status(201).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

const getGalleries = async (req, res, next) => {
  try {
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);
    const galleries = await EventGallery.findAll({
      where: { celebrityId },
      include: [{ model: EventGalleryMedia, as: 'media' }]
    });
    return res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    next(error);
  }
};

const getGalleryDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gallery = await EventGallery.findByPk(id, {
      include: [{ model: EventGalleryMedia, as: 'media' }]
    });

    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found' });
    }
    return res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

const updateGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);

    const gallery = await EventGallery.findOne({ where: { id, celebrityId } });
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found' });
    }

    const { eventName, eventType, eventDate, eventLocation, eventDescription, category, highlights, isFeatured, status } = req.body;

    if (eventName) gallery.eventName = eventName;
    if (eventType) gallery.eventType = eventType;
    if (eventDate) gallery.eventDate = eventDate;
    if (eventLocation) gallery.eventLocation = eventLocation;
    if (eventDescription) gallery.eventDescription = eventDescription;
    if (category) gallery.category = category;
    if (highlights) gallery.highlights = highlights;
    if (isFeatured !== undefined) gallery.isFeatured = isFeatured;
    if (status) gallery.status = status;

    await gallery.save();
    return res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

const deleteGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);

    const gallery = await EventGallery.findOne({ where: { id, celebrityId } });
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found' });
    }

    await gallery.destroy();
    return res.status(200).json({ success: true, message: 'Gallery deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addGalleryMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mediaType, caption, isCover, metadata } = req.body;
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);

    const gallery = await EventGallery.findOne({ where: { id, celebrityId } });
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found' });
    }

    let mediaUrl = req.body.mediaUrl;
    if (req.file) {
      mediaUrl = await uploadFile(req.file, 'gallery-media');
    }

    if (!mediaUrl) {
      return res.status(400).json({ success: false, message: 'Media file or URL is required' });
    }

    const media = await EventGalleryMedia.create({
      galleryId: id,
      mediaType: mediaType || 'image',
      mediaUrl,
      caption,
      isCover: isCover || false,
      metadata
    });

    return res.status(201).json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
};

const removeGalleryMedia = async (req, res, next) => {
  try {
    const { id, mediaId } = req.params;
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);

    const gallery = await EventGallery.findOne({ where: { id, celebrityId } });
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found' });
    }

    const media = await EventGalleryMedia.findOne({ where: { id: mediaId, galleryId: id } });
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media item not found' });
    }

    await media.destroy();
    return res.status(200).json({ success: true, message: 'Media item removed successfully' });
  } catch (error) {
    next(error);
  }
};

// === Celebrity Portfolio ===
const addPortfolioItem = async (req, res, next) => {
  try {
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);
    const { title, description, mediaType, category, isFeatured, displayOrder } = req.body;

    let mediaUrl = req.body.mediaUrl;
    if (req.file) {
      mediaUrl = await uploadFile(req.file, 'portfolio');
    }

    if (!mediaUrl) {
      return res.status(400).json({ success: false, message: 'Media file or URL is required' });
    }

    const portfolio = await CelebrityPortfolio.create({
      celebrityId,
      title,
      description,
      mediaType: mediaType || 'image',
      mediaUrl,
      category,
      isFeatured: isFeatured || false,
      displayOrder: displayOrder || 0,
      status: 'published'
    });

    return res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
};

const getPortfolioItems = async (req, res, next) => {
  try {
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);
    const items = await CelebrityPortfolio.findAll({
      where: { celebrityId },
      order: [['displayOrder', 'ASC']]
    });
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

const updatePortfolioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);

    const item = await CelebrityPortfolio.findOne({ where: { id, celebrityId } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Portfolio item not found' });
    }

    const { title, description, category, isFeatured, displayOrder, status } = req.body;

    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (isFeatured !== undefined) item.isFeatured = isFeatured;
    if (displayOrder !== undefined) item.displayOrder = displayOrder;
    if (status) item.status = status;

    await item.save();
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const deletePortfolioItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const celebrityId = await getCelebrityIdOrThrow(req.user.id);

    const item = await CelebrityPortfolio.findOne({ where: { id, celebrityId } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Portfolio item not found' });
    }

    await item.destroy();
    return res.status(200).json({ success: true, message: 'Portfolio item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGallery,
  getGalleries,
  getGalleryDetails,
  updateGallery,
  deleteGallery,
  addGalleryMedia,
  removeGalleryMedia,
  addPortfolioItem,
  getPortfolioItems,
  updatePortfolioItem,
  deletePortfolioItem
};
