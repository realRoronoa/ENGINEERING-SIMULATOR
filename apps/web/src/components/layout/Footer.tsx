import React from 'react';
import { Container } from '../ui/Container.js';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer>
      <Container>
        <div>
          <div className="tl">ENGINEERING VERIFICATION</div>
          <span className="mono">© {year}</span>
        </div>
        <div>
          <div className="tl">Product</div>
          <a href="#mission">Mission IDE</a>
          <a href="#evidence">Evidence Engine</a>
          <a href="#trust">Enterprise Trust</a>
        </div>
        <div>
          <div className="tl">Company</div>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <div>
          <div className="tl">Resources</div>
          <a href="#docs">Documentation</a>
          <a href="#research">Research</a>
        </div>
      </Container>
    </footer>
  );
};
