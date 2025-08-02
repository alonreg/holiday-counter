import { useState, useEffect, useRef } from 'react'

interface WowTitleProps {
  title: string
}

const WowTitle = ({ title }: WowTitleProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // Calculate relative position from center with subtle effect
        const deltaX = (e.clientX - centerX) * 0.075
        const deltaY = (e.clientY - centerY) * 0.075

        setMousePosition({ x: deltaX, y: deltaY })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full flex justify-center py-12 overflow-hidden perspective-1000">
      {/* Animated Background Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={`geo-${i}`}
            className="absolute opacity-10"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + Math.sin(currentTime * 0.001 + i) * 5}%`,
              transform: `rotate(${currentTime * 0.01 + i * 60}deg) scale(${
                0.6 + Math.sin(currentTime * 0.003 + i) * 0.2
              })`
            }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg opacity-40" />
          </div>
        ))}
      </div>

      {/* Enhanced sparkles with different sizes and colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => {
          const sparkleSize = Math.random() * 3 + 1
          const colors = [
            'bg-yellow-300',
            'bg-pink-300',
            'bg-blue-300',
            'bg-purple-300',
            'bg-cyan-300'
          ]
          return (
            <div
              key={`sparkle-${i}`}
              className={`absolute ${
                colors[i % colors.length]
              } rounded-full animate-pulse`}
              style={{
                width: `${sparkleSize}px`,
                height: `${sparkleSize}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                opacity: 0.6 + Math.random() * 0.4
              }}
            />
          )
        })}
      </div>

      {/* Main title container with 3D perspective */}
      <div
        ref={titleRef}
        className="relative transition-all duration-300 ease-out cursor-pointer transform-gpu"
        style={{
          transform: `
            translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)
            rotateX(${mousePosition.y * 0.05}deg)
            rotateY(${mousePosition.x * 0.05}deg)
            scale3d(${isHovered ? 1.04 : 1}, ${isHovered ? 1.04 : 1}, 1)
          `,
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Multiple layered glow effects */}
        <div
          className={`absolute inset-0 rounded-2xl transition-all duration-700 ${
            isHovered
              ? 'bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-400/20 blur-xl scale-110'
              : 'bg-gradient-to-r from-blue-400/8 via-purple-500/8 to-pink-400/8 blur-lg scale-102'
          }`}
          style={{
            animation: isHovered ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />

        {/* Secondary glow layer */}
        <div
          className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
            isHovered
              ? 'bg-gradient-to-r from-cyan-300/15 via-indigo-400/15 to-violet-400/15 blur-lg scale-105'
              : 'bg-gradient-to-r from-cyan-300/5 via-indigo-400/5 to-violet-400/5 blur-md'
          }`}
        />

        {/* Main title with reliable colors and optional gradient */}
        <h1
          className={`relative text-6xl md:text-7xl lg:text-8xl font-extrabold text-center leading-tight transition-all duration-700 ${
            isHovered ? 'text-blue-500' : 'text-purple-600'
          }`}
          style={{
            textShadow: isHovered
              ? `
                0 0 15px rgba(168, 85, 247, 0.6),
                0 0 25px rgba(168, 85, 247, 0.4),
                0 0 35px rgba(168, 85, 247, 0.2)
              `
              : `
                0 0 8px rgba(168, 85, 247, 0.4),
                0 0 15px rgba(168, 85, 247, 0.2)
              `,
            filter: isHovered
              ? 'brightness(1.2) contrast(1.1) saturate(1.1) drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))'
              : 'brightness(1.05) saturate(1.05) drop-shadow(0 0 5px rgba(168, 85, 247, 0.3))'
          }}
        >
          {title.split('').map((char, index) => (
            <span
              key={index}
              className="inline-block"
              style={{
                transform: isHovered
                  ? `translateY(${
                      Math.sin(currentTime * 0.01 + index * 0.3) * 1.5
                    }px) scale(${
                      1 + Math.sin(currentTime * 0.005 + index * 0.2) * 0.025
                    })`
                  : `translateY(${
                      Math.sin(currentTime * 0.005 + index * 0.2) * 0.5
                    }px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Enhanced floating particles */}
        {isHovered && (
          <>
            {[...Array(15)].map((_, i) => (
              <div
                key={`enhanced-particle-${i}`}
                className="absolute rounded-full opacity-80"
                style={{
                  width: `${4 + Math.random() * 6}px`,
                  height: `${4 + Math.random() * 6}px`,
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  background: `linear-gradient(45deg, 
                    hsl(${Math.random() * 360}, 70%, 60%), 
                    hsl(${Math.random() * 360}, 70%, 80%)
                  )`,
                  transform: `
                    translate(${Math.sin(currentTime * 0.01 + i) * 10}px, ${
                      Math.cos(currentTime * 0.01 + i) * 10
                    }px)
                    scale(${0.7 + Math.sin(currentTime * 0.008 + i) * 0.3})
                  `,
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                }}
              />
            ))}
          </>
        )}

        {/* Enhanced text stroke with multiple layers */}
        <h1
          className="absolute inset-0 text-6xl md:text-7xl lg:text-8xl font-extrabold text-center leading-tight text-transparent -z-10"
          style={{
            WebkitTextStroke: isHovered
              ? '3px rgba(255, 255, 255, 0.15)'
              : '2px rgba(255, 255, 255, 0.08)',
            filter: 'blur(0.5px)'
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  )
}

export default WowTitle
