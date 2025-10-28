import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Search, Moon, Sun, Menu, X, TrendingUp, Newspaper, Calendar, ExternalLink, RefreshCw, AlertCircle, Home, Bookmark, Bell, User, Share2, Heart, MessageCircle, Clock, Filter, ChevronRight, Star, Globe, Zap, Award, Eye, Download, Settings, LogIn, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Play, Pause, Volume2, VolumeX, Maximize2, ArrowUp, BarChart3, Sparkles, CheckCircle, History } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : ''}>{children}</div>
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// User Context
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [readingHistory, setReadingHistory] = useState(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedArticles, setLikedArticles] = useState(() => {
    const saved = localStorage.getItem('liked');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(readingHistory));
  }, [readingHistory]);

  useEffect(() => {
    localStorage.setItem('liked', JSON.stringify(likedArticles));
  }, [likedArticles]);

  const login = (email) => {
    setUser({ email, name: email.split('@')[0], joined: new Date().toISOString() });
  };

  const logout = () => {
    setUser(null);
  };

  const addBookmark = (article) => {
    setBookmarks(prev => {
      if (prev.find(b => b.title === article.title)) return prev;
      return [...prev, { ...article, bookmarkedAt: new Date().toISOString() }];
    });
  };

  const removeBookmark = (title) => {
    setBookmarks(prev => prev.filter(b => b.title !== title));
  };

  const isBookmarked = (title) => {
    return bookmarks.some(b => b.title === title);
  };

  const addToHistory = (article) => {
    setReadingHistory(prev => {
      const filtered = prev.filter(h => h.title !== article.title);
      return [{ ...article, readAt: new Date().toISOString() }, ...filtered].slice(0, 50);
    });
  };

  const toggleLike = (title) => {
    setLikedArticles(prev => {
      if (prev.includes(title)) {
        return prev.filter(t => t !== title);
      } else {
        return [...prev, title];
      }
    });
  };

  const isLiked = (title) => {
    return likedArticles.includes(title);
  };

  return (
    <UserContext.Provider value={{ 
      user, login, logout, 
      bookmarks, addBookmark, removeBookmark, isBookmarked,
      readingHistory, addToHistory,
      toggleLike, isLiked
    }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);

// News API Configuration - ADD YOUR API KEY HERE
const NEWS_API_CONFIG = {
  // Option 1: NewsAPI.org (https://newsapi.org/)
  newsApiKey: '41fbe05480ff4b78a279768c231879c0',
  newsApiUrl: 'https://newsapi.org/v2',
  
  // Option 2: GNews.io (https://gnews.io/)
  gNewsApiKey: '4ef9f932e7a627a86ded2730b9366587',
  gNewsApiUrl: 'https://gnews.io/api/v4',
  
  // Current API selection: 'newsapi' or 'gnews'
  //activeApi: 'newsapi' 
  activeApi: 'gnews'// Change to 'gnews' to use GNews API
};

// Fetch Live News Function
const fetchLiveNews = async (category = 'general', searchQuery = '', page = 1) => {
  const { activeApi, newsApiKey, newsApiUrl, gNewsApiKey, gNewsApiUrl } = NEWS_API_CONFIG;
  
  try {
    if (activeApi === 'newsapi') {
      // NewsAPI.org Implementation
      let url;
      if (searchQuery) {
        url = `${newsApiUrl}/everything?q=${encodeURIComponent(searchQuery)}&page=${page}&pageSize=12&apiKey=${newsApiKey}&language=en&sortBy=publishedAt`;
      } else {
        const newsApiCategory = category === 'general' ? 'general' : category.toLowerCase();
        url = `${newsApiUrl}/top-headlines?category=${newsApiCategory}&country=us&page=${page}&pageSize=12&apiKey=${newsApiKey}`;
      }
      
     // const response = await fetch(url);
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
const response = await fetch(proxyUrl + encodeURIComponent(url));
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch from NewsAPI');
      }
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return {
        articles: data.articles.map((article, index) => ({
          id: `newsapi-${page}-${index}-${Date.now()}`,
          title: article.title || 'No title',
          description: article.description || 'No description available',
          content: article.content || article.description || 'Read full article at source',
          image: article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          url: article.url,
          source: { name: article.source.name || 'Unknown Source' },
          author: article.author || 'Unknown Author',
          publishedAt: article.publishedAt,
          category: category,
          views: Math.floor(Math.random() * 100000) + 1000,
          likes: Math.floor(Math.random() * 5000) + 100,
          comments: Math.floor(Math.random() * 500) + 10,
          readTime: Math.floor(Math.random() * 10) + 3,
          featured: index === 0 && page === 1,
          trending: index < 6 && page === 1
        })),
        totalResults: data.totalResults || 0
      };
      
    } else if (activeApi === 'gnews') {
      // GNews.io Implementation
      let url;
      if (searchQuery) {
        url = `${gNewsApiUrl}/search?q=${encodeURIComponent(searchQuery)}&lang=en&max=12&page=${page}&apikey=${gNewsApiKey}`;
      } else {
        const gNewsCategory = category === 'general' ? 'general' : category.toLowerCase();
        url = `${gNewsApiUrl}/top-headlines?category=${gNewsCategory}&lang=en&max=12&page=${page}&apikey=${gNewsApiKey}`;
      }
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
const response = await fetch(proxyUrl + encodeURIComponent(url));
     // const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch from GNews');
      }
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]);
      }
      
      return {
        articles: data.articles.map((article, index) => ({
          id: `gnews-${page}-${index}-${Date.now()}`,
          title: article.title || 'No title',
          description: article.description || 'No description available',
          content: article.content || article.description || 'Read full article at source',
          image: article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
          url: article.url,
          source: { name: article.source.name || 'Unknown Source' },
          author: article.source.name || 'Unknown Author',
          publishedAt: article.publishedAt,
          category: category,
          views: Math.floor(Math.random() * 100000) + 1000,
          likes: Math.floor(Math.random() * 5000) + 100,
          comments: Math.floor(Math.random() * 500) + 10,
          readTime: Math.floor(Math.random() * 10) + 3,
          featured: index === 0 && page === 1,
          trending: index < 6 && page === 1
        })),
        totalResults: data.totalArticles || 100
      };
    }
    
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Static News Data (Fallback)
const generateStaticNews = () => {
  const categories = ['Technology', 'Business', 'Sports', 'Health', 'Science', 'Entertainment', 'Politics'];
  const sources = ['TechCrunch', 'BBC News', 'Reuters', 'CNN', 'The Guardian', 'Forbes', 'Bloomberg', 'The Verge'];
  const authors = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emma Davis', 'Alex Kumar', 'Lisa Wong'];
  
  const articles = [];
  
  for (let i = 0; i < 50; i++) {
    const randomCategory = categories[i % categories.length];
    const randomSource = sources[i % sources.length];
    const randomAuthor = authors[i % authors.length];
    const views = Math.floor(Math.random() * 100000) + 1000;
    const likes = Math.floor(Math.random() * 5000) + 100;
    const comments = Math.floor(Math.random() * 500) + 10;
    
    articles.push({
      id: i,
      title: `${randomCategory} Breaking: Major Development in ${randomCategory} Industry Reshapes Future ${i + 1}`,
      description: `Comprehensive analysis of the latest developments in ${randomCategory}. Industry experts weigh in on groundbreaking changes that could reshape the future. This exclusive report covers all angles with in-depth research and real-world implications.`,
      content: `Full detailed content about ${randomCategory} with comprehensive coverage. This article provides deep insights into the topic with expert opinions, statistical analysis, and future predictions. Industry leaders share their perspectives on what these changes mean for the future.`,
      image: `https://picsum.photos/seed/${randomCategory}${i}/1200/800`,
      url: 'https://example.com/article',
      source: { name: randomSource },
      author: randomAuthor,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: randomCategory,
      views,
      likes,
      comments,
      readTime: Math.floor(Math.random() * 10) + 3,
      featured: i === 0,
      trending: i < 6
    });
  }
  
  return articles;
};

const STATIC_NEWS = generateStaticNews();
// Static Navbar
const Navbar = ({ onSearch, currentView, setCurrentView }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, bookmarks } = useUser();
  const [searchInput, setSearchInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    if (searchInput.trim()) {
      onSearch(searchInput);
      setCurrentView('home');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const notifications = [
    { id: 1, text: 'New article in Technology', time: '2m ago', unread: true },
    { id: 2, text: 'Breaking news alert!', time: '15m ago', unread: true },
    { id: 3, text: 'Your bookmark was updated', time: '1h ago', unread: false }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white dark:bg-gray-900 shadow-lg' 
        : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-900 dark:via-pink-900 dark:to-red-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            onClick={() => { setCurrentView('home'); setShowMobileMenu(false); }}
            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
          >
            <Newspaper className={`w-8 h-8 ${isScrolled ? 'text-purple-600 dark:text-purple-400' : 'text-white'}`} />
            <div className="hidden sm:block">
              <span className={`text-xl font-black ${isScrolled ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : 'text-white'}`}>
                NewsFeedly
              </span>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search news..."
                className={`w-full px-4 py-2 pl-10 pr-20 rounded-full transition-all text-sm ${
                  isScrolled
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                    : 'bg-white/20 backdrop-blur-md text-white placeholder-white/70'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <Search 
                className={`absolute left-3 top-2.5 w-4 h-4 ${isScrolled ? 'text-gray-400' : 'text-white/70'}`}
              />
              <button
                onClick={handleSearch}
                className="absolute right-1 top-1 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold hover:bg-purple-700 transition-colors"
              >
                Go
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            <NavButton 
              icon={Home} 
              isScrolled={isScrolled}
              active={currentView === 'home'}
              onClick={() => setCurrentView('home')}
            />
            <NavButton 
              icon={TrendingUp} 
              isScrolled={isScrolled}
              active={currentView === 'trending'}
              onClick={() => setCurrentView('trending')}
            />
            <NavButton 
              icon={Bookmark} 
              isScrolled={isScrolled}
              active={currentView === 'bookmarks'}
              onClick={() => setCurrentView('bookmarks')}
              badge={bookmarks.length}
            />
            <NavButton 
              icon={History} 
              isScrolled={isScrolled}
              active={currentView === 'history'}
              onClick={() => setCurrentView('history')}
            />
            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-full transition-all ${
                  isScrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300' : 'hover:bg-white/20 text-white'
                }`}
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                    Notifications
                  </div>
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                        </div>
                        {notif.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all ${isScrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300' : 'hover:bg-white/20 text-white'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  isScrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-white/20 bg-white/10'
                }`}
              >
                <User className={`w-5 h-5 ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`} />
                {user && <span className={`text-sm font-medium ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}>{user.name}</span>}
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                  {user ? (
                    <>
                      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-white/80">{user.email}</p>
                      </div>
                      <button onClick={() => { setCurrentView('profile'); setShowUserMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                        <User className="w-4 h-4" /><span>My Profile</span>
                      </button>
                      <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center space-x-2">
                        <LogIn className="w-4 h-4" /><span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setCurrentView('login'); setShowUserMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <LogIn className="w-4 h-4" /><span>Sign In</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}>
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="md:hidden pb-4">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search news..."
              className="w-full px-4 py-2 pl-10 rounded-full bg-white/20 backdrop-blur-md text-white placeholder-white/70 border-2 border-white/30 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-white/70 cursor-pointer" onClick={handleSearch} />
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/20">
            <div className="space-y-2">
              <MobileNavButton icon={Home} label="Home" onClick={() => { setCurrentView('home'); setShowMobileMenu(false); }} active={currentView === 'home'} />
              <MobileNavButton icon={TrendingUp} label="Trending" onClick={() => { setCurrentView('trending'); setShowMobileMenu(false); }} active={currentView === 'trending'} />
              <MobileNavButton icon={Bookmark} label={`Saved (${bookmarks.length})`} onClick={() => { setCurrentView('bookmarks'); setShowMobileMenu(false); }} active={currentView === 'bookmarks'} />
              <MobileNavButton icon={History} label="History" onClick={() => { setCurrentView('history'); setShowMobileMenu(false); }} active={currentView === 'history'} />
              <MobileNavButton icon={isDark ? Sun : Moon} label={isDark ? 'Light Mode' : 'Dark Mode'} onClick={() => { toggleTheme(); setShowMobileMenu(false); }} />
              {user ? (
                <MobileNavButton icon={LogIn} label="Logout" onClick={() => { logout(); setShowMobileMenu(false); }} />
              ) : (
                <MobileNavButton icon={LogIn} label="Sign In" onClick={() => { setCurrentView('login'); setShowMobileMenu(false); }} />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const MobileNavButton = ({ icon: Icon, label, onClick, active }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-white/30 text-white font-semibold' : 'text-white/80 hover:bg-white/20'}`}>
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const NavButton = ({ icon: Icon, label, isScrolled, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
    active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : isScrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300' : 'hover:bg-white/20 text-white'
  }`}>
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Hero Section
const HeroSection = () => {
  return (
    <div className="relative h-[400px] bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 dark:from-purple-900 dark:via-pink-900 dark:to-red-900">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-white">
          <h1 className="text-5xl md:text-6xl font-black mb-3">
            Stay Updated.<br />Stay Informed.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl">
            Get the latest breaking news, trending stories, and in-depth analysis from around the world.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-xl transition-shadow flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Explore Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// Category Filter
const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'general', name: 'All News' },
    { id: 'Technology', name: 'Technology' },
    { id: 'Business', name: 'Business' },
    { id: 'Sports', name: 'Sports' },
    { id: 'Health', name: 'Health' },
    { id: 'Science', name: 'Science' },
    { id: 'Entertainment', name: 'Entertainment' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-20 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex space-x-3 overflow-x-auto">
          {categories.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => onCategoryChange(id)}
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                activeCategory === id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// News Card
const NewsCard = ({ article, onClick, featured = false }) => {
  const { addBookmark, removeBookmark, isBookmarked, toggleLike, isLiked } = useUser();
  const bookmarked = isBookmarked(article.title);
  const liked = isLiked(article.title);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLike(article.title);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (bookmarked) {
      removeBookmark(article.title);
    } else {
      addBookmark(article);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: article.title, url: article.url });
    } else {
      alert('Share: ' + article.title);
    }
  };

  if (featured) {
    return (
      <article onClick={onClick} className="relative col-span-full h-[500px] rounded-3xl overflow-hidden cursor-pointer">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://picsum.photos/1200/800'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-4 py-1.5 bg-red-600 text-white text-sm font-bold rounded-full flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>FEATURED</span>
            </span>
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-full">
              {article.category}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 line-clamp-2">
            {article.title}
          </h2>
          
          <p className="text-lg text-white/90 mb-6 line-clamp-2 max-w-3xl">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>{article.readTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{(article.views / 1000).toFixed(1)}K views</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button onClick={handleLike} className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md transition-all ${liked ? 'bg-pink-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="font-semibold">{article.likes + (liked ? 1 : 0)}</span>
              </button>
              <button onClick={handleBookmark} className={`p-2 rounded-full backdrop-blur-md ${bookmarked ? 'bg-purple-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
              <button onClick={handleShare} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article onClick={onClick} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden">
      <div className="relative h-56 overflow-hidden">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://picsum.photos/800/600'; }} />
        <div className="absolute top-3 left-3 flex space-x-2">
          <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
            {article.source.name}
          </span>
          {article.trending && (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </span>
          )}
        </div>
        <button onClick={handleBookmark} className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:scale-110 transition-transform">
          <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-pink-600 text-pink-600' : 'text-gray-600 dark:text-gray-400'}`} />
        </button>
      </div>
      
      <div className="p-5">
        <div className="flex items-center space-x-2 mb-3">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full">
            {article.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {article.readTime} min
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {article.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{(article.views / 1000).toFixed(1)}K</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button onClick={handleLike} className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-pink-600 transition-colors">
              <Heart className={`w-4 h-4 ${liked ? 'fill-pink-600 text-pink-600' : ''}`} />
              <span>{article.likes + (liked ? 1 : 0)}</span>
            </button>
            <button onClick={handleShare} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

// Article Modal
const ArticleModal = ({ article, onClose }) => {
  const { addToHistory } = useUser();

  useEffect(() => {
    if (article) {
      addToHistory(article);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [article, addToHistory]);

  if (!article) return null;

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="relative h-96">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://picsum.photos/1200/600'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all">
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full">
                {article.source.name}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-full">
                {article.category}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{formatFullDate(article.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center space-x-6 mb-8 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span className="font-semibold">{article.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">{article.likes.toLocaleString()} likes</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{article.comments} comments</span>
            </div>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              {article.description}
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-6">
              {article.content}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg transition-shadow">
              <span>Read Full Article</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bookmarks View
const BookmarksView = () => {
  const { bookmarks } = useUser();
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 flex items-center">
          <Bookmark className="w-10 h-10 text-purple-600 mr-3" />
          Saved Articles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {bookmarks.length} articles saved for later
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No saved articles yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Start bookmarking articles to read them later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((article, index) => (
            <NewsCard key={index} article={article} onClick={() => setSelectedArticle(article)} />
          ))}
        </div>
      )}

      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  );
};


// History View
const HistoryView = () => {
  const { readingHistory } = useUser();
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 flex items-center">
          <History className="w-10 h-10 text-blue-600 mr-3" />
          Reading History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {readingHistory.length} articles read
        </p>
      </div>

      {readingHistory.length === 0 ? (
        <div className="text-center py-20">
          <History className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No reading history</h3>
          <p className="text-gray-600 dark:text-gray-400">Articles you read will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readingHistory.map((article, index) => (
            <NewsCard key={index} article={article} onClick={() => setSelectedArticle(article)} />
          ))}
        </div>
      )}

      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  );
};

// Trending View
const TrendingView = () => {
  const trendingArticles = STATIC_NEWS.filter(a => a.trending);
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 flex items-center">
          <TrendingUp className="w-10 h-10 text-pink-600 mr-3" />
          Trending Now
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Most popular stories of the day</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingArticles.map((article, index) => (
          <NewsCard key={index} article={article} onClick={() => setSelectedArticle(article)} />
        ))}
      </div>

      {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </div>
  );
};

// Login View
const LoginView = ({ onBack }) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (email && password) {
      login(email);
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
            <Newspaper className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Welcome Back!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to continue to NewsFeedly</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-purple-600 focus:outline-none transition-colors" placeholder="your@email.com" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-purple-600 focus:outline-none transition-colors" placeholder="••••••••" />
          </div>

          <button onClick={handleSubmit} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-shadow">
            Sign In
          </button>

          <button onClick={onBack} className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Newspaper className="w-8 h-8" />
              <span className="text-2xl font-black">NewsFeedly</span>
            </div>
            <p className="text-white/70 mb-6">
              Your trusted source for breaking news, trending stories, and in-depth analysis.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={Facebook} />
              <SocialIcon icon={Twitter} />
              <SocialIcon icon={Instagram} />
              <SocialIcon icon={Linkedin} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white/70">
              <FooterLink text="About Us" />
              <FooterLink text="Contact" />
              <FooterLink text="Careers" />
              <FooterLink text="Advertise" />
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-white/70">
              <FooterLink text="Technology" />
              <FooterLink text="Business" />
              <FooterLink text="Sports" />
              <FooterLink text="Health" />
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-white/70 mb-4">Get daily updates</p>
            <div className="flex space-x-2">
              <input type="email" placeholder="Email" className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 focus:bg-white/20 focus:outline-none" />
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:shadow-lg transition-shadow">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm">© 2025 NewsFeedly. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </footer>
  );
};

const SocialIcon = ({ icon: Icon }) => (
  <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
    <Icon className="w-5 h-5" />
  </button>
);

const FooterLink = ({ text }) => (
  <li><a href="#" className="hover:text-white transition-colors">{text}</a></li>
);

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-shadow z-40">
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};

// Loading & Error
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
    </div>
    <p className="text-gray-600 dark:text-gray-400 text-lg mt-6 font-semibold">Loading...</p>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center space-x-2 py-12">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow">
        Previous
      </button>
      
      <span className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>
      
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow">
        Next
      </button>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    purple: 'from-purple-600 to-purple-700',
    pink: 'from-pink-600 to-pink-700',
    blue: 'from-blue-600 to-blue-700',
    red: 'from-red-600 to-red-700'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</div>
    </div>
  );
};

// Main App
const App = () => {
  const [category, setCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch news whenever category, search, or page changes
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      
      // Try to fetch live news from API
      const liveData = await fetchLiveNews(category, searchQuery, page);
      
      if (liveData) {
        // Successfully fetched from API
        setArticles(liveData.articles);
        setTotalResults(liveData.totalResults);
      } else {
        // Fallback to static data
        const filtered = getFilteredStaticArticles();
        setArticles(filtered);
        setTotalResults(filtered.length);
      }
      
      setLoading(false);
    };
    
    if (currentView === 'home') {
      loadNews();
    }
  }, [category, searchQuery, page, currentView]);

  const getFilteredStaticArticles = () => {
    let filtered = STATIC_NEWS;
    
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (category !== 'general') {
      filtered = filtered.filter(article => article.category === category);
    }
    
    return filtered;
  };

  const articlesPerPage = 12;
  const totalPages = Math.ceil(totalResults / articlesPerPage);
  const displayArticles = articles.slice(0, articlesPerPage);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSearchQuery('');
    setPage(1);
    setCurrentView('home');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCategory('general');
    setPage(1);
    setCurrentView('home');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'bookmarks':
        return <BookmarksView />;
      case 'history':
        return <HistoryView />;
      case 'trending':
        return <TrendingView />;
      case 'login':
        return <LoginView onBack={() => setCurrentView('home')} />;
      case 'home':
      default:
        return (
          <>
            <HeroSection />
            <CategoryFilter activeCategory={category} onCategoryChange={handleCategoryChange} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {searchQuery && (
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                    Results for: <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">"{searchQuery}"</span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{totalResults} articles found</p>
                </div>
              )}
              
              {loading ? (
                <LoadingSpinner />
              ) : displayArticles.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No articles found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try different keywords</p>
                </div>
              ) : (
                <>
                  {page === 1 && displayArticles[0] && (
                    <div className="mb-12">
                      <NewsCard article={displayArticles[0]} onClick={() => setSelectedArticle(displayArticles[0])} featured={true} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <StatCard icon={Newspaper} label="Total Articles" value={totalResults > 0 ? `${totalResults}+` : '50+'} color="purple" />
                    <StatCard icon={Eye} label="Daily Readers" value="500K+" color="pink" />
                    <StatCard icon={Globe} label="Countries" value="150+" color="blue" />
                    <StatCard icon={Award} label="Categories" value="7" color="red" />
                  </div>

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Stories</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayArticles.slice(page === 1 ? 1 : 0).map((article) => (
                      <NewsCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                  )}
                </>
              )}
            </main>
            
            <Footer />
          </>
        );
    }
  };

  return (
    <ThemeProvider>
      <UserProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {currentView !== 'login' && (
            <Navbar onSearch={handleSearch} currentView={currentView} setCurrentView={setCurrentView} />
          )}
          
          <div className={currentView !== 'login' ? 'pt-16' : ''}>
            {renderView()}
          </div>
          
          {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
        </div>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
