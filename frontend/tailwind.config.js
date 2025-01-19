module.exports = {
    
    theme: {
      extend: {},
    },
    plugins: [],
  };
  
module.exports = {
content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
theme: {
    extend: {
    fontFamily: {
        sans: ['Inter', 'sans-serif'],
    },
    colors: {
        primary: '#0074D9', // Add primary colors
        gray: {
        light: '#f5f5f5',
        DEFAULT: '#ccc',
        dark: '#333',
        },
    },
    },
},
};
