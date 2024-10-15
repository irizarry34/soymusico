import React from 'react';

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
              <li><a href="#">Busqueda</a></li>
              <li><a href="#">Comunidad</a></li>
              <li><a href="#">Contacto</a></li>
              <li><a href="#" className="sign-in">Iniciar Sesión</a></li>
              <li><a href="#" className="register">Registrarse</a></li>
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
            <img src="monkey2.jpg" alt="Músicos trabajando juntos" className="responsive-img" />
          </div>
        </div>
      </header>

      {/* Sección Principal */}
      <main>
        <section className="features">
          <div className="feature">
            <img src="musican1.jpg" alt="Músico 1" className="responsive-img" />
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
          <a href="#"><i className="icon-instagram"></i></a>
          <a href="#"><i className="icon-youtube"></i></a>
          <a href="#"><i className="icon-linkedin"></i></a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
