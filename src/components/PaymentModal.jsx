import React, { useState } from 'react';
import { Modal, Radio, Input, Button, message, Steps } from 'antd';
import { 
  AlipayOutlined, 
  WechatOutlined, 
  CreditCardOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

const { Step } = Steps;

const PaymentModal = ({ visible, onClose, plan, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const plans = {
    normal: {
      name: '普通会员',
      price: 99,
      originalPrice: 199,
      features: ['每日3次AI分析', '基础股票行情', '邮件客服支持']
    },
    premium: {
      name: '付费会员', 
      price: 299,
      originalPrice: 399,
      features: ['每日10次AI分析', '完整AI诊断结果', '精确买卖点位', '7×24小时客服']
    }
  };

  const currentPlan = plans[plan] || plans.normal;
  const finalPrice = couponCode === 'SAVE50' ? currentPlan.price - 50 : currentPlan.price;

  const handlePayment = async () => {
    setProcessing(true);
    setCurrentStep(1);

    try {
      // 模拟支付处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep(2);
      message.success('支付成功！');
      
      setTimeout(() => {
        onSuccess?.({
          plan,
          amount: finalPrice,
          paymentMethod,
          timestamp: new Date().toISOString()
        });
        handleClose();
      }, 1500);
    } catch (error) {
      message.error('支付失败，请重试');
      setCurrentStep(0);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setCouponCode('');
    setPaymentMethod('alipay');
    onClose();
  };

  const renderPaymentIcon = (method) => {
    switch (method) {
      case 'alipay':
        return <AlipayOutlined style={{ fontSize: '24px', color: '#1677ff' }} />;
      case 'wechat':
        return <WechatOutlined style={{ fontSize: '24px', color: '#07c160' }} />;
      case 'card':
        return <CreditCardOutlined style={{ fontSize: '24px', color: '#722ed1' }} />;
      default:
        return null;
    }
  };

  const renderPaymentInfo = (method) => {
    switch (method) {
      case 'alipay':
        return '支付宝安全支付';
      case 'wechat':
        return '微信支付';
      case 'card':
        return '银行卡/信用卡支付';
      default:
        return '';
    }
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600' }}>
            会员升级
          </span>
        </div>
      }
      open={visible}
      onCancel={processing ? null : handleClose}
      footer={null}
      width={520}
      centered
      bodyStyle={{
        padding: '32px 24px',
        background: 'var(--app-background)'
      }}
    >
      {/* 套餐信息 */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary-color), #60a5fa)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fff',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              {currentPlan.name}
            </h3>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
              {currentPlan.features.length} 项专属权益
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {currentPlan.originalPrice > currentPlan.price && (
              <div style={{ 
                textDecoration: 'line-through', 
                fontSize: '14px', 
                opacity: 0.7 
              }}>
                ¥{currentPlan.originalPrice}
              </div>
            )}
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              ¥{finalPrice}
            </div>
          </div>
        </div>
      </div>

      {/* 功能列表 */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>套餐权益</h4>
        {currentPlan.features.map((feature, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            color: 'var(--text-muted)'
          }}>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* 优惠券 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
          优惠券码
        </div>
        <Input
          placeholder="输入优惠券码（测试：SAVE50）"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          style={{ borderRadius: '8px' }}
        />
      </div>

      {/* 支付方式 */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>支付方式</h4>
        <Radio.Group 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: '8px' }}>
            <Radio value="alipay" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {renderPaymentIcon('alipay')}
                <span style={{ marginLeft: '12px' }}>{renderPaymentInfo('alipay')}</span>
              </div>
            </Radio>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Radio value="wechat" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {renderPaymentIcon('wechat')}
                <span style={{ marginLeft: '12px' }}>{renderPaymentInfo('wechat')}</span>
              </div>
            </Radio>
          </div>
          <div>
            <Radio value="card" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {renderPaymentIcon('card')}
                <span style={{ marginLeft: '12px' }}>{renderPaymentInfo('card')}</span>
              </div>
            </Radio>
          </div>
        </Radio.Group>
      </div>

      {/* 支付步骤 */}
      <div style={{ marginBottom: '24px' }}>
        <Steps current={currentStep} size="small">
          <Step title="确认支付" />
          <Step title="处理中" />
          <Step title="完成" />
        </Steps>
      </div>

      {/* 价格总计 */}
      <div style={{ 
        background: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>应付金额</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            ¥{finalPrice}
          </span>
        </div>
      </div>

      {/* 支付按钮 */}
      <Button
        type="primary"
        size="large"
        loading={processing}
        disabled={currentStep === 2}
        onClick={handlePayment}
        block
        style={{
          height: '48px',
          borderRadius: '12px',
          background: processing || currentStep === 2 ? '#52c41a' : 'var(--primary-color)',
          borderColor: processing || currentStep === 2 ? '#52c41a' : 'var(--primary-color)',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        {processing ? '支付处理中...' : currentStep === 2 ? '支付成功' : `立即支付 ¥${finalPrice}`}
      </Button>

      {/* 安全提示 */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '16px',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <span style={{ color: '#52c41a' }}>🔒</span> 安全加密支付，支持7天无理由退款
      </div>
    </Modal>
  );
};

export default PaymentModal;