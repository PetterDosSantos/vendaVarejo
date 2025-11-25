// App.js
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

// Import Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, where } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  // Estados da aplicação
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [activeScreen, setActiveScreen] = useState('products');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: ''
  });
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Animação do menu lateral
  const slideAnim = useState(new Animated.Value(-300))[0];

  // Dados de usuários
  const users = [
    { username: 'admin', password: '1234', role: 'admin', name: 'Administrador' },
    { username: 'vendedor', password: '1234', role: 'seller', name: 'Vendedor' },
    { username: 'cliente', password: '1234', role: 'customer', name: 'Cliente' }
  ];

  // Carregar produtos do Firebase
  useEffect(() => {
    loadProductsFromFirebase();
  }, []);

  // Função para carregar produtos do Firebase
  const loadProductsFromFirebase = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData: ((prevState: never[]) => never[]) | { id: string; }[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  };

  // Ouvir mudanças em tempo real nos produtos
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: ((prevState: never[]) => never[]) | { id: string; }[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    });

    return () => unsubscribe();
  }, []);

  // Função simplificada para notificações locais
  const showLocalNotification = (title: string, message: string | undefined) => {
    Vibration.vibrate(500);
    
    const newNotification = {
      id: Date.now().toString(),
      title,
      message,
      time: new Date().toLocaleTimeString(),
      date: new Date()
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    Alert.alert(title, message);
  };

  // Salvar carrinho no Firebase
  const saveCartToFirebase = async (userId: any, cartData: never[], total: number) => {
    try {
      const saleData = {
        userId,
        items: cartData,
        total,
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      await addDoc(collection(db, 'sales'), saleData);
      console.log('Venda salva no Firebase');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
    }
  };

  // Adicionar produto ao Firebase
  const addProductToFirebase = async (product: { name: string; price: number; description: string; category: string; stock: number; image: string; createdAt: string; }) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), product);
      console.log('Produto adicionado com ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  };

  // Atualizar produto no Firebase
  const updateProductInFirebase = async (productId: string, updatedData: { stock: number; }) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, updatedData);
      console.log('Produto atualizado:', productId);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
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
  const navigateTo = (screen: React.SetStateAction<string>) => {
    setActiveScreen(screen);
    toggleSidebar();
  };

  // Adicionar ao carrinho
  const addToCart = (product) => {
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
        setCart([...cart, { ...product, quantity: 1 }]);
        
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
  const removeFromCart = (productId) => {
    const product = cart.find(item => item.id === productId);
    setCart(cart.filter(item => item.id !== productId));
    
    if (product) {
      showLocalNotification(
        '❌ Item Removido',
        `${product.name} foi removido do carrinho.`
      );
    }
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
              
              // Atualizar estoque no Firebase
              const updatePromises = cart.map(async (cartItem) => {
                const product = products.find(p => p.id === cartItem.id);
                if (product) {
                  const newStock = product.stock - cartItem.quantity;
                  await updateProductInFirebase(product.id, { stock: newStock });
                }
              });
              
              await Promise.all(updatePromises);
              
              // Salvar venda no Firebase
              await saveCartToFirebase(userInfo?.username, cart, total);
              
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
      
      const product = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
        image: newProduct.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
        createdAt: new Date().toISOString()
      };

      await addProductToFirebase(product);
      
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

  // Tela de Login
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#2c3e50" />
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>🛒 Varejo App</Text>
          <Text style={styles.loginSubtitle}>Faça login para continuar</Text>
          
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

          <View style={styles.loginInfo}>
            <Text style={styles.loginInfoText}>Usuários de teste:</Text>
            <Text style={styles.loginInfoText}>admin / 1234 (Administrador)</Text>
            <Text style={styles.loginInfoText}>vendedor / 1234 (Vendedor)</Text>
            <Text style={styles.loginInfoText}>cliente / 1234 (Cliente)</Text>
          </View>
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
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo?.name}</Text>
            <Text style={styles.userRole}>
              {userInfo?.role === 'admin' ? 'Administrador' : 
               userInfo?.role === 'seller' ? 'Vendedor' : 'Cliente'}
            </Text>
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
        
        <Text style={styles.headerTitle}>🛒 Varejo App + Firebase</Text>
        
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
                        <Text style={styles.productPrice}>R$ {item.price?.toFixed(2)}</Text>
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
                        <Text style={styles.cartPrice}>R$ {item.price?.toFixed(2)}</Text>
                        <Text style={styles.cartQuantity}>Qtd: {item.quantity}</Text>
                        <Text style={styles.cartSubtotal}>
                          Subtotal: R$ {((item.price || 0) * item.quantity).toFixed(2)}
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
                    Total: R$ {cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0).toFixed(2)}
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
              <Text style={styles.statsTitle}>Estatísticas de Notificações</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{notifications.length}</Text>
                  <Text style={styles.statLabel}>Recebidas</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{cart.length}</Text>
                  <Text style={styles.statLabel}>No Carrinho</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {products.filter(p => p.stock < 5).length}
                  </Text>
                  <Text style={styles.statLabel}>Estoque Baixo</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Tela de Perfil */}
        {activeScreen === 'profile' && (
          <ScrollView style={styles.screen}>
            <Text style={styles.screenTitle}>Meu Perfil</Text>
            <View style={styles.profileCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' }}
                style={styles.profileImage}
              />
              <Text style={styles.profileName}>{userInfo?.name}</Text>
              <Text style={styles.profileRole}>
                {userInfo?.role === 'admin' ? 'Administrador' : 
                 userInfo?.role === 'seller' ? 'Vendedor' : 'Cliente'}
              </Text>
              <View style={styles.statsContainer}>
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
                    {products.reduce((sum, product) => sum + (product.stock || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>Produtos Total</Text>
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
              <Text style={styles.statsTitle}>📊 Resumo da Loja</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total de Produtos:</Text>
                <Text style={styles.statValue}>{products.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Valor Total em Estoque:</Text>
                <Text style={styles.statValue}>
                  R$ {products.reduce((sum, product) => sum + ((product.price || 0) * (product.stock || 0)), 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Produtos no Carrinho:</Text>
                <Text style={styles.statValue}>{cart.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Notificações Recebidas:</Text>
                <Text style={styles.statValue}>{notifications.length}</Text>
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
                      <Text style={styles.inventoryPrice}>R$ {item.price?.toFixed(2)}</Text>
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
  // ... (mantenha todos os outros estilos do código anterior)
  // Estilos do Login
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
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
  loginButtonText: {
    color: 'white',
    fontSize: 18,
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statLabel: {
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
  cartQuantity: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 3,
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
  profileRole: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
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
  statsTitle: {
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
  statLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  statValue: {
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