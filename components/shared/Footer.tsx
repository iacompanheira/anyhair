import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

const Footer: React.FC = () => {
  const { branding } = useAppContext();

  const footerTextStyle: React.CSSProperties = {
    fontSize: `${branding.layout.footerText.fontSize}px`,
    fontWeight: branding.layout.footerText.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.layout.footerText.fontStyle,
  };
  
  return (
    <footer id="contact" className="bg-brand-dark text-brand-secondary py-8">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Any Hair</h3>
        <p className="mb-4" style={footerTextStyle}>Rua da Beleza, 123 - Centro, São Paulo - SP</p>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" aria-label="Instagram" className="text-brand-secondary hover:text-brand-accent transition-colors duration-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c-4.42 0-7.8 3.38-7.8 7.8s3.38 7.8 7.8 7.8 7.8-3.38 7.8-7.8S16.735 2 12.315 2zM1.803 9.815c0-4.42 3.38-7.8 7.8-7.8s7.8 3.38 7.8 7.8-3.38 7.8-7.8 7.8-7.8-3.38-7.8-7.8z" clipRule="evenodd"></path><path d="M12.315 5.815a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z"></path><path d="M17.815 5.315a1 1 0 100-2 1 1 0 000 2z"></path></svg>
          </a>
          <a href="#" aria-label="Facebook" className="text-brand-secondary hover:text-brand-accent transition-colors duration-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
          </a>
          <a href="#" aria-label="Chat" className="text-brand-secondary hover:text-brand-accent transition-colors duration-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.962 8.962 0 01-4.326-.977L2 17.5l.5-4.5A8.964 8.964 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.772 12.154a6.983 6.983 0 00-.175 1.406l-.2 1.802 1.802-.2c.49-.057.962-.175 1.406-.35A5.001 5.001 0 0110 15c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4c0 .884.286 1.696.772 2.154z" clipRule="evenodd"></path></svg>
          </a>
        </div>
        <p className="text-sm text-gray-400" style={footerTextStyle}>&copy; 2025 Any Hair. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;