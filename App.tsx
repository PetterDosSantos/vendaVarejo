// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Modal,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  SafeAreaView,
  Vibration,
  Platform,
  ActivityIndicator
} from 'react-native';

const { width } = Dimensions.get('window');

// Interfaces para tipagem
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image: string;
  createdAt?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'seller' | 'customer';
  name: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: Date;
}

export default function App() {
  // Estados da aplicação com tipagem
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  });
  const [activeScreen, setActiveScreen] = useState<string>('products');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: ''
  });
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [editProfileData, setEditProfileData] = useState<Partial<User>>({});
  
  // Animação do menu lateral
  const slideAnim = useState(new Animated.Value(-300))[0];

  // Dados de usuários (simulando um banco de dados local)
  const [users, setUsers] = useState<User[]>([
    { 
      id: '1', 
      username: 'admin', 
      password: '1234', 
      role: 'admin', 
      name: 'Administrador',
      email: 'admin@varejo.com',
      phone: '(11) 9999-9999',
      address: 'Rua Principal, 123 - São Paulo, SP',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: new Date().toISOString()
    },
    { 
      id: '2', 
      username: 'vendedor', 
      password: '1234', 
      role: 'seller', 
      name: 'Vendedor',
      email: 'vendedor@varejo.com',
      phone: '(11) 8888-8888',
      address: 'Av. Comercial, 456 - São Paulo, SP',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date().toISOString()
    },
    { 
      id: '3', 
      username: 'cliente', 
      password: '1234', 
      role: 'customer', 
      name: 'Cliente',
      email: 'cliente@email.com',
      phone: '(11) 7777-7777',
      address: 'Rua do Cliente, 789 - São Paulo, SP',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      createdAt: new Date().toISOString()
    }
  ]);

  // Imagens pré-definidas para escolha
  const profileImages = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  ];

  // Carregar produtos iniciais
  useEffect(() => {
    const initialProducts: Product[] = [
      {
        id: '1',
        name: 'Camiseta Básica',
        price: 29.90,
        description: 'Camiseta 100% algodão, diversas cores',
        category: 'Roupas',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150'
      },
      {
        id: '2',
        name: 'Tênis Esportivo',
        price: 199.90,
        description: 'Tênis para corrida, amortecimento superior',
        category: 'Calçados',
        stock: 8,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150'
      },
      {
        id: '3',
        name: 'Smartphone Android',
        price: 1299.90,
        description: '128GB, 6GB RAM, câmera tripla',
        category: 'Eletrônicos',
        stock: 5,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150'
      },
      {
        id: '4',
        name: 'Notebook Gamer',
        price: 3599.90,
        description: 'Intel i7, 16GB RAM, RTX 3050',
        category: 'Eletrônicos',
        stock: 3,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=150'
      },
      {
        id: '5',
        name: 'Fone Bluetooth',
        price: 159.90,
        description: 'Cancelamento de ruído, bateria 30h',
        category: 'Eletrônicos',
        stock: 12,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150'
      },
      {
        id: '6',
        name: 'Moletom Hoodie',
        price: 89.90,
        description: 'Moletom com capuz, algodão',
        category: 'Roupas',
        stock: 20,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=150'
      }
    ];
    setProducts(initialProducts);
  }, []);

  // Função simplificada para notificações locais
  const showLocalNotification = (title: string, message: string) => {
    Vibration.vibrate(500);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      time: new Date().toLocaleTimeString(),
      date: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    Alert.alert(title, message);
  };

  // Função para cadastro de novo usuário
  const handleRegister = () => {
    // Validações
    if (!registerData.name || !registerData.email || !registerData.username || !registerData.password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (registerData.password.length < 4) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres');
      return;
    }

    // Verificar se usuário já existe
    const userExists = users.find(user => 
      user.username === registerData.username || user.email === registerData.email
    );

    if (userExists) {
      Alert.alert('Erro', 'Usuário ou email já cadastrado');
      return;
    }

    // Criar novo usuário
    const newUser: User = {
      id: Date.now().toString(),
      name: registerData.name,
      email: registerData.email,
      username: registerData.username,
      password: registerData.password,
      phone: registerData.phone || '',
      address: registerData.address || '',
      profileImage: registerData.profileImage,
      role: 'customer', // Novo usuário sempre é cliente
      createdAt: new Date().toISOString()
    };

    // Adicionar à lista de usuários
    setUsers(prev => [...prev, newUser]);
    
    // Limpar formulário
    setRegisterData({
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    });

    // Voltar para login
    setIsRegistering(false);
    
    Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Faça login para continuar.');
  };

  // Função para editar perfil
  const handleEditProfile = () => {
    if (!editProfileData.name || !editProfileData.email) {
      Alert.alert('Erro', 'Nome e email são obrigatórios');
      return;
    }

    // Atualizar usuário
    const updatedUsers = users.map(user => 
      user.id === userInfo?.id 
        ? { ...user, ...editProfileData }
        : user
    );

    setUsers(updatedUsers);
    setUserInfo(prev => prev ? { ...prev, ...editProfileData } : null);
    setProfileModalVisible(false);
    
    showLocalNotification('✅ Perfil Atualizado', 'Seus dados foram atualizados com sucesso!');
  };

  // Função para alterar foto de perfil
  const handleChangeProfileImage = (imageUrl: string) => {
    const updatedUsers = users.map(user => 
      user.id === userInfo?.id 
        ? { ...user, profileImage: imageUrl }
        : user
    );

    setUsers(updatedUsers);
    setUserInfo(prev => prev ? { ...prev, profileImage: imageUrl } : null);
    setImageModalVisible(false);
    
    showLocalNotification('📸 Foto Atualizada', 'Sua foto de perfil foi alterada com sucesso!');
  };

  // Função para abrir modal de edição de perfil
  const openEditProfile = () => {
    setEditProfileData({
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
      address: userInfo?.address || '',
      profileImage: userInfo?.profileImage || ''
    });
    setProfileModalVisible(true);
  };

  // Função para abrir modal de seleção de imagem
  const openImageSelector = () => {
    setImageModalVisible(true);
  };

  // Função para notificação de promoção
  const sendPromotionNotification = () => {
    showLocalNotification(
      '🎉 Promoção Relâmpago!',
      'Descontos de até 50% em produtos selecionados. Corre lá!'
    );
  };

  // Animação do menu lateral
  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // Função de login
  const handleLogin = () => {
    const user = users.find(u => 
      u.username === loginData.username && u.password === loginData.password
    );
    
    if (user) {
      setIsLoggedIn(true);
      setUserInfo(user);
      
      showLocalNotification(
        '👋 Bem-vindo ao Varejo App!',
        `Olá ${user.name}, sua loja preferida está te esperando!`
      );
      
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos');
    }
  };

  // Função de logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
    setCart([]);
    setActiveScreen('products');
    setUserInfo(null);
    if (sidebarVisible) toggleSidebar();
  };

  // Navegar para uma tela
  const navigateTo = (screen: string) => {
    setActiveScreen(screen);
    toggleSidebar();
  };

  // Adicionar ao carrinho
  const addToCart = (product: Product) => {
    if (product.stock > 0) {
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          setCart(cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ));
          
          showLocalNotification(
            '🛒 Item Adicionado',
            `${product.name} foi adicionado ao carrinho!`
          );
        } else {
          Alert.alert('Estoque insuficiente', 'Quantidade máxima atingida');
        }
      } else {
        const cartItem: CartItem = {
          ...product,
          quantity: 1
        };
        setCart([...cart, cartItem]);
        
        showLocalNotification(
          '🛒 Item Adicionado',
          `${product.name} foi adicionado ao carrinho!`
        );
      }
    } else {
      Alert.alert('Produto esgotado', 'Este produto não está disponível');
    }
  };

  // Remover do carrinho
  const removeFromCart = (productId: string) => {
    const product = cart.find(item => item.id === productId);
    setCart(cart.filter(item => item.id !== productId));
    
    if (product) {
      showLocalNotification(
        '❌ Item Removido',
        `${product.name} foi removido do carrinho.`
      );
    }
  };

  // Atualizar quantidade no carrinho
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) {
      Alert.alert('Estoque insuficiente', 'Quantidade solicitada maior que o estoque disponível');
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Finalizar compra
  const checkout = async () => {
    if (cart.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos ao carrinho');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    Alert.alert(
      'Confirmar Compra',
      `Total: R$ ${total.toFixed(2)}\nDeseja finalizar a compra?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              setLoading(true);
              
              // Atualizar estoque
              const updatedProducts = products.map(product => {
                const cartItem = cart.find(item => item.id === product.id);
                if (cartItem) {
                  const newStock = product.stock - cartItem.quantity;
                  
                  // Verificar estoque baixo
                  if (newStock <= 3 && newStock > 0) {
                    showLocalNotification(
                      '⚠️ Estoque Baixo',
                      `O produto ${product.name} está com apenas ${newStock} unidades!`
                    );
                  }
                  
                  return {
                    ...product,
                    stock: newStock
                  };
                }
                return product;
              });
              
              setProducts(updatedProducts);
              setCart([]);
              
              showLocalNotification(
                '✅ Compra Realizada!',
                `Sua compra no valor de R$ ${total.toFixed(2)} foi confirmada!`
              );
              
            } catch (error) {
              console.error('Erro ao finalizar compra:', error);
              Alert.alert('Erro', 'Não foi possível finalizar a compra');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Adicionar novo produto
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
        image: newProduct.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
        createdAt: new Date().toISOString()
      };

      setProducts(prev => [...prev, product]);
      
      setNewProduct({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        image: ''
      });
      
      showLocalNotification(
        '🆕 Novo Produto Disponível!',
        `Confira o novo ${product.name} na nossa loja!`
      );
      
      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o produto');
    } finally {
      setLoading(false);
    }
  };

  // Menu items baseado no tipo de usuário
  const getMenuItems = () => {
    const baseItems = [
      { id: 'products', icon: '📦', label: 'Produtos', color: '#3498db' },
      { id: 'cart', icon: '🛒', label: `Carrinho (${cart.length})`, color: '#e74c3c' },
      { id: 'profile', icon: '👤', label: 'Meu Perfil', color: '#9b59b6' },
      { id: 'notifications', icon: '🔔', label: `Notificações (${notifications.length})`, color: '#f39c12' },
      { id: 'stats', icon: '📊', label: 'Estatísticas', color: '#2ecc71' },
    ];

    if (userInfo?.role === 'admin' || userInfo?.role === 'seller') {
      baseItems.splice(2, 0, { id: 'add', icon: '➕', label: 'Add Produto', color: '#f39c12' });
      baseItems.splice(3, 0, { id: 'inventory', icon: '📋', label: 'Estoque', color: '#1abc9c' });
      baseItems.splice(6, 0, { id: 'promotions', icon: '🎉', label: 'Promoções', color: '#e67e22' });
    }

    return baseItems;
  };

  // Limpar todas as notificações
  const clearAllNotifications = () => {
    setNotifications([]);
    Alert.alert('Sucesso', 'Todas as notificações foram limpas!');
  };

  // Tela de Login/Cadastro
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#2c3e50" />
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>🛒 Varejo App</Text>
          <Text style={styles.loginSubtitle}>
            {isRegistering ? 'Crie sua conta' : 'Faça login para continuar'}
          </Text>
          
          {isRegistering ? (
            // Formulário de Cadastro
            <ScrollView style={styles.registerForm} showsVerticalScrollIndicator={false}>
              <View style={styles.imageSelectionSection}>
                <Text style={styles.sectionLabel}>Foto de Perfil</Text>
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: registerData.profileImage }} 
                    style={styles.registerImagePreview}
                  />
                  <TouchableOpacity 
                    style={styles.changeImageButton}
                    onPress={() => {
                      // Durante o cadastro, podemos definir uma imagem padrão
                      setRegisterData({
                        ...registerData,
                        profileImage: profileImages[Math.floor(Math.random() * profileImages.length)]
                      });
                    }}
                  >
                    <Text style={styles.changeImageButtonText}>🔄</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.imageHelpText}>
                  Uma foto será escolhida aleatoriamente para você
                </Text>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Nome Completo*"
                value={registerData.name}
                onChangeText={(text) => setRegisterData({...registerData, name: text})}
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email*"
                value={registerData.email}
                onChangeText={(text) => setRegisterData({...registerData, email: text})}
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Usuário*"
                value={registerData.username}
                onChangeText={(text) => setRegisterData({...registerData, username: text})}
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                value={registerData.phone}
                onChangeText={(text) => setRegisterData({...registerData, phone: text})}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Endereço"
                value={registerData.address}
                onChangeText={(text) => setRegisterData({...registerData, address: text})}
                placeholderTextColor="#999"
                multiline
              />
              
              <TextInput
                style={styles.input}
                placeholder="Senha*"
                value={registerData.password}
                onChangeText={(text) => setRegisterData({...registerData, password: text})}
                secureTextEntry
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Confirmar Senha*"
                value={registerData.confirmPassword}
                onChangeText={(text) => setRegisterData({...registerData, confirmPassword: text})}
                secureTextEntry
                placeholderTextColor="#999"
              />
              
              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Cadastrar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.switchAuthButton}
                onPress={() => setIsRegistering(false)}
              >
                <Text style={styles.switchAuthText}>
                  Já tem uma conta? <Text style={styles.switchAuthLink}>Faça login</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            // Formulário de Login
            <>
              <TextInput
                style={styles.input}
                placeholder="Usuário"
                value={loginData.username}
                onChangeText={(text) => setLoginData({...loginData, username: text})}
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Senha"
                value={loginData.password}
                onChangeText={(text) => setLoginData({...loginData, password: text})}
                secureTextEntry
                placeholderTextColor="#999"
              />
              
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Entrar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.switchAuthButton}
                onPress={() => setIsRegistering(true)}
              >
                <Text style={styles.switchAuthText}>
                  Não tem conta? <Text style={styles.switchAuthLink}>Cadastre-se</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.loginInfo}>
                <Text style={styles.loginInfoText}>Usuários de teste:</Text>
                <Text style={styles.loginInfoText}>admin / 1234 (Administrador)</Text>
                <Text style={styles.loginInfoText}>vendedor / 1234 (Vendedor)</Text>
                <Text style={styles.loginInfoText}>cliente / 1234 (Cliente)</Text>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar conteúdo principal após login
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2c3e50" />
      
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        </View>
      )}
      
      {/* Modal de Edição de Perfil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <ScrollView style={styles.modalForm}>
              <View style={styles.imageSelectionSection}>
                <Text style={styles.sectionLabel}>Foto de Perfil</Text>
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: editProfileData.profileImage || userInfo?.profileImage }} 
                    style={styles.modalImagePreview}
                  />
                  <TouchableOpacity 
                    style={styles.changeImageButton}
                    onPress={() => {
                      setProfileModalVisible(false);
                      setTimeout(() => setImageModalVisible(true), 300);
                    }}
                  >
                    <Text style={styles.changeImageButtonText}>📸</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Nome Completo*"
                value={editProfileData.name}
                onChangeText={(text) => setEditProfileData({...editProfileData, name: text})}
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email*"
                value={editProfileData.email}
                onChangeText={(text) => setEditProfileData({...editProfileData, email: text})}
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                value={editProfileData.phone}
                onChangeText={(text) => setEditProfileData({...editProfileData, phone: text})}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Endereço"
                value={editProfileData.address}
                onChangeText={(text) => setEditProfileData({...editProfileData, address: text})}
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditProfile}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Imagem */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.imageModalContent]}>
            <Text style={styles.modalTitle}>Escolher Foto de Perfil</Text>
            
            <View style={styles.currentImageContainer}>
              <Text style={styles.currentImageText}>Foto Atual:</Text>
              <Image 
                source={{ uri: userInfo?.profileImage }} 
                style={styles.currentImage}
              />
            </View>
            
            <Text style={styles.imagesGridTitle}>Selecione uma nova foto:</Text>
            <ScrollView style={styles.imagesGridContainer}>
              <View style={styles.imagesGrid}>
                {profileImages.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.imageOption,
                      userInfo?.profileImage === imageUrl && styles.selectedImageOption
                    ]}
                    onPress={() => handleChangeProfileImage(imageUrl)}
                  >
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.imageOptionThumb}
                    />
                    {userInfo?.profileImage === imageUrl && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setImageModalVisible(false);
                  setTimeout(() => setProfileModalVisible(true), 300);
                }}
              >
                <Text style={styles.cancelButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Overlay para fechar menu */}
      {sidebarVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}

      {/* Menu Lateral */}
      <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
        <View style={styles.sidebarHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: userInfo?.profileImage }} 
              style={styles.userAvatar}
            />
            <TouchableOpacity 
              style={styles.avatarEditBadge}
              onPress={openImageSelector}
            >
              <Text style={styles.avatarEditText}>📸</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo?.name}</Text>
            <Text style={styles.userRole}>
              {userInfo?.role === 'admin' ? 'Administrador' : 
               userInfo?.role === 'seller' ? 'Vendedor' : 'Cliente'}
            </Text>
            <Text style={styles.userEmail}>{userInfo?.email}</Text>
          </View>
        </View>

        <ScrollView style={styles.menuItems}>
          {getMenuItems().map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                activeScreen === item.id && styles.activeMenuItem
              ]}
              onPress={() => navigateTo(item.id)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.logoutMenuItem} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutLabel}>Sair</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Header Principal */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>☰</Text>
          {notifications.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notifications.length > 9 ? '9+' : notifications.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>🛒 Varejo App</Text>
        
        <TouchableOpacity onPress={() => navigateTo('cart')} style={styles.cartHeaderButton}>
          <Text style={styles.cartIcon}>🛒</Text>
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        {/* Tela de Produtos */}
        {activeScreen === 'products' && (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>Nossos Produtos</Text>
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>📦</Text>
                <Text style={styles.emptyStateTitle}>Nenhum produto encontrado</Text>
                <Text style={styles.emptyStateSubtitle}>
                  {userInfo?.role === 'admin' || userInfo?.role === 'seller' 
                    ? 'Adicione o primeiro produto!' 
                    : 'Volte mais tarde!'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.productCard}>
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productDescription}>{item.description}</Text>
                      <Text style={styles.productCategory}>Categoria: {item.category}</Text>
                      <View style={styles.productFooter}>
                        <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
                        <Text style={styles.productStock}>Estoque: {item.stock}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[
                          styles.addButton, 
                          item.stock === 0 && styles.disabledButton
                        ]}
                        onPress={() => addToCart(item)}
                        disabled={item.stock === 0}
                      >
                        <Text style={styles.addButtonText}>
                          {item.stock === 0 ? 'Esgotado' : 'Adicionar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Tela do Carrinho */}
        {activeScreen === 'cart' && (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>Meu Carrinho</Text>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartText}>🛒</Text>
                <Text style={styles.emptyCartText}>Carrinho vazio</Text>
                <Text style={styles.emptyCartSubtext}>Adicione produtos para continuar</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cart}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <Image source={{ uri: item.image }} style={styles.cartImage} />
                      <View style={styles.cartInfo}>
                        <Text style={styles.cartName}>{item.name}</Text>
                        <Text style={styles.cartPrice}>R$ {item.price.toFixed(2)}</Text>
                        <View style={styles.quantityContainer}>
                          <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Text style={styles.quantityButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.cartSubtotal}>
                          Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Text style={styles.removeButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <View style={styles.cartTotal}>
                  <Text style={styles.totalText}>
                    Total: R$ {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.checkoutButton} 
                    onPress={checkout}
                    disabled={loading}
                  >
                    <Text style={styles.checkoutButtonText}>
                      {loading ? 'Processando...' : 'Finalizar Compra'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* Tela de Adicionar Produto */}
        {activeScreen === 'add' && (
          <ScrollView style={styles.screen}>
            <Text style={styles.screenTitle}>Adicionar Produto</Text>
            <View style={styles.form}>
              <TextInput
                style={styles.formInput}
                placeholder="Nome do Produto*"
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({...newProduct, name: text})}
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Preço*"
                value={newProduct.price}
                onChangeText={(text) => setNewProduct({...newProduct, price: text})}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Descrição"
                value={newProduct.description}
                onChangeText={(text) => setNewProduct({...newProduct, description: text})}
                placeholderTextColor="#999"
                multiline
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Categoria*"
                value={newProduct.category}
                onChangeText={(text) => setNewProduct({...newProduct, category: text})}
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="Estoque"
                value={newProduct.stock}
                onChangeText={(text) => setNewProduct({...newProduct, stock: text})}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.formInput}
                placeholder="URL da Imagem"
                value={newProduct.image}
                onChangeText={(text) => setNewProduct({...newProduct, image: text})}
                placeholderTextColor="#999"
              />
              
              <TouchableOpacity 
                style={styles.addProductButton} 
                onPress={addProduct}
                disabled={loading}
              >
                <Text style={styles.addProductButtonText}>
                  {loading ? 'Adicionando...' : 'Adicionar Produto'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Tela de Perfil */}
        {activeScreen === 'profile' && (
          <ScrollView style={styles.screen}>
            <Text style={styles.screenTitle}>Meu Perfil</Text>
            
            <View style={styles.profileCard}>
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: userInfo?.profileImage }} 
                  style={styles.profileImage}
                />
                <TouchableOpacity 
                  style={styles.profileImageEditButton}
                  onPress={openImageSelector}
                >
                  <Text style={styles.profileImageEditText}>📸</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.profileName}>{userInfo?.name}</Text>
              <Text style={styles.profileEmail}>{userInfo?.email}</Text>
              <Text style={styles.profileRole}>
                {userInfo?.role === 'admin' ? 'Administrador' : 
                 userInfo?.role === 'seller' ? 'Vendedor' : 'Cliente'}
              </Text>
              
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={openEditProfile}
              >
                <Text style={styles.editProfileButtonText}>✏️ Editar Perfil</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfoCard}>
              <Text style={styles.profileSectionTitle}>Informações Pessoais</Text>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoValue}>
                  {userInfo?.phone || 'Não informado'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Endereço:</Text>
                <Text style={styles.infoValue}>
                  {userInfo?.address || 'Não informado'}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Usuário:</Text>
                <Text style={styles.infoValue}>{userInfo?.username}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Membro desde:</Text>
                <Text style={styles.infoValue}>
                  {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Minhas Estatísticas</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{cart.length}</Text>
                  <Text style={styles.statLabel}>No Carrinho</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{notifications.length}</Text>
                  <Text style={styles.statLabel}>Notificações</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {products.reduce((sum, product) => sum + product.stock, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Produtos Total</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Tela de Notificações */}
        {activeScreen === 'notifications' && (
          <View style={styles.screen}>
            <View style={styles.notificationsHeader}>
              <Text style={styles.screenTitle}>Notificações</Text>
              {notifications.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={clearAllNotifications}>
                  <Text style={styles.clearButtonText}>Limpar Todas</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Text style={styles.emptyNotificationsIcon}>🔔</Text>
                <Text style={styles.emptyNotificationsText}>Nenhuma notificação</Text>
                <Text style={styles.emptyNotificationsSubtext}>
                  Suas notificações aparecerão aqui
                </Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.notificationItem}>
                    <Text style={styles.notificationTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.notificationBody}>
                      {item.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {item.time}
                    </Text>
                  </View>
                )}
              />
            )}
            
            {/* Botão de teste para administradores */}
            {(userInfo?.role === 'admin' || userInfo?.role === 'seller') && (
              <TouchableOpacity 
                style={styles.testNotificationButton}
                onPress={sendPromotionNotification}
              >
                <Text style={styles.testNotificationButtonText}>
                  🎉 Testar Notificação de Promoção
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tela de Promoções (apenas admin/vendedor) */}
        {activeScreen === 'promotions' && (
          <ScrollView style={styles.screen}>
            <Text style={styles.screenTitle}>Gerenciar Promoções</Text>
            
            <View style={styles.promotionCard}>
              <Text style={styles.promotionTitle}>🎊 Notificações de Marketing</Text>
              <Text style={styles.promotionDescription}>
                Envie notificações promocionais para todos os usuários do app.
              </Text>
              
              <TouchableOpacity 
                style={styles.promotionButton}
                onPress={sendPromotionNotification}
              >
                <Text style={styles.promotionButtonText}>
                  Enviar Promoção Relâmpago
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.promotionButton, styles.secondaryButton]}
                onPress={() => showLocalNotification(
                  '🚚 Frete Grátis!',
                  'Aproveite frete grátis em compras acima de R$ 100,00!'
                )}
              >
                <Text style={styles.promotionButtonText}>
                  Oferecer Frete Grátis
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.promotionButton, styles.warningButton]}
                onPress={() => showLocalNotification(
                  '⏰ Oferta por Tempo Limitado!',
                  'Últimas unidades com preços especiais! Corre que está acabando!'
                )}
              >
                <Text style={styles.promotionButtonText}>
                  Oferta por Tempo Limitado
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.notificationStats}>
              <Text style={styles.statsTitleSection}>Estatísticas de Notificações</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxNumber}>{notifications.length}</Text>
                  <Text style={styles.statBoxLabel}>Recebidas</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxNumber}>{cart.length}</Text>
                  <Text style={styles.statBoxLabel}>No Carrinho</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxNumber}>
                    {products.filter(p => p.stock < 5).length}
                  </Text>
                  <Text style={styles.statBoxLabel}>Estoque Baixo</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Tela de Estatísticas */}
        {activeScreen === 'stats' && (
          <ScrollView style={styles.screen}>
            <Text style={styles.screenTitle}>Estatísticas</Text>
            <View style={styles.statsCard}>
              <Text style={styles.statsCardTitle}>📊 Resumo da Loja</Text>
              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Total de Produtos:</Text>
                <Text style={styles.statRowValue}>{products.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Valor Total em Estoque:</Text>
                <Text style={styles.statRowValue}>
                  R$ {products.reduce((sum, product) => sum + (product.price * product.stock), 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Produtos no Carrinho:</Text>
                <Text style={styles.statRowValue}>{cart.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statRowLabel}>Notificações Recebidas:</Text>
                <Text style={styles.statRowValue}>{notifications.length}</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Tela de Estoque */}
        {activeScreen === 'inventory' && (
          <View style={styles.screen}>
            <Text style={styles.screenTitle}>Controle de Estoque</Text>
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>📋</Text>
                <Text style={styles.emptyStateTitle}>Nenhum produto em estoque</Text>
                <Text style={styles.emptyStateSubtitle}>Adicione produtos para ver o estoque</Text>
              </View>
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.inventoryItem}>
                    <Image source={{ uri: item.image }} style={styles.inventoryImage} />
                    <View style={styles.inventoryInfo}>
                      <Text style={styles.inventoryName}>{item.name}</Text>
                      <Text style={styles.inventoryPrice}>R$ {item.price.toFixed(2)}</Text>
                      <View style={[
                        styles.stockIndicator,
                        item.stock < 5 ? styles.lowStock : styles.normalStock
                      ]}>
                        <Text style={styles.stockText}>
                          Estoque: {item.stock} {item.stock < 5 && '⚠️'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Loading styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  imageModalContent: {
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalForm: {
    maxHeight: 400,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Image Selection Styles
  imageSelectionSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  registerImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  modalImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    backgroundColor: '#3498db',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  changeImageButtonText: {
    color: 'white',
    fontSize: 14,
  },
  imageHelpText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  currentImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentImageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  currentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  imagesGridContainer: {
    maxHeight: 300,
  },
  imagesGridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageOption: {
    width: '30%',
    marginBottom: 15,
    borderRadius: 10,
    padding: 5,
  },
  selectedImageOption: {
    backgroundColor: '#d5f4e6',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  imageOptionThumb: {
    width: '100%',
    height: 80,
    borderRadius: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#27ae60',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Avatar Container
  avatarContainer: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  avatarEditText: {
    color: 'white',
    fontSize: 12,
  },
  // Profile Image Container
  profileImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  profileImageEditButton: {
    position: 'absolute',
    bottom: 5,
    right: '40%',
    backgroundColor: '#3498db',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImageEditText: {
    color: 'white',
    fontSize: 16,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  // Estilos do Login e Cadastro
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  registerForm: {
    width: '100%',
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#27ae60',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchAuthButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchAuthText: {
    color: '#bdc3c7',
    fontSize: 14,
  },
  switchAuthLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  loginInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  loginInfoText: {
    color: '#bdc3c7',
    fontSize: 14,
    marginBottom: 5,
  },
  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  // Menu Lateral
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#2c3e50',
    zIndex: 999,
    paddingTop: 60,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 12,
    color: '#95a5a6',
  },
  menuItems: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  activeMenuItem: {
    backgroundColor: '#34495e',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
  },
  menuLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#34495e',
    marginTop: 'auto',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  logoutLabel: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  // Header Principal
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 10,
  },
  menuButton: {
    padding: 8,
    position: 'relative',
  },
  menuButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cartHeaderButton: {
    padding: 8,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 20,
    color: 'white',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Conteúdo Principal
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: 15,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Estilos do Perfil
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  profileRole: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  editProfileButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileInfoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#7f8c8d',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  // Estilos das Notificações
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyNotificationsIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyNotificationsText: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptyNotificationsSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'right',
  },
  testNotificationButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  testNotificationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos das Promoções
  promotionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    lineHeight: 20,
  },
  promotionButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#3498db',
  },
  warningButton: {
    backgroundColor: '#f39c12',
  },
  promotionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationStats: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitleSection: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  // Estilos dos Produtos
  productCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  productStock: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Estilos do Carrinho
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyCartSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  cartInfo: {
    flex: 1,
  },
  cartName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cartPrice: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 3,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  quantityButton: {
    backgroundColor: '#ecf0f1',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 10,
  },
  cartSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
  },
  cartTotal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  checkoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos do Formulário
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  addProductButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos das Estatísticas
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  statRowLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  // Estilos do Estoque
  inventoryItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  inventoryPrice: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 5,
  },
  stockIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  normalStock: {
    backgroundColor: '#d5f4e6',
  },
  lowStock: {
    backgroundColor: '#ffeaa7',
  },
  stockText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});