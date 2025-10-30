import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const USERS = [
  { email: 'admin1@rossevita.com', password: 'rosse2025', name: 'Administrador', role: 'admin' },
  { email: 'admin2@rossevita.com', password: 'rosse2025', name: 'Administrador 2', role: 'admin' },
  { email: 'empleado1@rossevita.com', password: 'rosse2025', name: 'Juan Pérez', role: 'employee' },
  { email: 'empleado2@rossevita.com', password: 'rosse2025', name: 'Ana Gómez', role: 'employee' },
  { email: 'empleado3@rossevita.com', password: 'rosse2025', name: 'Carlos Ruiz', role: 'employee' },
  { email: 'empleado4@rossevita.com', password: 'rosse2025', name: 'María Rodriguez', role: 'employee' }
];

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const user = USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      toast({
        title: "¡Bienvenido!",
        description: `Inicio de sesión exitoso como ${user.name}`,
      });
      onLogin(user);
    } else {
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Rosse Vita Eventos</title>
        <meta name="description" content="Ingresa al sistema de gestión de eventos Rosse Vita" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-white to-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-pink-100">
            <div className="flex justify-center mb-6">
              <img 
                src="https://blogger.googleusercontent.com/img/a/AVvXsEiLjXSEEYTWugcR8F-Nm1FfBTZVY1hjfvRrQUK1sWxCGuxtKHgpsa85Om7uCvcsmZ9LQp9TVzMM7OiE_JjXVbISJuXw6D4EhMIQujIS96qHTADGcbZmx0VkGocywIQtbsci7FOFmr58pSaF8Cnt_9TFUGS6OQSO0lpE8a2sL-uaa8woFOliXjHUuuC4cpVd"
                alt="Rosse Vita Eventos Logo"
                className="h-24 w-auto"
              />
            </div>
            
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Bienvenido</h1>
            <p className="text-center text-gray-600 mb-8">Ingresa tus credenciales para continuar</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition-all">
                Iniciar Sesión
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Contraseña por defecto: <span className="font-semibold text-pink-600">rosse2025</span></p>
              <p className="mt-1 text-xs">Email de prueba: admin1@rossevita.com</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;