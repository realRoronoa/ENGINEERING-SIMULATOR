import React from 'react';
import { Button } from '../ui/Button.js';
import { Container } from '../ui/Container.js';

export const Navbar: React.FC = () => {
  return (
    <nav>
      <Container>
        <a className="logo" href="#top">
          ◉ ENGINEERING<i>/</i>VERIFICATION
        </a>
        <div className="links">
          <a href="#mission">Mission</a>
          <a href="#evidence">Evidence</a>
          <a href="#manager">Candidates</a>
          <a href="#how">Method</a>
          <a href="#trust">Trust</a>
        </div>
        <Button variant="primary" size="sm" href="#pilot">
          REQUEST PILOT
        </Button>
      </Container>
    </nav>
  );
};
