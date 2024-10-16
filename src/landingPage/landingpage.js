import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link para navegación interna

function LandingPage() {
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
              <li><Link to="/community">Comunidad</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
              <li><Link to="/login" className="sign-in">Iniciar Sesión</Link></li>
              <li><Link to="/register" className="register">Registrarse</Link></li> {/* Redirige al registro */}
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
          <div className="feature">
            <img src="musican3.jpg" alt="Músico 1" className="responsive-img" />
          </div>
          <div className="feature">
            <img src="musican2.jpg" alt="Músico 2" className="responsive-img" />
          </div>
        </section>

        <section className="services">
          <h2>¿Qué ofrecemos?</h2>
          <div className="service">
            <h3>Búsqueda de músicos</h3>
            <p>Los usuarios pueden buscar músicos filtrando por instrumento, género musical, experiencia y ubicación.</p>
          </div>
          <div className="service">
            <h3>Perfiles Personalizados</h3>
            <p>Cada músico puede crear un perfil con información sobre sus habilidades, experiencia y ejemplos de su trabajo.</p>
          </div>
          <div className="service">
            <h3>Conexión</h3>
            <p>Contacta a los músicos directamente desde sus perfiles para coordinar proyectos y colaborar en música.</p>
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
