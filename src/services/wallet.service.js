const { Wallet, Transaction } = require('../models');
const { sequelize } = require('../models');

const getOrCreateWallet = async (userId) => {
  const [wallet] = await Wallet.findOrCreate({
    where: { userId },
    defaults: {
      balance: 0.00,
      pendingBalance: 0.00,
      totalEarned: 0.00,
      isActive: true
    }
  });
  return wallet;
};

const creditPending = async (userId, amount, referenceType, referenceId, description, transaction = null) => {
  const t = transaction || await sequelize.transaction();
  try {
    const wallet = await getOrCreateWallet(userId);
    wallet.pendingBalance = parseFloat(wallet.pendingBalance) + parseFloat(amount);
    await wallet.save({ transaction: t });

    await Transaction.create({
      userId,
      walletId: wallet.id,
      type: 'credit',
      category: 'escrow_hold',
      amount,
      balance: wallet.balance, // Main available balance doesn't change yet
      referenceType,
      referenceId,
      description
    }, { transaction: t });

    if (!transaction) await t.commit();
    return wallet;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

const creditAvailable = async (userId, amount, referenceType, referenceId, description, transaction = null) => {
  const t = transaction || await sequelize.transaction();
  try {
    const wallet = await getOrCreateWallet(userId);
    
    // Move from pending to active if applicable, or credit directly
    const amt = parseFloat(amount);
    wallet.pendingBalance = Math.max(0, parseFloat(wallet.pendingBalance) - amt);
    wallet.balance = parseFloat(wallet.balance) + amt;
    wallet.totalEarned = parseFloat(wallet.totalEarned) + amt;
    await wallet.save({ transaction: t });

    await Transaction.create({
      userId,
      walletId: wallet.id,
      type: 'credit',
      category: 'escrow_release',
      amount: amt,
      balance: wallet.balance,
      referenceType,
      referenceId,
      description
    }, { transaction: t });

    if (!transaction) await t.commit();
    return wallet;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

const debitAvailable = async (userId, amount, category, referenceType, referenceId, description, transaction = null) => {
  const t = transaction || await sequelize.transaction();
  try {
    const wallet = await getOrCreateWallet(userId);
    const amt = parseFloat(amount);
    
    if (parseFloat(wallet.balance) < amt) {
      throw new Error('Insufficient wallet balance');
    }

    wallet.balance = parseFloat(wallet.balance) - amt;
    await wallet.save({ transaction: t });

    await Transaction.create({
      userId,
      walletId: wallet.id,
      type: 'debit',
      category,
      amount: amt,
      balance: wallet.balance,
      referenceType,
      referenceId,
      description
    }, { transaction: t });

    if (!transaction) await t.commit();
    return wallet;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

module.exports = {
  getOrCreateWallet,
  creditPending,
  creditAvailable,
  debitAvailable
};
