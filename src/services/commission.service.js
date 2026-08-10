const { CommissionSetting } = require('../models');

const getCommissionSettings = async (celebrityId, categorySlug) => {
  // 1. Try to find Celebrity specific settings
  if (celebrityId) {
    const celSetting = await CommissionSetting.findOne({
      where: { entityType: 'celebrity', entityId: celebrityId, isActive: true }
    });
    if (celSetting) return celSetting;
  }

  // 2. Try to find Global settings
  const globalSetting = await CommissionSetting.findOne({
    where: { entityType: 'global', isActive: true }
  });

  if (globalSetting) return globalSetting;

  // Fallback default setting if nothing is configured
  return {
    platformFeePercentage: 10.00,
    commissionPercentage: 15.00,
    minFee: 0.00,
    maxFee: null,
    releaseDays: 14
  };
};

const calculateSplit = async (amount, celebrityId, categorySlug) => {
  const settings = await getCommissionSettings(celebrityId, categorySlug);
  
  const amt = parseFloat(amount);
  const platFeePct = parseFloat(settings.platformFeePercentage);
  const commPct = parseFloat(settings.commissionPercentage);
  const releaseDays = parseInt(settings.releaseDays, 10);

  // Platform Fee (paid by client on top of appearance cost)
  let platformFee = (amt * platFeePct) / 100;
  if (settings.minFee && platformFee < parseFloat(settings.minFee)) {
    platformFee = parseFloat(settings.minFee);
  }
  if (settings.maxFee && platformFee > parseFloat(settings.maxFee)) {
    platformFee = parseFloat(settings.maxFee);
  }

  // Commission Fee (deducted from Celebrity earnings)
  const commission = (amt * commPct) / 100;
  const escrowAmount = amt;
  const netAmount = amt - commission; // What celebrity earns

  return {
    platformFee,
    commission,
    escrowAmount,
    netAmount,
    releaseDays
  };
};

module.exports = {
  getCommissionSettings,
  calculateSplit
};
