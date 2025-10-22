import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface HeroProps {
  onBookNowClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookNowClick }) => {
  const { branding } = useAppContext();

  const firstPartStyle: React.CSSProperties = {
    fontFamily: branding.heroTitleFirstPartStyle.fontFamily,
    fontSize: `${branding.heroTitleFirstPartStyle.fontSize}px`,
    color: branding.heroTitleFirstPartStyle.color,
    fontWeight: branding.heroTitleFirstPartStyle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.heroTitleFirstPartStyle.fontStyle,
  };

  const secondPartStyle: React.CSSProperties = {
    fontFamily: branding.heroTitleSecondPartStyle.fontFamily,
    fontSize: `${branding.heroTitleSecondPartStyle.fontSize}px`,
    color: branding.heroTitleSecondPartStyle.color,
    fontWeight: branding.heroTitleSecondPartStyle.fontWeight as React.CSSProperties['fontWeight'],
    fontStyle: branding.heroTitleSecondPartStyle.fontStyle,
  };

  const sloganStyle: React.CSSProperties = {
    fontFamily: branding.heroSloganStyle.fontFamily,
    fontSize: `${branding.heroSloganStyle.fontSize}px`,
    color: branding.heroSloganStyle.color,
    fontWeight: branding.heroSloganStyle.fontWeight,
    fontStyle: branding.heroSloganStyle.fontStyle,
  };


  return (
    <section className="relative bg-cover bg-center text-white" style={{ backgroundImage: `url('${branding.heroImageUrl}')` }}>
      <div className="absolute inset-0 bg-brand-dark opacity-50"></div>
      <div className="container mx-auto px-6 py-24 md:py-48 relative z-10 flex flex-col items-center text-center">
        <h2 className="drop-shadow-lg leading-tight" style={{ lineHeight: '1.1' }}>
          <span style={firstPartStyle}>{branding.salonNameFirstPart}</span>
          {branding.salonNameSecondPart && <span style={secondPartStyle}> {branding.salonNameSecondPart}</span>}
        </h2>
        <p className="mt-4 mb-8 max-w-2xl drop-shadow-md" style={sloganStyle}>
          {branding.slogan}
        </p>
        <button onClick={onBookNowClick} className="bg-brand-primary text-white font-sans py-3 px-8 rounded-full hover:bg-white hover:text-brand-primary border-2 border-transparent hover:border-brand-primary transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg btn-text-layout">
          Agende seu Horário
        </button>
      </div>
    </section>
  );
};

export default Hero;