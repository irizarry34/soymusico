import React from 'react';

function LandingPage() {
  return (
    <div className="LandingPage">
      {/* Header Section */}
      <header>
        <div className="navbar">
          <div className="logo">
            <img src="logo.png" alt="SoyMusico Logo" />
          </div>
          <nav>
            <ul>
              <li><a href="#">Community</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#" className="sign-in">Sign In</a></li>
              <li><a href="#" className="register">Register</a></li>
            </ul>
          </nav>
        </div>
        <div className="hero">
          <div className="hero-text">
            <h1>SoyMúsico</h1>
          </div>
            <div className="hero-text1">
              <h2>Conecta con músicos</h2>
            </div>
          <div className="hero-image">
            <img src="monkey1.jpg" alt="Musicians working together" />
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main>
        <section className="features">
          <div className="feature">
            <img src="musican1.jpg" alt="Musician 1" />
          </div>
          <div className="feature">
            <img src="musican2.jpg" alt="Musician 2" />
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
            <h3>Conexión y Chat</h3>
            <p>Función de mensajería instantánea integrada para facilitar la conexión y coordinación entre usuarios.</p>
          </div>
        </section>
      </main>

      {/* Footer Section */}
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
