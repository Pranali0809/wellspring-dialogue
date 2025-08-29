import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					soft: 'hsl(var(--primary-soft))',
					light: 'hsl(var(--primary-light))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					soft: 'hsl(var(--success-soft))',
					light: 'hsl(var(--success-light))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					soft: 'hsl(var(--warning-soft))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					soft: 'hsl(var(--destructive-soft))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				hover: 'hsl(var(--hover))',
				active: 'hsl(var(--active))',
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					soft: 'hsl(var(--card-soft))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'healthcare-sm': 'var(--radius-sm)',
				'healthcare-lg': 'var(--radius-lg)',
				'healthcare-full': 'var(--radius-full)'
			},
			spacing: {
				'healthcare-xs': 'var(--space-xs)',
				'healthcare-sm': 'var(--space-sm)',
				'healthcare-md': 'var(--space-md)',
				'healthcare-lg': 'var(--space-lg)',
				'healthcare-xl': 'var(--space-xl)',
				'healthcare-2xl': 'var(--space-2xl)',
				'healthcare-3xl': 'var(--space-3xl)'
			},
			fontSize: {
				'healthcare-xs': 'var(--font-size-xs)',
				'healthcare-sm': 'var(--font-size-sm)',
				'healthcare-base': 'var(--font-size-base)',
				'healthcare-lg': 'var(--font-size-lg)',
				'healthcare-xl': 'var(--font-size-xl)',
				'healthcare-2xl': 'var(--font-size-2xl)',
				'healthcare-3xl': 'var(--font-size-3xl)'
			},
			boxShadow: {
				'healthcare-soft': 'var(--shadow-soft)',
				'healthcare-medium': 'var(--shadow-medium)',
				'healthcare-large': 'var(--shadow-large)',
				'healthcare-glow': 'var(--shadow-glow)'
			},
			transitionTimingFunction: {
				'healthcare-gentle': 'var(--ease-gentle)',
				'healthcare-bounce': 'var(--ease-bounce)'
			},
			transitionDuration: {
				'healthcare-base': 'var(--transition-base)',
				'healthcare-slow': 'var(--transition-slow)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-success': 'var(--gradient-success)',
				'gradient-soft': 'var(--gradient-soft)',
				'gradient-hero': 'var(--gradient-hero)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'healthcare-fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(8px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'healthcare-slide-up': {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'healthcare-scale-in': {
					from: {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'healthcare-pulse': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.7'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'healthcare-fade-in': 'healthcare-fade-in 0.3s var(--ease-gentle)',
				'healthcare-slide-up': 'healthcare-slide-up 0.3s var(--ease-gentle)',
				'healthcare-scale-in': 'healthcare-scale-in 0.2s var(--ease-bounce)',
				'healthcare-pulse': 'healthcare-pulse 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
