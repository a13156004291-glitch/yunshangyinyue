
import React, { useState, useEffect } from 'react';
import { X, Crown, Check, CreditCard, Loader2, Ticket, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

const VipModal = () => {
  const { isVipModalOpen, closeVipModal, upgradeToVip, currentUser, validatePromoCode, discountCodes } = useUser();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'month' | 'quarter' | 'year'>('year');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState<{ type: 'percent' | 'fixed', value: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
      if (isVipModalOpen) {
          setPromoCode('');
          setDiscount(null);
          setPromoError('');
          setSelectedPlan('year');
      }
  }, [isVipModalOpen]);

  if (!isVipModalOpen) return null;

  const plans = [
    {
      id: 'month',
      name: '月度会员',
      price: 6.6,
      period: '/月',
      desc: '灵活订阅，畅享无损音质',
      recommend: false
    },
    {
      id: 'quarter',
      name: '季度会员',
      price: 16.8,
      period: '/季',
      desc: '超值优惠，立省 ¥3.0',
      recommend: false
    },
    {
      id: 'year',
      name: '年度会员',
      price: 66,
      period: '/年',
      desc: '至尊体验，平均 ¥5.5/月',
      recommend: true
    }
  ];

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate payment delay
    setTimeout(() => {
        setIsProcessing(false);
        const planName = plans.find(p => p.id === selectedPlan)?.name || '会员';
        upgradeToVip(planName);
    }, 1500);
  };

  const handleApplyPromo = () => {
      if (!promoCode.trim()) return;
      
      const validCode = validatePromoCode(promoCode);
      if (validCode) {
          setDiscount({ type: validCode.type, value: validCode.value });
          setPromoError('');
          showToast('优惠码已应用', 'success');
      } else {
          setDiscount(null);
          setPromoError('无效的优惠码');
      }
  };

  const currentPrice = plans.find(p => p.id === selectedPlan)?.price || 0;
  
  let finalPrice = currentPrice;
  if (discount) {
      if (discount.type === 'percent') {
          finalPrice = currentPrice * (1 - discount.value / 100);
      } else {
          finalPrice = Math.max(0, currentPrice - discount.value);
      }
  }

  const activeCodes = discountCodes.filter(d => d.active);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeVipModal}></div>
      <div className="relative bg-slate-900 border border-amber-500/30 w-full max-w-2xl rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-amber-600 to-yellow-600 flex items-center justify-between px-8 shrink-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 text-white">
                <div className="flex items-center gap-2 mb-1">
                    <Crown size={28} fill="currentColor" className="text-yellow-200" />
                    <h2 className="text-2xl font-bold italic">VIP 会员中心</h2>
                </div>
                <p className="text-yellow-100 opacity-90 text-sm">开通会员，解锁无损音质与专属特权</p>
            </div>
            <button 
                onClick={closeVipModal}
                className="relative z-10 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full transition"
            >
                <X size={20} />
            </button>
        </div>

        <div className="p-8 bg-slate-900 overflow-y-auto custom-scrollbar">
            {/* Privileges */}
            <div className="flex justify-between gap-4 mb-8 text-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Check size={20} />
                    </div>
                    <span className="text-xs text-slate-300">无损音质</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Check size={20} />
                    </div>
                    <span className="text-xs text-slate-300">身份标识</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Check size={20} />
                    </div>
                    <span className="text-xs text-slate-300">无限下载</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Check size={20} />
                    </div>
                    <span className="text-xs text-slate-300">广告特权</span>
                </div>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {plans.map(plan => (
                    <div 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id as any)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between h-40 ${
                            selectedPlan === plan.id 
                                ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                                : 'bg-slate-800 border-slate-700 hover:border-amber-500/50'
                        }`}
                    >
                        {plan.recommend && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                                超值推荐
                            </div>
                        )}
                        <div className="text-center mt-2">
                            <h3 className={`font-bold ${selectedPlan === plan.id ? 'text-amber-400' : 'text-slate-200'}`}>{plan.name}</h3>
                            <div className="flex items-end justify-center gap-1 mt-2 text-white">
                                <span className="text-sm font-medium mb-1">¥</span>
                                <span className="text-3xl font-bold">{plan.price}</span>
                                <span className="text-xs text-slate-400 mb-1">{plan.period}</span>
                            </div>
                        </div>
                        <div className={`text-center text-xs mt-2 ${selectedPlan === plan.id ? 'text-amber-200/80' : 'text-slate-500'}`}>
                            {plan.desc}
                        </div>
                    </div>
                ))}
            </div>

            {/* Promo Code & Payment */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                {/* Promo Input */}
                <div className="mb-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Ticket className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="text" 
                                value={promoCode}
                                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                                placeholder="输入优惠码"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-amber-500 uppercase font-mono tracking-wider"
                            />
                        </div>
                        <button 
                            onClick={handleApplyPromo}
                            disabled={!promoCode}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg text-sm font-bold transition disabled:opacity-50"
                        >
                            应用
                        </button>
                    </div>
                    {promoError && <p className="text-red-400 text-xs mt-1 ml-1">{promoError}</p>}
                    {discount && (
                        <p className="text-emerald-400 text-xs mt-1 ml-1 flex items-center gap-1">
                            <Check size={12}/> 已应用: {discount.type === 'percent' ? `${discount.value}% 折扣` : `立减 ¥${discount.value}`}
                        </p>
                    )}

                    {/* Active Promo Codes List */}
                    {activeCodes.length > 0 && (
                        <div className="mt-3">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">可用优惠</p>
                            <div className="flex flex-wrap gap-2">
                                {activeCodes.map(code => (
                                    <button
                                        key={code.id}
                                        onClick={() => { setPromoCode(code.code); setPromoError(''); }}
                                        className="text-[10px] flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded cursor-pointer hover:bg-emerald-500/20 transition"
                                    >
                                        <Ticket size={10} />
                                        <span className="font-mono font-bold">{code.code}</span>
                                        <span>
                                            ({code.type === 'percent' ? `-${code.value}%` : `-¥${code.value}`})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-4 border-t border-slate-700 pt-4">
                    <span className="text-slate-300">应付金额</span>
                    <div className="text-right">
                        {discount && (
                            <span className="text-sm text-slate-500 line-through mr-2">¥{currentPrice.toFixed(1)}</span>
                        )}
                        <span className="text-2xl font-bold text-amber-500">
                            ¥ {finalPrice.toFixed(1)}
                        </span>
                    </div>
                </div>
                
                <button 
                    onClick={handlePay}
                    disabled={isProcessing || currentUser?.isVip}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                        currentUser?.isVip 
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 shadow-amber-500/20'
                    }`}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> 正在支付...
                        </>
                    ) : currentUser?.isVip ? (
                        <>
                            <Check size={20} /> 您已经是尊贵的 VIP 会员
                        </>
                    ) : (
                        <>
                            <CreditCard size={20} /> 立即支付
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] text-slate-500 mt-3">
                    支付即代表同意《会员服务协议》与《自动续费协议》
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VipModal;
