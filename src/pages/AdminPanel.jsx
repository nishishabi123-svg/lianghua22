import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Table, 
  Card, 
  Button, 
  Input, 
  Select, 
  Modal, 
  Form, 
  message,
  Tabs,
  Statistic,
  Row,
  Col,
  Space,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  CrownOutlined, 
  DollarOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [membershipForm] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    // 加载模拟数据
    setUsers([
      {
        id: 1,
        phone: '138****1234',
        name: '用户1234',
        level: 'premium',
        registerTime: '2024-01-15',
        expireTime: '2024-12-31',
        dailyLimit: 10,
        usedCount: 3,
        monthlyUsed: 45,
        totalUsed: 230,
        status: 'active'
      },
      {
        id: 2,
        phone: '139****5678',
        name: '用户5678',
        level: 'normal',
        registerTime: '2024-02-20',
        expireTime: '2024-12-31',
        dailyLimit: 3,
        usedCount: 2,
        monthlyUsed: 28,
        totalUsed: 89,
        status: 'active'
      },
      {
        id: 3,
        phone: '136****9999',
        name: '用户9999',
        level: 'guest',
        registerTime: '2024-03-10',
        expireTime: '永久游客',
        dailyLimit: 1,
        usedCount: 1,
        monthlyUsed: 12,
        totalUsed: 12,
        status: 'active'
      }
    ]);

    setMemberships([
      {
        id: 1,
        name: '普通会员',
        price: 99,
        duration: 30,
        dailyLimit: 3,
        features: ['基础股票行情', '每日3次AI分析', '邮件客服'],
        isActive: true
      },
      {
        id: 2,
        name: '付费会员',
        price: 299,
        duration: 30,
        dailyLimit: 10,
        features: ['完整AI诊断', '精确买卖点位', '7×24小时客服'],
        isActive: true
      }
    ]);

    setPayments([
      {
        id: 1,
        userId: 1,
        userName: '用户1234',
        type: 'membership',
        productName: '付费会员',
        amount: 299,
        status: 'completed',
        paymentTime: '2024-03-01 14:30:22',
        paymentMethod: 'alipay'
      },
      {
        id: 2,
        userId: 2,
        userName: '用户5678',
        type: 'membership',
        productName: '普通会员',
        amount: 99,
        status: 'completed',
        paymentTime: '2024-02-20 10:15:33',
        paymentMethod: 'wechat'
      }
    ]);
  }, []);

  const userColumns = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: '500' }}>{record.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{record.phone}</div>
        </div>
      )
    },
    {
      title: '会员等级',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const levelConfig = {
          guest: { color: '#8b8b8b', text: '游客' },
          normal: { color: 'var(--primary-color)', text: '普通会员' },
          premium: { color: '#f59e0b', text: '付费会员' }
        };
        const config = levelConfig[level] || levelConfig.guest;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '使用情况',
      key: 'usage',
      render: (_, record) => (
        <div>
          <div>今日: {record.usedCount}/{record.dailyLimit}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            本月: {record.monthlyUsed} | 累计: {record.totalUsed}
          </div>
        </div>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      key: 'registerTime'
    },
    {
      title: '到期时间',
      dataIndex: 'expireTime',
      key: 'expireTime'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Button 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const paymentColumns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName'
    },
    {
      title: '产品',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${amount}`
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const methodMap = { alipay: '支付宝', wechat: '微信支付', card: '银行卡' };
        return methodMap[method] || method;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = { 
          completed: { color: 'green', text: '已完成' },
          pending: { color: 'orange', text: '待支付' },
          failed: { color: 'red', text: '失败' }
        };
        const config = statusMap[status] || statusMap.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '支付时间',
      dataIndex: 'paymentTime',
      key: 'paymentTime'
    }
  ];

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (userId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可恢复。',
      onOk: () => {
        setUsers(users.filter(u => u.id !== userId));
        message.success('删除成功');
      }
    });
  };

  const handleUserSubmit = (values) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...values } : u));
      message.success('更新成功');
    } else {
      setUsers([...users, { ...values, id: Date.now() }]);
      message.success('添加成功');
    }
    setUserModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  const handleMembershipSubmit = (values) => {
    if (editingUser) {
      setMemberships(memberships.map(m => m.id === editingUser.id ? { ...m, ...values } : m));
      message.success('更新成功');
    } else {
      setMemberships([...memberships, { ...values, id: Date.now() }]);
      message.success('添加成功');
    }
    setMembershipModalVisible(false);
    membershipForm.resetFields();
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.phone.includes(searchText)
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--app-background)' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '24px' }}>
            <SettingOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
            管理后台
          </h1>
        </div>

        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总用户数"
                value={users.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: 'var(--primary-color)' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="付费会员"
                value={users.filter(u => u.level === 'premium').length}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日收入"
                value={payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)}
                prefix={<DollarOutlined />}
                suffix="元"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃率"
                value={Math.round(users.filter(u => u.usedCount > 0).length / users.length * 100)}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="用户管理" key="users">
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <Input
                  placeholder="搜索用户名或手机号"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: '300px' }}
                />
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingUser(null);
                    form.resetFields();
                    setUserModalVisible(true);
                  }}
                >
                  添加用户
                </Button>
              </div>
              <Table
                columns={userColumns}
                dataSource={filteredUsers}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true
                }}
              />
            </TabPane>

            <TabPane tab="会员设置" key="memberships">
              <div style={{ marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setMembershipModalVisible(true)}
                >
                  添加会员套餐
                </Button>
              </div>
              <Table
                dataSource={memberships}
                columns={[
                  { title: '套餐名称', dataIndex: 'name' },
                  { title: '价格', render: (_, record) => `¥${record.price}/月` },
                  { title: '每日限制', dataIndex: 'dailyLimit', render: limit => `${limit}次` },
                  { title: '状态', render: (_, record) => (
                    <Tag color={record.isActive ? 'green' : 'red'}>
                      {record.isActive ? '启用' : '禁用'}
                    </Tag>
                  )},
                  { title: '操作', render: (_, record) => (
                    <Space>
                      <Button size="small" icon={<EditOutlined />}>编辑</Button>
                      <Button size="small" danger>删除</Button>
                    </Space>
                  )}
                ]}
                rowKey="id"
                pagination={false}
              />
            </TabPane>

            <TabPane tab="支付记录" key="payments">
              <Table
                columns={paymentColumns}
                dataSource={payments}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </Content>

      {/* 用户编辑Modal */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={userModalVisible}
        onCancel={() => {
          setUserModalVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Form.Item name="name" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="level" label="会员等级">
            <Select>
              <Select.Option value="guest">游客</Select.Option>
              <Select.Option value="normal">普通会员</Select.Option>
              <Select.Option value="premium">付费会员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dailyLimit" label="每日限制">
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button onClick={() => {
                setUserModalVisible(false);
                form.resetFields();
                setEditingUser(null);
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 会员套餐Modal */}
      <Modal
        title="会员套餐设置"
        open={membershipModalVisible}
        onCancel={() => {
          setMembershipModalVisible(false);
          membershipForm.resetFields();
          setEditingUser(null);
        }}
        footer={null}
      >
        <Form
          form={membershipForm}
          layout="vertical"
          onFinish={handleMembershipSubmit}
        >
          <Form.Item name="name" label="套餐名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <Input type="number" addonAfter="元/月" />
          </Form.Item>
          <Form.Item name="dailyLimit" label="每日分析次数" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => {
                setMembershipModalVisible(false);
                membershipForm.resetFields();
                setEditingUser(null);
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPanel;