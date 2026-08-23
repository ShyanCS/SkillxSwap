import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Gift, Clock } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import logger from '../lib/logger';

const KarmaPage = () => {
  const { getWallet } = useWallet();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await getWallet();
        setWallet(data);
      } catch (error) {
        logger.error('Failed to fetch wallet:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'EARN':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'SPEND':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'ADMIN_CREDIT':
        return <Gift className="w-4 h-4 text-purple-600" />;
      case 'REFUND':
        return <Coins className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const isPositive = (type) => type === 'EARN' || type === 'ADMIN_CREDIT' || type === 'REFUND';

  const earned = wallet.transactions
    .filter((t) => t.type === 'EARN')
    .reduce((sum, t) => sum + t.amount, 0);
  const spent = wallet.transactions
    .filter((t) => t.type === 'SPEND')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Credit Wallet</h1>
          <p className="text-gray-600">
            Credits you earn by teaching and spend by learning — no money involved
          </p>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Coins className="w-8 h-8" />
            </div>
            <div className="text-3xl font-bold mb-1">{loading ? '...' : wallet.balance}</div>
            <div className="text-blue-100 text-sm">Current Balance</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">+{earned}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-600 mt-2">From teaching sessions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">-{spent}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-red-600 mt-2">From learning sessions</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : wallet.transactions.length > 0 ? (
              <div className="space-y-3">
                {wallet.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                    </div>
                    <div
                      className={`text-sm font-medium ${isPositive(tx.type) ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {isPositive(tx.type) ? '+' : '-'}
                      {tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-500">
                  Complete a teaching or learning session to see activity here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KarmaPage;
