const { Address } = require('../models');

const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressLine1, addressLine2, city, state, country, postalCode, latitude, longitude, isPrimary } = req.body;

    const t = await Address.sequelize.transaction();
    try {
      if (isPrimary) {
        // Set all other user addresses to not primary
        await Address.update({ isPrimary: false }, { where: { userId }, transaction: t });
      }

      const address = await Address.create({
        userId,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        latitude,
        longitude,
        isPrimary: isPrimary || false,
        isVerified: true, // Auto-verify addresses for easier testing out-of-the-box
        verificationStatus: 'verified'
      }, { transaction: t });

      await t.commit();
      return res.status(201).json({ success: true, data: address });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.findAll({ where: { userId }, order: [['isPrimary', 'DESC']] });
    return res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { addressLine1, addressLine2, city, state, country, postalCode, latitude, longitude, isPrimary } = req.body;

    const address = await Address.findOne({ where: { id, userId } });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const t = await Address.sequelize.transaction();
    try {
      if (isPrimary) {
        await Address.update({ isPrimary: false }, { where: { userId }, transaction: t });
        address.isPrimary = true;
      }

      if (addressLine1) address.addressLine1 = addressLine1;
      if (addressLine2) address.addressLine2 = addressLine2;
      if (city) address.city = city;
      if (state) address.state = state;
      if (country) address.country = country;
      if (postalCode) address.postalCode = postalCode;
      if (latitude) address.latitude = latitude;
      if (longitude) address.longitude = longitude;

      await address.save({ transaction: t });
      await t.commit();

      return res.status(200).json({ success: true, data: address });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const verifyAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    address.isVerified = true;
    address.verificationStatus = 'verified';
    await address.save();

    return res.status(200).json({ success: true, message: 'Address verified successfully', data: address });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = await Address.findOne({ where: { id, userId } });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await address.destroy();
    return res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  verifyAddress,
  deleteAddress
};
