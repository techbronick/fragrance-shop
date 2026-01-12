import React from "react";

const brands = [
  { name: "Tom Ford", logo: "/TomFord.webp" },
  { name: "Le Labo", logo: "/Lelabo.webp" },
  { name: "Creed", logo: "/Creed.webp" },
  { name: "Parfums de Marly", logo: "/pdmarly.webp" },
  { name: "Amouage", logo: "/Amouage.webp" },
  { name: "Xerjoff", logo: "/Xerjoff.webp" },
  { name: "Maison Francis Kurkdjian", logo: "/MaisonFrancis.webp" },
  { name: "Initio Parfums", logo: "/Initio.webp" },
];

const BrandLogosMarquee: React.FC = () => {
  // Triple the array for seamless looping
  const logos = [...brands, ...brands, ...brands];
  return (
    <div className="overflow-hidden py-2 bg-transparent relative w-full max-w-full">
      {/* Background layer with opacity effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-10" />
      <div className="relative w-full">
        <div className="flex animate-marquee whitespace-nowrap w-full">
          {logos.map((brand, idx) => (
            <img
              key={idx}
              src={brand.logo}
              alt={brand.name}
              className="h-32 w-auto object-contain inline-block select-none opacity-40 hover:opacity-60 transition-opacity duration-300 touch-manipulation"
              draggable={false}
              style={{ 
                margin: 0, 
                padding: 0,
                touchAction: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @media (max-width: 640px) {
          .animate-marquee {
            animation-duration: 15s;
          }
        }
        @media (max-width: 768px) {
          .animate-marquee img {
            height: 24px;
            max-width: 80px;
            touch-action: none;
            pointer-events: none;
          }
        }
      `}</style>
    </div>
  );
};

export default BrandLogosMarquee; 