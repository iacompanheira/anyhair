import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { navigate } from '../../router';
import { useRouter } from '../../hooks/useRouter';
import { HeaderManageIcon, HeaderStaffIcon } from '../ui/Icons';

interface HeaderProps {
    onStaffAccessClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStaffAccessClick }) => {
  const { branding, featureFlags } = useAppContext();
  const { view } = useRouter();

  const onManageClick = () => {
    if (featureFlags?.dashboard) {
        navigate('/dashboard');
    } else {
        alert('Acesso restrito.');
    }
  };

  const firstPartStyle: React.CSSProperties = {
    fontFamily: branding.headerTitleFirstPartStyle.fontFamily,
    color: branding.headerTitleFirstPartStyle.color,
    fontSize: `${branding.headerTitleFirstPartStyle.fontSize}px`,
    fontWeight: branding.headerTitleFirstPartStyle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.headerTitleFirstPartStyle.fontStyle,
  };

  const secondPartStyle: React.CSSProperties = {
    fontFamily: branding.headerTitleSecondPartStyle.fontFamily,
    color: branding.headerTitleSecondPartStyle.color,
    fontSize: `${branding.headerTitleSecondPartStyle.fontSize}px`,
    fontWeight: branding.headerTitleSecondPartStyle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.headerTitleSecondPartStyle.fontStyle,
  };

  const headerClasses = branding.isHeaderTransparent
    ? "bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-md"
    : "sticky top-0 z-50 shadow-md";

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (view !== 'home') {
      navigate('/');
    }
  };

  return (
    <header 
      className={headerClasses}
      style={!branding.isHeaderTransparent ? { backgroundColor: branding.headerBackgroundColor } : {}}
    >
      <div className="container mx-auto px-[1px] sm:px-6 py-1 flex justify-between items-center">
        <a href="#" onClick={handleLogoClick} className={`flex items-center gap-[0.5px] ${branding.logoPosition === 'right' ? 'flex-row-reverse' : ''}`} aria-label="Página inicial Any Hair">
          <div 
            className="bg-white rounded-full p-0.5 shadow-sm flex items-center justify-center"
            style={{
              transform: `translateY(${branding.logoVerticalOffset || 0}px)`
            }}
          >
              <img 
                  src={branding.logoUrl} 
                  alt="Logo Any Hair" 
                  className="w-auto" 
                  style={{ height: `${branding.logoSize}px` }} 
              />
          </div>
          <h1 className="font-bold whitespace-nowrap" style={{ lineHeight: '1' }}>
            <span style={firstPartStyle}>{branding.salonNameFirstPart}</span>
            {branding.salonNameSecondPart && <span style={secondPartStyle}> {branding.salonNameSecondPart}</span>}
          </h1>
        </a>
        <div className="flex items-center space-x-2">
            <button onClick={onStaffAccessClick} className="p-2 rounded-full hover:bg-brand-primary/10 transition-colors" aria-label="Acessar área do profissional">
                <HeaderStaffIcon />
            </button>
            {featureFlags?.dashboard && (
              <button onClick={onManageClick} className="p-2 rounded-full hover:bg-brand-primary/10 transition-colors" aria-label="Acessar painel de gerenciamento">
                <HeaderManageIcon />
              </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;