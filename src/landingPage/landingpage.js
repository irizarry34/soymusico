import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Importa Link para navegación interna
import { supabase } from '../supabaseClient'; // Importa supabase para verificar la autenticación



function LandingPage() {
  const [user, setUser] = useState(null);

  // Verificar si hay un usuario autenticado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user); // Establece el usuario si está autenticado
    };
    checkUser();
  }, []);

  // Manejar el cierre de sesión y recargar la página
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Recarga la página después de cerrar sesión
  };

  return (
    <div className="LandingPage">
      {/* Sección de Encabezado */}
      <header>
        <div className="navbar">
          <div className="logo">
            <img src="Subject.png" alt="Logo SoyMusico" className="responsive-img" />
          </div>
          <nav>
            <ul>
              <li><Link to="/search">Búsqueda</Link></li>
              {/* Mostrar enlace "Perfil" si el usuario está autenticado */}
              {user ? (
                <>
                  <li><Link to="/profile">Perfil</Link></li> {/* Enlace al perfil si el usuario ha iniciado sesión */}
                  <li><button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Iniciar Sesión</Link></li> {/* Aquí el link hacia la página de login */}
                  <li><Link to="/register" className="register">Registrarse</Link></li> {/* Redirige al registro */}
                </>
              )}
            </ul>
          </nav>
        </div>
        <div className="hero">
          <div className="hero-text">
            <h1>SoyMúsico</h1>
          </div>
          <div className="hero-text1">
            <h2>Conecta con músicos...</h2>
          </div>
          <div className="hero-image">
            <img src="banner2.jpg" alt="Músicos trabajando juntos" className="responsive-img" />
          </div>
        </div>
      </header>

      {/* Sección Principal */}
      <main>
        <section className="features">
          {/* Primera imagen - Búsqueda */}
          <div className="feature">
            <Link to="/search">
              <div className="image-container">
                <img src="musican3.jpg" alt="Músico 1" className="responsive-img" />
                <div className="image-title">Búsqueda</div> {/* Título para la imagen */}
              </div>
            </Link>
          </div>
          {/* Nueva imagen central - Registrarse */}
          <div className="feature">
            <Link to="/register">
              <div className="image-container">
                <img src="musican1.jpg" alt="Registrarse" className="responsive-img" />
                <div className="image-title">Registrarse</div> {/* Título para la imagen */}
              </div>
            </Link>
          </div>
          {/* Segunda imagen - Contacto */}
          <div className="feature">
            <Link to="/login">
              <div className="image-container">
                <img src="musican2.jpg" alt="Músico 2" className="responsive-img" />
                <div className="image-title">Iniciar Sesión</div> {/* Título para la imagen */}
              </div>
            </Link>
          </div>
        </section>

        <section className="services">
          <h2>¿Qué ofrecemos?</h2>
          <div className="service">
            <h3>Búsqueda de músicos</h3>
            <p>Busca músicos por instrumentos, género musical o información de contacto.</p>
          </div>
          <div className="service">
            <h3>Perfiles Personalizados</h3>
            <p>Crea un perfil con tus habilidades, experiencia y muestra tu talento al mundo.</p>
          </div>
          <div className="service">
            <h3>Conexión Directa</h3>
            <p>Contacta a músicos desde sus perfiles y colabora fácilmente en proyectos musicales.</p>
          </div>
        </section>
      </main>

      {/* Sección de Pie de Página */}
      <footer>
        <div className="social-media">
          <a href="https://instagram.com"><i className="icon-instagram"></i></a>
          <a href="https://youtube.com"><i className="icon-youtube"></i></a>
          <a href="https://linkedin.com"><i className="icon-linkedin"></i></a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
