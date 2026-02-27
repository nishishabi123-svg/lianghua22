import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';

const LoginModal = ({ visible, onClose, onLogin }) => {
  const [phone, setPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [loginning, setLoginning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const sendVerificationCode = async () => {
    if (!validatePhone(phone)) {
      message.error('请输入正确的手机号');
      return;
    }

    setSendingCode(true);
    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('验证码已发送');
      
      // 开始倒计时
      let count = 60;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } catch (error) {
      message.error('发送失败，请重试');
    } finally {
      setSendingCode(false);
    }
  };

  const handleLogin = async () => {
    if (!phone) {
      message.error('请输入手机号');
      return;
    }
    if (!validatePhone(phone)) {
      message.error('请输入正确的手机号');
      return;
    }
    if (!verifyCode) {
      message.error('请输入验证码');
      return;
    }

    setLoginning(true);
    try {
      // 模拟登录验证
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        phone,
        name: `用户${phone.slice(-4)}`,
        level: 'normal',
        dailyLimit: 3,
        usedCount: 0,
        monthlyUsed: 0,
        totalUsed: 0,
        registerTime: new Date().toLocaleDateString(),
        expireTime: '2024-12-31'
      };

      onLogin(userData);
      message.success('登录成功');
      handleClose();
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoginning(false);
    }
  };

  const handleClose = () => {
    setPhone('');
    setVerifyCode('');
    setCountdown(0);
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ 
          textAlign: 'center', 
          fontSize: '18px', 
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          <UserOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
          用户登录
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={420}
      centered
      bodyStyle={{
        padding: '32px 24px',
        background: 'var(--app-background)'
      }}
    >
      <div className="login-form">
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          color: 'var(--text-muted)',
          fontSize: '14px'
        }}>
          登录以享受完整功能体验
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            color: 'var(--text-primary)',
            fontWeight: '500'
          }}>
            手机号
          </label>
          <Input
            size="large"
            placeholder="请输入手机号"
            prefix={<UserOutlined />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            style={{
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              fontSize: '15px'
            }}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            color: 'var(--text-primary)',
            fontWeight: '500'
          }}>
            验证码
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input
              size="large"
              placeholder="请输入验证码"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              maxLength={6}
              style={{
                flex: 1,
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                fontSize: '15px'
              }}
            />
            <Button
              size="large"
              type="primary"
              loading={sendingCode}
              disabled={countdown > 0 || !validatePhone(phone)}
              onClick={sendVerificationCode}
              style={{
                borderRadius: '12px',
                background: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                minWidth: '100px'
              }}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          loading={loginning}
          onClick={handleLogin}
          block
          style={{
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)'
          }}
        >
          {loginning ? '登录中...' : '立即登录'}
        </Button>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          登录即表示同意
          <a href="#" style={{ color: 'var(--primary-color)', margin: '0 4px' }}>
            用户协议
          </a>
          和
          <a href="#" style={{ color: 'var(--primary-color)', marginLeft: '4px' }}>
            隐私政策
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;